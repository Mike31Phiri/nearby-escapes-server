import { GuestBookingItemDto } from './dto/guest-bookings.dto';

export interface BookingWithRelations {
  id: string;
  bookingRef: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  type: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  specialRequests: string | null;
  status: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  guests?: number;
  stayId?: string | null;
  experienceId?: string | null;
  transportId?: string | null;
  timeSlot?: string | null;
  property?: any;
  guest?: any;
  payout?: any | null;
  stayBooking?: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    checkedInAt: Date | null;
    checkedOutAt: Date | null;
  } | null;
  experienceBooking?: {
    id: string;
    experienceSlotId?: string;
    date: Date;
    guests: number;
  } | null;
  transportBooking?: {
    id: string;
    date: Date;
    seats: number;
  } | null;
  payment?: { status: string } | null;
}

export function formatDateOnly(
  d: Date | string | null | undefined,
): string | undefined {
  if (!d) return undefined;
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return undefined;
  return dateObj.toISOString().slice(0, 10);
}

export function toGuestBookingItem(
  b: any,
  todayStr: string,
): GuestBookingItemDto {
  const property = b.property;
  const vertical = (property?.type?.toLowerCase() || 'stay') as
    | 'stay'
    | 'experience'
    | 'transport';
  const checkInDate = formatDateOnly(b.stayBooking?.checkIn) || null;
  const checkOutDate = formatDateOnly(b.stayBooking?.checkOut) || null;
  const date =
    formatDateOnly(b.experienceBooking?.date) ||
    formatDateOnly(b.transportBooking?.date) ||
    null;

  let category: 'upcoming' | 'active' | 'recent' | 'cancelled' = 'upcoming';
  if (b.status === 'CANCELLED' || b.status === 'EXPIRED') {
    category = 'cancelled';
  } else if (b.status === 'COMPLETED') {
    category = 'recent';
  } else if (b.status === 'CHECKED_IN') {
    category = 'active';
  } else if (vertical === 'stay') {
    if (checkOutDate && checkOutDate < todayStr) {
      category = 'recent';
    } else if (
      checkInDate &&
      checkOutDate &&
      checkInDate <= todayStr &&
      checkOutDate >= todayStr
    ) {
      category = 'active';
    } else {
      category = 'upcoming';
    }
  } else {
    if (date && date < todayStr) {
      category = 'recent';
    } else {
      category = 'upcoming';
    }
  }

  let nightsCount: number | undefined = undefined;
  let stayProgress: string | undefined = undefined;
  if (
    vertical === 'stay' &&
    b.stayBooking?.checkIn &&
    b.stayBooking?.checkOut
  ) {
    const checkInTime = new Date(b.stayBooking.checkIn).getTime();
    const checkOutTime = new Date(b.stayBooking.checkOut).getTime();
    nightsCount = Math.max(
      1,
      Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)),
    );
    if (category === 'active') {
      const todayTime = new Date(todayStr).getTime();
      const elapsedDays = Math.floor(
        (todayTime - checkInTime) / (1000 * 60 * 60 * 24),
      );
      const currentNight = Math.min(nightsCount, Math.max(1, elapsedDays + 1));
      stayProgress = `Night ${currentNight} of ${nightsCount}`;
    }
  }

  const mappedStatus = b.status.toLowerCase() as
    | 'confirmed'
    | 'checked_in'
    | 'completed'
    | 'cancelled'
    | 'pending';

  return {
    id: b.id,
    bookingRef: b.bookingRef,
    listingId: b.propertyId,
    listingTitle: property?.name || 'Listing',
    listingImage: property?.images?.[0]?.url || '',
    location: property?.location || '',
    vertical,
    status: mappedStatus,
    category,
    checkInDate,
    checkOutDate,
    date,
    timeSlot: b.experienceBooking?.experienceSlotId || null,
    nightsCount,
    stayProgress,
    guestsCount:
      b.stayBooking?.guests ??
      b.experienceBooking?.guests ??
      b.transportBooking?.seats ??
      1,
    totalNgwee: b.amount,
    totalFormatted: `K${(b.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    currency: b.currency === 'USD' ? 'USD' : 'ZMW',
    paymentStatus:
      b.payment?.status?.toLowerCase() ||
      b.paymentStatus?.toLowerCase() ||
      'unpaid',
    hostName:
      property?.host?.hostProfile?.businessName ||
      property?.host?.name ||
      'Host',
    hostPhone: property?.host?.phone || undefined,
    createdAt: b.createdAt.toISOString(),
  };
}

export function formatBooking(booking: any): any {
  const property = booking.property;
  const guest = booking.guest;
  const unitName = property?.name || null;

  const now = Date.now();
  const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : null;
  const isHoldActive =
    booking.status === 'PENDING' && expiresAt && expiresAt.getTime() > now;
  const holdExpiresInSeconds = isHoldActive
    ? Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000))
    : 0;

  const checkInDate = booking.stayBooking?.checkIn
    ? new Date(booking.stayBooking.checkIn)
    : null;
  const checkOutDate = booking.stayBooking?.checkOut
    ? new Date(booking.stayBooking.checkOut)
    : null;
  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 1;

  const nightlyRateNgwee = Math.round(booking.amount / nights);
  const accommodationTotalNgwee = nightlyRateNgwee * nights;
  const cleaningFeeNgwee = 50000;
  const serviceFeeNgwee = Math.round(booking.amount * 0.1);
  const grandTotalNgwee = booking.amount;

  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    type: property?.type?.toLowerCase() || null,
    property: {
      id: booking.propertyId,
      name: property?.name || 'Nearby Escapes Property',
      vertical: (property?.type || 'stay').toLowerCase(),
      location: property?.location || 'Zambia',
      address: property?.location || 'Plot 45, Riverfront Road, Livingstone',
      image:
        property?.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    },
    host: {
      id: property?.host?.id || booking.hostId,
      name:
        property?.host?.hostProfile?.businessName ||
        property?.host?.name ||
        'Mwamba Chali',
      phone: property?.host?.phone || '+260 97 1234567',
      whatsapp: property?.host?.phone || '+260 97 1234567',
    },
    dates: {
      checkIn: checkInDate
        ? checkInDate.toISOString()
        : new Date().toISOString(),
      checkOut: checkOutDate
        ? checkOutDate.toISOString()
        : new Date().toISOString(),
      nights,
    },
    guests: {
      total: booking.guests || 1,
      adults: booking.guests || 1,
      children: 0,
    },
    financials: {
      currency: booking.currency || 'ZMW',
      nightlyRateNgwee,
      accommodationTotalNgwee,
      cleaningFeeNgwee,
      serviceFeeNgwee,
      taxesNgwee: 0,
      grandTotalNgwee,
      paymentStatus: (
        booking.payment?.status ||
        booking.paymentStatus ||
        'PAID'
      ).toUpperCase(),
    },
    instructions: {
      checkInProcedure:
        'Self check-in with keypad. Code will be sent on morning of arrival.',
      directions: property?.location
        ? `Follow road to ${property.location}. Gate is on the left.`
        : 'Follow main road to gate.',
      houseRules: ['No smoking inside chalets', 'Quiet hours after 22:00'],
    },
    propertyId: booking.propertyId,
    propertyName: property?.name || null,
    listingId: booking.propertyId,
    listingName: property?.name || null,
    stayId: booking.stayId || null,
    experienceId: booking.experienceId || null,
    transportId: booking.transportId || null,
    timeSlot: booking.timeSlot || null,
    unitName,
    guestId: booking.guestId,
    hostId: booking.hostId,
    status: booking.status.toLowerCase(),
    amount: booking.amount,
    amountFormatted: `K${(booking.amount / 100).toFixed(2)}`,
    currency: booking.currency,
    paymentStatus:
      booking.payment?.status?.toLowerCase() ||
      booking.paymentStatus?.toLowerCase() ||
      'unpaid',
    hold: {
      isHoldActive: !!isHoldActive,
      expiresAt: expiresAt?.toISOString() || null,
      expiresInSeconds: holdExpiresInSeconds,
    },
    details: {
      checkIn: booking.stayBooking?.checkIn
        ? new Date(booking.stayBooking.checkIn).toISOString().split('T')[0]
        : null,
      checkOut: booking.stayBooking?.checkOut
        ? new Date(booking.stayBooking.checkOut).toISOString().split('T')[0]
        : null,
      date: booking.experienceBooking?.date
        ? new Date(booking.experienceBooking.date).toISOString().split('T')[0]
        : booking.transportBooking?.date
          ? new Date(booking.transportBooking.date).toISOString().split('T')[0]
          : null,
      timeSlot: null,
      guests:
        booking.stayBooking?.guests ||
        booking.experienceBooking?.guests ||
        booking.transportBooking?.seats ||
        1,
    },
    checkedInAt: booking.stayBooking?.checkedInAt
      ? new Date(booking.stayBooking.checkedInAt).toISOString()
      : null,
    checkedOutAt: booking.stayBooking?.checkedOutAt
      ? new Date(booking.stayBooking.checkedOutAt).toISOString()
      : null,
    payout: booking.payout
      ? {
          id: booking.payout.id,
          amount: booking.payout.amount,
          commission: booking.payout.commission,
          netAmount: booking.payout.netAmount,
          status: booking.payout.status?.toLowerCase(),
        }
      : null,
    customer: {
      name: booking.customerName || guest?.name || null,
      phone: booking.customerPhone || guest?.phone || null,
      email: booking.customerEmail || guest?.email || null,
    },
    specialRequests: booking.specialRequests || null,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export function groupBookingsByCategory(items: GuestBookingItemDto[]): {
  upcoming: GuestBookingItemDto[];
  active: GuestBookingItemDto[];
  recent: GuestBookingItemDto[];
  cancelled: GuestBookingItemDto[];
} {
  return {
    upcoming: items.filter((i) => i.category === 'upcoming'),
    active: items.filter((i) => i.category === 'active'),
    recent: items.filter((i) => i.category === 'recent'),
    cancelled: items.filter((i) => i.category === 'cancelled'),
  };
}
