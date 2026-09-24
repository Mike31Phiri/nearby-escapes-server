"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
// ─── Contact placeholder (update once finalized) ─────────────────────────────
const CONTACT_BLOCK = `
**Contact Information**

Nearby Escapes Travel Agency

Email: [To be confirmed]
Phone: [To be confirmed]
Address: [To be confirmed]
`.trim();
// ─── Policy definitions ───────────────────────────────────────────────────────
const POLICIES = [
    {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        type: 'PRIVACY_POLICY',
        description: 'Explains how Nearby Escapes collects, uses, discloses, stores, and protects personal information of platform users.',
        version: '1.0.0',
        effectiveDate: new Date('2026-08-03'),
        summary: 'Initial publication — 3 August 2026',
        content: `# Nearby Escapes Travel Agency — Privacy Policy

*Last Updated: 3 August 2026*

---

## 1. Introduction

Nearby Escapes Travel Agency ("Nearby Escapes", "we", "us", or "our") is committed to protecting the privacy and personal information of users of our platform.

This Privacy Policy explains how we collect, use, disclose, store, and protect personal information when you use our website, booking platform, or related services.

---

## 2. Information We Collect

We may collect the following information:

### a) Personal Information

- Name;
- Email address;
- Phone number;
- Identification information where reasonably necessary; and
- Other information required to provide our services.

### b) Booking Information

- Travel dates;
- Destinations;
- Accommodation or service preferences;
- Number of travellers;
- Special requests; and
- Other information necessary to process a booking.

### c) Payment Information

We may collect information relating to your payment method and transaction.

Where payments are processed through third-party payment providers, sensitive financial information may be handled directly by those providers.

Nearby Escapes does not intentionally store full card details where payment processing is handled by an external payment provider.

### d) Technical Information

We may collect technical information such as:

- IP address;
- Device information;
- Browser type;
- Website usage information;
- Cookies; and
- Analytics information.

---

## 3. How We Use Your Information

We may use personal information to:

- Process and manage bookings;
- Communicate booking information;
- Connect customers with service providers;
- Provide customer support;
- Process payments;
- Improve our website and services;
- Prevent fraud and misuse;
- Comply with legal obligations; and
- Send promotional communications where appropriate and permitted.

---

## 4. Sharing of Information

We may share relevant customer information with:

### a) Service Providers

Hotels, transport providers, tour operators, activity providers, and other businesses involved in fulfilling a booking.

Only information reasonably necessary to fulfil the relevant service should be shared.

### b) Payment Providers

Payment processors and financial service providers where necessary to process transactions.

### c) Legal Authorities

Information may be disclosed where required by law, regulation, court order, or other lawful process.

Nearby Escapes does not sell or rent customers' personal information.

---

## 5. Data Security

Nearby Escapes takes reasonable technical and organizational measures to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.

However, no online platform or electronic transmission can be guaranteed to be completely secure.

---

## 6. Data Retention

We retain personal information only for as long as reasonably necessary for purposes including:

- Fulfilling bookings;
- Providing customer support;
- Maintaining business records;
- Complying with legal and regulatory requirements; and
- Resolving disputes.

---

## 7. Cookies

Nearby Escapes may use cookies and similar technologies to:

- Improve website functionality;
- Remember preferences;
- Understand website traffic;
- Analyze platform performance; and
- Improve the user experience.

Users may be able to disable cookies through their browser settings, although doing so may affect certain website functions.

---

## 8. Your Privacy Rights

Subject to applicable law and reasonable verification requirements, you may have rights relating to your personal information, including the ability to:

- Request access to personal information we hold about you;
- Request correction of inaccurate information;
- Request deletion where legally applicable; and
- Contact us regarding the handling of your personal information.

---

## 9. Third-Party Websites

Our platform may contain links to third-party websites or services.

Nearby Escapes is not responsible for the privacy practices, security, or content of third-party websites.

Users should review the privacy policies of third-party websites before providing personal information.

---

## 10. Children's Privacy

Our services are not intentionally directed toward individuals under 18 without appropriate parental or guardian involvement.

Where a minor's information is required for a legitimate booking, it should be provided by or with the knowledge of the appropriate parent or guardian.

---

## 11. Changes to This Privacy Policy

Nearby Escapes may update this Privacy Policy periodically.

Any updates will be published with a revised "Last Updated" date.

---

## 12. ${CONTACT_BLOCK}
`,
    },
    {
        slug: 'service-provider-data-privacy-policy',
        title: 'Service Provider Data & Privacy Policy',
        type: 'PRIVACY_POLICY',
        description: 'Explains how Nearby Escapes collects, uses, stores, and protects information relating to businesses and individuals who provide services through the platform.',
        version: '1.0.0',
        effectiveDate: new Date('2026-08-03'),
        summary: 'Initial publication — 3 August 2026',
        content: `# Nearby Escapes Travel Agency — Service Provider Data & Privacy Policy

*Last Updated: 3 August 2026*

---

## 1. Introduction

This Service Provider Data & Privacy Policy explains how Nearby Escapes collects, uses, stores, and protects information relating to businesses and individuals who provide services through the Nearby Escapes platform.

---

## 2. Information We Collect

Nearby Escapes may collect:

- Business name;
- Registration and licensing details;
- Contact information;
- Business address;
- Service listings;
- Pricing and availability;
- Booking information;
- Performance and transaction data; and
- Other information reasonably necessary to operate the partnership.

---

## 3. How We Use Provider Data

Provider information may be used to:

- Facilitate customer bookings;
- Display and promote provider services;
- Communicate with Service Providers;
- Manage partnerships;
- Monitor platform performance;
- Improve our services; and
- Meet legal and regulatory obligations.

---

## 4. Sharing of Provider Data

We may share relevant Service Provider information with:

- Customers where necessary to fulfil a booking;
- Payment processors and financial service providers where applicable;
- Service partners involved in fulfilling bookings; and
- Government authorities or other parties where required by law.

Nearby Escapes does not sell Service Provider data.

---

## 5. Data Protection

Nearby Escapes takes reasonable steps to protect Service Provider information against unauthorized access, misuse, loss, or disclosure.

Service Providers are also responsible for protecting customer information they receive through the Nearby Escapes platform.

---

## 6. Service Provider Responsibilities

Service Providers must:

- Use customer information only for fulfilling bookings and legitimate service-related purposes;
- Protect customer information from unauthorized access;
- Not sell or unlawfully share customer information;
- Not use customer information for unrelated marketing without appropriate consent; and
- Comply with applicable privacy and data protection requirements.

---

## 7. Data Retention

Nearby Escapes may retain Service Provider information for as long as reasonably necessary for:

- Business operations;
- Booking records;
- Financial and accounting purposes;
- Legal and regulatory compliance;
- Dispute resolution; and
- Legitimate business purposes.

---

## 8. Changes to This Policy

Nearby Escapes may update this policy periodically.

Where appropriate, material changes may be communicated to Service Providers.

---

## 9. ${CONTACT_BLOCK}
`,
    },
    {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        type: 'TERMS_OF_SERVICE',
        description: 'Governs your access to and use of the Nearby Escapes website, booking platform, and related services.',
        version: '1.0.0',
        effectiveDate: new Date('2026-08-03'),
        summary: 'Initial publication — 3 August 2026',
        content: `# Nearby Escapes Travel Agency — Terms of Service

*Last Updated: 3 August 2026*

---

## 1. Introduction

Welcome to Nearby Escapes Travel Agency ("Nearby Escapes", "we", "us", or "our").

These Terms of Service ("Terms") govern your access to and use of the Nearby Escapes website, booking platform, and related services.

By accessing or using our platform, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use our platform or services.

---

## 2. Nature of Our Services

Nearby Escapes operates as a travel agency and booking platform that connects customers with independent third-party service providers.

These providers may include, but are not limited to:

- Hotels, lodges, guesthouses, and other accommodation providers;
- Transport and bus operators;
- Tour and activity operators;
- Restaurants and food and beverage providers; and
- Other tourism and travel-related businesses.

Unless expressly stated otherwise, Nearby Escapes does not own, operate, or directly control the services provided by these third parties.

Nearby Escapes primarily acts as a booking and marketing intermediary between customers and service providers.

---

## 3. Eligibility

By using Nearby Escapes, you confirm that:

- You are at least 18 years old, or have the consent of a parent or legal guardian where applicable;
- You have the legal capacity to enter into agreements; and
- The information you provide to Nearby Escapes is accurate and complete.

---

## 4. Bookings and Reservations

All bookings are subject to availability and confirmation.

A booking is considered confirmed only when:

1. The required payment or deposit has been successfully received; and
2. Nearby Escapes or the relevant service provider has issued a booking confirmation.

Customers are responsible for providing accurate information when making a booking, including names, contact details, travel dates, destinations, and any other information required to fulfill the booking.

Nearby Escapes reserves the right to cancel or refuse a booking where information provided is false, incomplete, fraudulent, or otherwise invalid.

---

## 5. Pricing and Payments

Prices displayed on the Nearby Escapes platform may change from time to time before a booking is confirmed.

Once a booking has been confirmed and payment received, the applicable confirmed booking price will generally apply, subject to any changes permitted under the relevant provider's terms.

Payments may be made using payment methods supported by Nearby Escapes, including:

- Mobile money;
- Bank transfer;
- Card payments; and
- Other approved payment methods.

Depending on the service, either full or partial payment may be required.

Failure to complete a required payment within the applicable timeframe may result in cancellation of the booking.

---

## 6. Third-Party Service Providers

Services booked through Nearby Escapes are generally provided by independent third-party service providers.

Each provider is responsible for:

- The quality and delivery of its services;
- The safety of customers while receiving its services;
- Maintaining required licenses and permits;
- Providing accurate service information; and
- Complying with applicable laws and regulations.

By making a booking, you acknowledge that the terms and conditions of the relevant service provider may also apply to your booking.

---

## 7. Cancellations and Refunds

### 7.1 Third-Party Services

Cancellation and refund policies for third-party services are determined by the relevant service provider.

This means that hotels, lodges, transport providers, activity operators, and other third-party providers may each have different cancellation deadlines, refund conditions, deposit rules, and non-refundable charges.

The applicable cancellation and refund policy will be communicated or made available to the customer before or at the time of booking where reasonably possible.

Where a third-party provider controls the cancellation or refund decision:

- Nearby Escapes will communicate the applicable policy to the customer;
- Customers must comply with the provider's cancellation requirements;
- Nearby Escapes may assist in facilitating a refund request;
- Nearby Escapes does not guarantee a refund where the provider's policy does not allow one; and
- Any refund issued will be subject to the provider's approved refund amount and conditions.

Where applicable, payment processing, administrative, or other permitted fees may be deducted from a refund.

### 7.2 Nearby Escapes Service Fees

Where Nearby Escapes charges a separate booking, administrative, convenience, service, or processing fee for facilitating a booking, that fee is generally non-refundable once the relevant service has been provided or the booking process has been completed.

However, Nearby Escapes may provide a refund of its own fee where:

- Nearby Escapes cancels a service that it directly controls;
- A payment was made more than once due to a verified technical or processing error;
- Nearby Escapes is unable to provide the service for which the fee was specifically charged; or
- A refund is otherwise required by applicable law.

Where a customer cancels a booking for reasons unrelated to an error or failure by Nearby Escapes, the Nearby Escapes service fee may remain non-refundable.

### 7.3 Services Directly Operated by Nearby Escapes

If Nearby Escapes directly operates or sells its own travel services, tours, transport, experiences, or packages in the future, the cancellation and refund terms applicable to those services will be clearly stated at the time of booking.

Where Nearby Escapes itself cancels such a service, customers will be informed of the available options, which may include:

- Rescheduling;
- An alternative service; or
- A refund for the affected portion of the service, subject to the applicable terms.

### 7.4 Refund Processing

Where a refund is approved, refunds will generally be processed using the original payment method where reasonably possible.

The time required for a refund to reach the customer may depend on the payment method, payment processor, bank, mobile money provider, or third-party service provider involved.

---

## 8. Changes and Modifications to Bookings

Third-party providers may change, modify, or cancel bookings due to circumstances including:

- Weather conditions;
- Operational difficulties;
- Maintenance;
- Safety concerns;
- Unavailability; or
- Other unforeseen circumstances.

Nearby Escapes will make reasonable efforts to notify affected customers and, where possible, assist in arranging an alternative.

Nearby Escapes cannot guarantee that an alternative service will always be available.

---

## 9. Customer Responsibilities

Customers agree to:

- Provide accurate and complete information;
- Make required payments on time;
- Comply with applicable laws and regulations;
- Follow the rules and policies of service providers;
- Treat service providers and their staff respectfully; and
- Use the Nearby Escapes platform lawfully and responsibly.

Failure to comply with provider rules or applicable requirements may result in the customer being denied a service without a refund where the applicable provider's policy permits this.

---

## 10. Limitation of Liability

To the fullest extent permitted by applicable law, Nearby Escapes shall not be responsible for losses, injury, damage, delays, cancellations, disruptions, or inconvenience arising from the acts or omissions of independent third-party service providers.

This includes, where applicable:

- Delays or cancellations by transport providers;
- Changes to accommodation or activities by providers;
- Loss, damage, or injury occurring during third-party services;
- Incorrect information supplied by third-party providers; and
- Failure by a third-party provider to deliver a service as expected.

Customers acknowledge that travel and tourism activities may involve inherent risks and that services provided by third parties are undertaken subject to the relevant provider's terms and conditions.

Nothing in these Terms excludes or limits any liability that cannot legally be excluded or limited under applicable law.

---

## 11. Intellectual Property

All content belonging to Nearby Escapes, including our name, logo, branding, website design, text, original photographs, graphics, and other original materials, is protected by applicable intellectual property laws unless otherwise stated.

Unauthorised copying, reproduction, modification, distribution, or commercial use is prohibited.

---

## 12. User-Generated Content

Users may have the ability to submit reviews, comments, photographs, ratings, or other content ("User Content") to the Nearby Escapes platform.

By submitting User Content, you agree that:

### a) Acceptable Use

You will not submit content that:

- Is false, misleading, defamatory, or fraudulent;
- Contains abusive, offensive, or inappropriate language;
- Contains hate speech, discrimination, or harassment;
- Contains explicit or sexually inappropriate material;
- Promotes illegal activity;
- Violates another person's rights; or
- Violates applicable laws or regulations.

### b) Photos and Media

Users must not upload images or media that:

- Are explicit or sexually inappropriate;
- Promote violence or illegal activity;
- Infringe another person's intellectual property, privacy, or other rights; or
- Misrepresent a location, service, property, or experience.

### c) Respectful Conduct

Users are expected to behave respectfully when interacting with Nearby Escapes, service providers, and other users.

### d) Content Rights

By submitting User Content, you grant Nearby Escapes a non-exclusive, royalty-free right to use, display, reproduce, and share that content for purposes connected with operating, promoting, and improving the platform.

You confirm that you have the necessary rights and permissions to submit the content.

### e) Moderation

Nearby Escapes reserves the right to review, edit, restrict, or remove User Content that violates these Terms or is otherwise inappropriate for the platform.

### f) Violations

Violations may result in:

- Removal of content;
- Suspension or termination of an account;
- Restriction of platform access; and/or
- Further action where appropriate or legally permitted.

---

## 13. Privacy

Your use of Nearby Escapes is also subject to our Privacy Policy, which explains how we collect, use, store, and protect personal information.

---

## 14. Suspension and Termination

Nearby Escapes reserves the right to suspend, restrict, or terminate access to the platform where a user:

- Violates these Terms;
- Engages in fraudulent or unlawful activity;
- Misuses the platform;
- Provides false information; or
- Engages in conduct that may harm Nearby Escapes, its customers, or service providers.

---

## 15. Third-Party Links

The Nearby Escapes platform may contain links to websites or services operated by third parties.

Nearby Escapes is not responsible for the content, security, availability, or privacy practices of third-party websites.

---

## 16. Governing Law

These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Zambia.

---

## 17. Changes to These Terms

Nearby Escapes may update these Terms from time to time.

Where appropriate, material changes may be communicated through the platform or other reasonable means.

Continued use of the platform after updated Terms have been published constitutes acceptance of the revised Terms.

---

## 18. ${CONTACT_BLOCK}
`,
    },
    {
        slug: 'service-provider-terms-and-conditions',
        title: 'Service Provider Terms & Conditions',
        type: 'HOST_STANDARDS',
        description: 'Governs the relationship between Nearby Escapes and any business or individual that lists, promotes, or offers services through the platform.',
        version: '1.0.0',
        effectiveDate: new Date('2026-08-03'),
        summary: 'Initial publication — 3 August 2026',
        content: `# Nearby Escapes Travel Agency — Service Provider Terms & Conditions

*Last Updated: 3 August 2026*

---

## 1. Introduction

These Service Provider Terms & Conditions ("Agreement") govern the relationship between Nearby Escapes Travel Agency ("Nearby Escapes", "we", "us", or "our") and any business or individual ("Service Provider", "you", or "your") that lists, promotes, or offers services through the Nearby Escapes platform.

By partnering with Nearby Escapes or listing services on our platform, you agree to comply with this Agreement.

---

## 2. Nature of the Relationship

Nearby Escapes operates as a travel agency and booking intermediary.

Service Providers remain independent businesses or individuals responsible for their own operations and services.

Nothing in this Agreement creates or is intended to create:

- An employment relationship;
- A partnership;
- A joint venture;
- An agency relationship beyond the booking and promotional authority expressly agreed between the parties; or
- An ownership relationship between Nearby Escapes and the Service Provider.

---

## 3. Services

Service Providers may offer tourism-related services through Nearby Escapes, including:

- Accommodation;
- Transport;
- Tours and activities;
- Food and beverage services; and
- Other travel or tourism-related services approved by Nearby Escapes.

Nearby Escapes may:

- List and promote Service Provider offerings;
- Facilitate customer bookings;
- Connect customers with Service Providers;
- Process or facilitate payments where applicable; and
- Provide reasonable customer support relating to bookings.

---

## 4. Service Provider Responsibilities

Service Providers agree to:

### a) Accuracy of Information

Provide accurate and up-to-date:

- Service descriptions;
- Prices and rates;
- Availability;
- Photos and media;
- Terms and conditions; and
- Other information provided to Nearby Escapes or customers.

Service Providers must promptly update Nearby Escapes when information changes.

### b) Service Quality

Service Providers must:

- Deliver services substantially as advertised;
- Maintain reasonable professional standards;
- Honour confirmed bookings; and
- Provide customers with the service they have booked and paid for.

### c) Legal and Regulatory Compliance

Service Providers must maintain all licenses, permits, registrations, certificates, and approvals required to legally operate their services in Zambia.

Service Providers must comply with applicable Zambian laws and regulations.

### d) Customer Experience

Service Providers must:

- Treat customers professionally and respectfully;
- Maintain appropriate standards of conduct;
- Respond to customer issues and complaints responsibly; and
- Cooperate with Nearby Escapes in resolving booking-related concerns.

---

## 5. Pricing and Commission

Service Providers agree to provide Nearby Escapes with accurate and agreed pricing.

Service Providers must honour the agreed rates for confirmed bookings.

Nearby Escapes and the Service Provider may agree separately on:

- Commission arrangements;
- Markups;
- Revenue-sharing arrangements;
- Promotional rates; or
- Other commercial terms.

Any agreed commission or commercial arrangement may be recorded separately or incorporated into the Service Provider's onboarding or partnership agreement.

---

## 6. Bookings and Fulfilment

Nearby Escapes may facilitate bookings between customers and Service Providers.

The Service Provider remains responsible for:

- Confirming availability;
- Fulfilling confirmed bookings;
- Delivering the booked service;
- Managing on-the-ground operations;
- Maintaining appropriate staffing and facilities; and
- Addressing operational issues affecting customers.

Failure to fulfil confirmed bookings without an acceptable reason may result in:

- Customer refunds where applicable;
- Financial or other penalties where agreed;
- Temporary suspension; and/or
- Removal from the Nearby Escapes platform.

---

## 7. Cancellations and Refunds

Each Service Provider must establish and clearly communicate its cancellation and refund policy to Nearby Escapes.

Policies should specify, where applicable:

- Cancellation deadlines;
- Refund eligibility;
- Non-refundable payments;
- Deposits;
- No-show policies;
- Changes to bookings; and
- Any applicable cancellation charges.

Where a customer cancels a booking, the refund will generally be determined according to the Service Provider's stated cancellation and refund policy.

Service Providers must notify Nearby Escapes promptly of cancellations or significant changes affecting confirmed bookings.

Where a refund is due, the Service Provider must cooperate with Nearby Escapes to facilitate the refund process.

---

## 8. Liability and Indemnity

Service Providers are responsible for:

- The delivery of their services;
- Customer safety in connection with their services;
- Their employees, contractors, agents, and operations;
- Compliance with applicable laws and regulations; and
- The accuracy of information supplied to Nearby Escapes.

To the fullest extent permitted by law, Nearby Escapes shall not be responsible for injuries, losses, damages, delays, or other claims arising from the Service Provider's acts, omissions, negligence, misconduct, or failure to deliver services.

The Service Provider agrees to indemnify and hold Nearby Escapes harmless, to the extent permitted by law, against claims, losses, liabilities, damages, costs, and expenses arising from:

- Negligence;
- Misrepresentation;
- Breach of applicable laws or regulations;
- Failure to deliver confirmed services;
- Misconduct; or
- Breach of these Terms by the Service Provider.

---

## 9. Insurance

Service Providers are strongly encouraged to maintain appropriate insurance coverage relevant to their operations, including liability and other operational insurance where appropriate.

Nearby Escapes may request evidence of insurance where reasonably necessary for a particular service or partnership.

---

## 10. Use of Content

Service Providers grant Nearby Escapes permission to use photographs, videos, logos, descriptions, business information, and other marketing materials supplied by the Service Provider for purposes including:

- Listing the service on the Nearby Escapes platform;
- Marketing and advertising;
- Social media promotion;
- Promotional campaigns; and
- General platform operations.

Service Providers confirm that they have the necessary rights and permissions to provide this content to Nearby Escapes.

---

## 11. Content and Conduct Standards

Service Providers must maintain professional and appropriate conduct when using the Nearby Escapes platform.

### a) Acceptable Content

All photos, videos, descriptions, and other content must:

- Accurately represent the property, business, or service;
- Be appropriate for the platform;
- Not contain explicit or offensive material; and
- Not be misleading or deceptive.

### b) Professional Conduct

Service Providers agree to:

- Communicate respectfully with customers;
- Avoid discriminatory, abusive, threatening, or inappropriate behaviour;
- Treat customers fairly; and
- Deliver services professionally and ethically.

### c) Images and Media

All images and media supplied must:

- Accurately represent the property or service;
- Be owned by the Service Provider or used with appropriate permission; and
- Not contain inappropriate or misleading visuals.

### d) Platform Integrity

Service Providers must not:

- Engage in fraudulent practices;
- Post misleading information;
- Manipulate reviews or ratings;
- Create fake reviews;
- Misrepresent their services; or
- Attempt to unfairly manipulate the Nearby Escapes platform.

### e) Enforcement

Nearby Escapes reserves the right to:

- Remove inappropriate or misleading content;
- Suspend listings;
- Restrict platform access;
- Suspend partnerships; and/or
- Terminate partnerships where appropriate.

---

## 12. Platform Usage and Non-Circumvention

Service Providers must not intentionally circumvent Nearby Escapes in relation to confirmed bookings originating through the platform for the purpose of avoiding agreed commissions, fees, or other commercial arrangements.

Service Providers must also not:

- Provide customers with misleading information about Nearby Escapes;
- Use the platform for fraudulent activity;
- Attempt to manipulate booking records; or
- Misuse customer information obtained through Nearby Escapes.

---

## 13. Confidentiality

Both Nearby Escapes and Service Providers agree to take reasonable steps to protect confidential business information received from the other party.

Confidential information should not be disclosed to third parties without appropriate authorization, except where disclosure is required by law or reasonably necessary to fulfill a booking or legal obligation.

---

## 14. Data Protection and Customer Information

Service Providers may receive customer information necessary to fulfil bookings.

Service Providers must:

- Use customer information only for legitimate booking and service-related purposes;
- Protect customer information against unauthorized access;
- Not sell or unlawfully share customer information;
- Not use customer information for unrelated marketing without appropriate consent; and
- Comply with applicable data protection and privacy requirements.

---

## 15. Suspension and Termination

Nearby Escapes reserves the right to suspend or remove Service Providers for reasons including:

- Poor or unsafe service;
- Repeated customer complaints;
- Misconduct;
- Fraudulent activity;
- Misrepresentation;
- Failure to honour confirmed bookings;
- Breach of these Terms; or
- Failure to maintain required licenses or permits.

Service Providers may terminate their partnership with Nearby Escapes by providing reasonable notice, subject to any existing confirmed bookings or separate commercial agreements.

Termination does not automatically release either party from obligations relating to bookings already confirmed or liabilities arising before termination.

---

## 16. Governing Law

This Agreement shall be governed by and interpreted in accordance with the laws of the Republic of Zambia.

---

## 17. Amendments

Nearby Escapes may update these Terms from time to time.

Where appropriate, material changes may be communicated to Service Providers.

Continued participation on the Nearby Escapes platform after updated Terms have taken effect constitutes acceptance of the revised Terms.

---

## 18. ${CONTACT_BLOCK}
`,
    },
];
// ─── Seed runner ─────────────────────────────────────────────────────────────
async function main() {
    // Find the admin user to set as creator
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminId = admin?.id ?? null;
    if (adminId) {
        console.log(`Using admin: ${admin?.email} (${adminId})`);
    }
    else {
        console.warn('No ADMIN user found — policies will be seeded without a createdById.');
    }
    let created = 0;
    let skipped = 0;
    for (const policy of POLICIES) {
        // Upsert the policy master record
        const existing = await prisma.policy.findUnique({ where: { slug: policy.slug } });
        if (existing) {
            // Check if the initial version already exists — if so, skip entirely
            const versionExists = await prisma.policyVersion.findUnique({
                where: { policyId_version: { policyId: existing.id, version: policy.version } },
            });
            if (versionExists) {
                console.log(`  SKIP  "${policy.title}" — already seeded`);
                skipped++;
                continue;
            }
            // Policy exists but version missing — create the version only
            await prisma.policyVersion.create({
                data: {
                    policyId: existing.id,
                    version: policy.version,
                    content: policy.content,
                    summary: policy.summary,
                    effectiveDate: policy.effectiveDate,
                    createdById: adminId,
                },
            });
            console.log(`  PATCH "${policy.title}" — version ${policy.version} added`);
            created++;
            continue;
        }
        // Create policy + initial version in a transaction
        await prisma.$transaction(async (tx) => {
            const created_policy = await tx.policy.create({
                data: {
                    slug: policy.slug,
                    title: policy.title,
                    type: policy.type,
                    description: policy.description,
                    isPublished: true,
                    currentVersion: policy.version,
                    createdById: adminId,
                },
            });
            await tx.policyVersion.create({
                data: {
                    policyId: created_policy.id,
                    version: policy.version,
                    content: policy.content,
                    summary: policy.summary,
                    effectiveDate: policy.effectiveDate,
                    createdById: adminId,
                },
            });
        });
        console.log(`  SEED  "${policy.title}" (${policy.slug}) v${policy.version} — published`);
        created++;
    }
    console.log(`\nDone. ${created} seeded, ${skipped} skipped.`);
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
