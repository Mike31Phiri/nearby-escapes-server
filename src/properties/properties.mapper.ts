import { PropertyStatus } from '@prisma/client';

export const fullInclude = {
  host: {
    select: {
      id: true,
      name: true,
      avatar: true,
      hostProfile: {
        select: {
          businessName: true,
          defaultCheckInTime: true,
          defaultCheckOutTime: true,
        },
      },
    },
  },
  stays: {
    where: { deletedAt: null },
    orderBy: { rate: 'asc' as const },
    include: {
      policies: { orderBy: { sortOrder: 'asc' as const } },
      tags: { orderBy: { createdAt: 'asc' as const } },
      recommendations: { orderBy: { sortOrder: 'asc' as const } },
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  experiences: {
    where: { deletedAt: null },
    orderBy: { rate: 'asc' as const },
    include: {
      slots: { orderBy: { startTime: 'asc' as const } },
      inclusions: true,
      policies: { orderBy: { sortOrder: 'asc' as const } },
      tags: { orderBy: { createdAt: 'asc' as const } },
      recommendations: { orderBy: { sortOrder: 'asc' as const } },
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  transports: {
    where: { deletedAt: null },
    orderBy: { rate: 'asc' as const },
    include: {
      policies: { orderBy: { sortOrder: 'asc' as const } },
      tags: { orderBy: { createdAt: 'asc' as const } },
      recommendations: { orderBy: { sortOrder: 'asc' as const } },
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  images: { orderBy: { sortOrder: 'asc' as const } },
  amenities: { orderBy: { name: 'asc' as const } },
  rules: true,
  tags: { orderBy: { createdAt: 'asc' as const } },
  recommendations: { orderBy: { sortOrder: 'asc' as const } },
  reviews: { select: { rating: true } },
  _count: { select: { reviews: true, bookings: true } },
} as const;

export function formatProperty(property: any) {
  const ratings = property.reviews?.map((r: any) => r.rating) || [];
  const avgRating = ratings.length
    ? Number(
        (
          ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        ).toFixed(1),
      )
    : 0;

  let startingPrice = 0;
  if (property.type === 'STAY' && property.stays?.length) {
    const active = property.stays.filter((s: any) => s.isActive);
    if (active.length)
      startingPrice = Math.min(...active.map((s: any) => s.rate));
  } else if (property.type === 'EXPERIENCE' && property.experiences?.length) {
    const active = property.experiences.filter((e: any) => e.isActive);
    if (active.length)
      startingPrice = Math.min(...active.map((e: any) => e.rate));
  } else if (property.type === 'TRANSPORT' && property.transports?.length) {
    const active = property.transports.filter(
      (t: any) => t.isActive && t.rate != null,
    );
    if (active.length)
      startingPrice = Math.min(...active.map((t: any) => t.rate));
  }

  return {
    id: property.id,
    type: property.type.toLowerCase(),
    status: property.status.toLowerCase(),
    isDraft: property.status === PropertyStatus.DRAFT,
    draftStep: property.draftStep ?? null,
    draftData: property.draftData ?? null,
    name: property.name,
    description: property.description,
    location: property.location,
    currency: property.currency,
    price: startingPrice,
    priceFormatted: `K${(startingPrice / 100).toFixed(2)}`,
    rating: avgRating,
    reviewCount: property._count?.reviews ?? ratings.length,
    thumbnailUrl: property.images?.[0]?.url || null,
    images: (property.images || []).map((img: any) => ({
      url: img.url,
      sortOrder: img.sortOrder,
    })),
    amenities: (property.amenities || []).map((a: any) => ({
      name: a.name,
      icon: a.icon,
    })),
    rules: (property.rules || []).map((r: any) => r.rule),
    tags: (property.tags || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      category: t.category,
      icon: t.icon,
    })),
    recommendations: (property.recommendations || []).map((r: any) => ({
      id: r.id,
      audience: r.audience,
      title: r.title,
      reason: r.reason,
      badge: r.badge,
      sortOrder: r.sortOrder,
    })),
    hostId: property.hostId,
    hostName:
      property.host?.hostProfile?.businessName || property.host?.name || null,
    hostAvatar: property.host?.avatar || null,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,

    // Units
    stays: (property.stays || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      priceFormatted: `K${(s.price / 100).toFixed(2)}`,
      roomType: s.roomType,
      bedrooms: s.bedrooms,
      beds: s.beds,
      baths: s.baths,
      maxGuests: s.maxGuests,
      checkInFrom: s.checkInFrom,
      checkInUntil: s.checkInUntil,
      checkOutBefore: s.checkOutBefore,
      cancellationPolicy: s.cancellationPolicy?.toLowerCase() || null,
      isActive: s.isActive,
      images: (s.images || []).map((img: any) => ({
        url: img.url,
        sortOrder: img.sortOrder,
        altText: img.altText || null,
      })),
      policies: s.policies || [],
      tags: (s.tags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        icon: t.icon,
      })),
      recommendations: (s.recommendations || []).map((r: any) => ({
        id: r.id,
        audience: r.audience,
        title: r.title,
        reason: r.reason,
        badge: r.badge,
        sortOrder: r.sortOrder,
      })),
    })),

    experiences: (property.experiences || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      price: e.price,
      priceFormatted: `K${(e.price / 100).toFixed(2)}`,
      activityType: e.activityType,
      duration: e.duration,
      maxParticipants: e.maxParticipants,
      difficultyLevel: e.difficultyLevel,
      meetingPoint: e.meetingPoint,
      isActive: e.isActive,
      images: (e.images || []).map((img: any) => ({
        url: img.url,
        sortOrder: img.sortOrder,
        altText: img.altText || null,
      })),
      timeSlots: (e.timeSlots || []).map((ts: any) => ts.slot),
      inclusions: (e.inclusions || []).map((i: any) => i.item),
      policies: e.policies || [],
      tags: (e.tags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        icon: t.icon,
      })),
      recommendations: (e.recommendations || []).map((r: any) => ({
        id: r.id,
        audience: r.audience,
        title: r.title,
        reason: r.reason,
        badge: r.badge,
        sortOrder: r.sortOrder,
      })),
    })),

    transports: (property.transports || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      from: t.from,
      to: t.to,
      vehicleType: t.vehicleType,
      capacity: t.capacity,
      pricePerSeat: t.pricePerSeat,
      priceFormatted:
        t.pricePerSeat != null
          ? `K${(t.pricePerSeat / 100).toFixed(2)}`
          : 'K0.00',
      schedule: t.schedule,
      isActive: t.isActive,
      images: (t.images || []).map((img: any) => ({
        url: img.url,
        sortOrder: img.sortOrder,
        altText: img.altText || null,
      })),
      policies: t.policies || [],
      tags: (t.tags || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        category: tag.category,
        icon: tag.icon,
      })),
      recommendations: (t.recommendations || []).map((r: any) => ({
        id: r.id,
        audience: r.audience,
        title: r.title,
        reason: r.reason,
        badge: r.badge,
        sortOrder: r.sortOrder,
      })),
    })),
  };
}
