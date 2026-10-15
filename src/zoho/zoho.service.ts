import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface ZohoContactPerson {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface ZohoLineItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  tax_id?: string;
  tax_name?: string;
  tax_percentage?: number;
}

export interface ZohoInvoiceRequest {
  customer_id: string;
  date: string;
  due_date?: string;
  reference_number?: string;
  line_items: ZohoLineItem[];
  terms?: string;
  notes?: string;
  customer_name?: string;
  contact_persons?: string[];
  send?: boolean;
}

export interface ZohoInvoiceResult {
  success: boolean;
  invoice_id?: string;
  invoice_number?: string;
  invoice_url?: string;
  error?: string;
}

export interface ZohoSendInvoiceEmailRequest {
  email_ids: string[];
  invoice_email_options?: {
    reminders?: boolean;
    attachments?: boolean;
  };
  message?: string;
  subject?: string;
}

export interface CheckoutInvoiceData {
  bookingRef: string;
  amount: number;
  currency: string;
  guestEmail?: string | null;
  guestName: string;
  guestPhone?: string | null;
  propertyName: string;
  checkIn?: Date | string | null;
  checkOut?: Date | string | null;
  guests?: number;
}

interface ZohoTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  api_domain?: string;
  error?: string;
  error_description?: string;
}

interface ZohoContact {
  contact_id: string;
  contact_name?: string;
  email?: string;
  contact_persons?: Array<{
    email?: string;
    first_name?: string;
    last_name?: string;
  }>;
}

interface ZohoContactResponse {
  contact?: {
    contact_id: string;
    contact_name?: string;
    contact_persons?: Array<{
      email?: string;
      first_name?: string;
      last_name?: string;
    }>;
  };
  contacts?: ZohoContact[];
}

interface ZohoInvoice {
  invoice_id: string;
  invoice_number?: string;
  invoice_url?: string;
  [key: string]: unknown;
}

interface ZohoInvoiceResponse {
  invoice?: ZohoInvoice;
}

const TOKEN_TTL_MS = 50 * 60 * 1000;

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);
  private readonly apiClient: AxiosInstance;
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;
  private readonly organizationId: string;
  private readonly useSandbox: boolean;
  private readonly enabled: boolean;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private config: ConfigService) {
    this.useSandbox = config.get<string>('ZOHO_USE_SANDBOX') === 'true';
    this.enabled = config.get<boolean>('ZOHO_INVOICE_ENABLED') ?? true;

    const accountDomain = this.useSandbox
      ? 'https://sandbox.accounts.zoho.com'
      : 'https://accounts.zoho.com';
    const apiDomain = this.useSandbox
      ? 'https://sandbox.zohoapis.com'
      : 'https://www.zohoapis.com';
    const apiVersion = 'invoice/v3';

    this.tokenUrl = `${accountDomain}/oauth/v2/token`;
    this.clientId = config.get<string>('ZOHO_CLIENT_ID') || '';
    this.clientSecret = config.get<string>('ZOHO_CLIENT_SECRET') || '';
    this.refreshToken = config.get<string>('ZOHO_REFRESH_TOKEN') || '';
    this.organizationId = config.get<string>('ZOHO_ORGANIZATION_ID') || '';

    this.apiClient = axios.create({
      baseURL: `${apiDomain}/${apiVersion}`,
      timeout: 30_000,
    });
  }

  isEnabled(): boolean {
    return (
      this.enabled &&
      !!this.clientId &&
      !!this.clientSecret &&
      !!this.refreshToken &&
      !!this.organizationId
    );
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    if (!this.refreshToken) {
      throw new Error('ZOHO_REFRESH_TOKEN is not configured');
    }

    this.logger.log('Refreshing Zoho OAuth2 access token...');

    const params = new URLSearchParams();
    params.append('refresh_token', this.refreshToken);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post<ZohoTokenResponse>(this.tokenUrl, null, {
      params,
    });
    const data = response.data;

    if (!data.access_token) {
      this.logger.error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
      throw new Error(
        data.error_description || 'Failed to refresh Zoho access token',
      );
    }

    this.cachedToken = data.access_token;
    this.tokenExpiresAt =
      now + (data.expires_in ? data.expires_in * 1000 : TOKEN_TTL_MS);
    this.logger.log('Zoho access token refreshed successfully');
    return data.access_token;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.cachedToken) {
      throw new Error(
        'Access token not available. Ensure getAccessToken() was called first.',
      );
    }
    return {
      Authorization: `Zoho-oauthtoken ${this.cachedToken}`,
      'X-com-zoho-invoice-organizationid': this.organizationId,
    };
  }

  async createInvoiceAndSend(
    data: CheckoutInvoiceData,
  ): Promise<ZohoInvoiceResult> {
    if (!this.isEnabled()) {
      this.logger.warn(
        'Zoho integration is not configured. Skipping invoice creation.',
      );
      return { success: false, error: 'Zoho integration not configured' };
    }

    await this.getAccessToken();

    try {
      const contactId = await this.findOrCreateContact(data);
      const invoice = await this.createInvoice(contactId, data);

      if (!invoice?.invoice_id) {
        return {
          success: false,
          error: 'Failed to create invoice in Zoho - no invoice_id returned',
        };
      }

      if (data.guestEmail) {
        await this.sendInvoiceEmail(invoice.invoice_id, data.guestEmail);
      }

      return {
        success: true,
        invoice_id: invoice.invoice_id,
        invoice_number: invoice.invoice_number,
        invoice_url: invoice.invoice_url,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Zoho invoice creation failed';
      this.logger.error(
        `Zoho invoice creation failed: ${errorMessage}`,
        (err as Record<string, unknown>)?.response ?? undefined,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async findOrCreateContact(
    data: CheckoutInvoiceData,
  ): Promise<string> {
    const nameParts = data.guestName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (data.guestEmail) {
      const existing = await this.searchContactByEmail(data.guestEmail);
      if (existing) {
        return existing;
      }
    }

    return await this.createContact(data, firstName, lastName);
  }

  private async searchContactByEmail(email: string): Promise<string | null> {
    try {
      const response = await this.apiClient.get<ZohoContactResponse>(
        '/contacts',
        {
          headers: this.getAuthHeaders(),
          params: { email, page: 1, per_page: 50 },
        },
      );

      const contacts = response.data?.contacts;
      if (contacts && contacts.length > 0) {
        const match = contacts.find(
          (c) =>
            c.email === email ||
            (c.contact_persons &&
              c.contact_persons.some((p) => p.email === email)),
        );
        if (match?.contact_id) {
          this.logger.log(`Found existing Zoho contact for email: ${email}`);
          return match.contact_id;
        }
        return contacts[0].contact_id;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Zoho contact search failed for ${email}: ${errorMessage}`,
      );
      return null;
    }
  }

  private async createContact(
    data: CheckoutInvoiceData,
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const contactPayload: Record<string, unknown> = {
      contact_name: data.guestName,
      contact_type: 'customer',
    };

    if (data.guestEmail) {
      contactPayload.contact_persons = [
        {
          first_name: firstName,
          last_name: lastName || firstName,
          email: data.guestEmail,
          phone: data.guestPhone || '',
        },
      ];
    }

    const response = await this.apiClient.post<ZohoContactResponse>(
      '/contacts',
      contactPayload,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      },
    );

    const contactId =
      response.data?.contact?.contact_id ||
      (response.data as unknown as { contact_id?: string })?.contact_id;

    if (!contactId) {
      throw new Error('Failed to create Zoho contact - no contact_id returned');
    }

    this.logger.log(
      `Created new Zoho contact for: ${data.guestName} (${contactId})`,
    );
    return contactId;
  }

  private async createInvoice(
    customerId: string,
    data: CheckoutInvoiceData,
  ): Promise<ZohoInvoice | null> {
    const amount = Math.round(data.amount / 100);
    const checkInStr = data.checkIn
      ? new Date(data.checkIn).toISOString().split('T')[0]
      : '';
    const checkOutStr = data.checkOut
      ? new Date(data.checkOut).toISOString().split('T')[0]
      : '';

    const lineItems: ZohoLineItem[] = [
      {
        name: data.propertyName || 'Accommodation Booking',
        description: `Booking ${data.bookingRef} | Check-in: ${checkInStr} | Check-out: ${checkOutStr} | Guests: ${data.guests ?? 1}`,
        quantity: 1,
        rate: amount,
      },
    ];

    const invoicePayload: Record<string, unknown> = {
      customer_id: customerId,
      date: new Date().toISOString().split('T')[0],
      reference_number: data.bookingRef,
      line_items: lineItems,
      terms: 'Payment due upon receipt.',
      notes: `Thank you for choosing Nearby Escapes. Your invoice for booking ${data.bookingRef} is ready.`,
    };

    const response = await this.apiClient.post<ZohoInvoiceResponse>(
      '/invoices',
      invoicePayload,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      },
    );

    const invoice = response.data?.invoice;
    if (!invoice) {
      throw new Error('Zoho invoice creation returned no invoice data');
    }

    this.logger.log(
      `Created Zoho invoice ${invoice.invoice_number} for booking ${data.bookingRef}`,
    );
    return invoice;
  }

  private async sendInvoiceEmail(
    invoiceId: string,
    emailId: string,
  ): Promise<void> {
    await this.apiClient.post(
      `/invoices/${invoiceId}/email`,
      { email_ids: [emailId] },
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Zoho invoice ${invoiceId} email sent to ${emailId}`);
  }
}
