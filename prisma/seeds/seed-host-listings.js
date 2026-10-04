require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcrypt');
const mockData = require('../../scratch/mock_data.json');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('=== Nearby Escapes Host & Listings Seeder ===\n');

  // 1. Create or Find Host User
  const hostEmail = 'host@nearbyescapes.com';
  let host = await prisma.user.findUnique({
    where: { email: hostEmail },
    include: { hostProfile: true },
  });

  if (!host) {
    const hashedPassword = await bcrypt.hash('Host123!', 10);
    host = await prisma.user.create({
      data: {
        name: 'Nearby Escapes Host',
        email: hostEmail,
        password: hashedPassword,
        phone: '+260971234567',
        role: 'HOST',
        isVerified: true,
        verificationStatus: 'VERIFIED',
        hostProfile: {
          create: {
            businessName: 'Nearby Escapes Official Host',
            isApproved: true,
            defaultCheckInTime: '14:00',
            defaultCheckOutTime: '10:00',
            payoutMethod: 'BANK_TRANSFER',
            payoutAccount: 'Standard Chartered Lusaka - 010023456789',
          },
        },
      },
      include: { hostProfile: true },
    });
    console.log(`[Host] Created Host User: ${host.email} (Password: Host123!)`);
  } else {
    if (!host.hostProfile) {
      await prisma.hostProfile.create({
        data: {
          userId: host.id,
          businessName: 'Nearby Escapes Official Host',
          isApproved: true,
        },
      });
    }
    await prisma.user.update({
      where: { id: host.id },
      data: { role: 'HOST', isVerified: true, verificationStatus: 'VERIFIED' },
    });
    console.log(`[Host] Using existing Host User: ${host.email}`);
  }

  // Also create a sample guest reviewer to attach realistic ratings
  let sampleGuest = await prisma.user.findFirst({ where: { role: 'GUEST' } });
  if (!sampleGuest) {
    const guestPassword = await bcrypt.hash('Guest123!', 10);
    sampleGuest = await prisma.user.create({
      data: {
        name: 'Chileshe Mwamba',
        email: 'chileshe.guest@nearbyescapes.com',
        password: guestPassword,
        role: 'GUEST',
        isVerified: true,
        verificationStatus: 'VERIFIED',
      },
    });
  }

  // 2. Seed Stays
  console.log(`\n--- Seeding ${mockData.mockStays.length} Stays ---`);
  for (const stay of mockData.mockStays) {
    let property = await prisma.property.findFirst({
      where: { hostId: host.id, name: stay.name, type: 'STAY' },
    });

    if (!property) {
      const priceNgwee = Math.round((stay.price || 450) * 100);
      const images = (stay.images && stay.images.length > 0) ? stay.images : [stay.image];
      const rules = [
        ...(stay.checkInRules || []),
        ...(stay.checkOutRules || []),
      ];

      property = await prisma.property.create({
        data: {
          hostId: host.id,
          type: 'STAY',
          status: 'ACTIVE',
          name: stay.name,
          description: stay.description || `Experience the beauty of ${stay.location}.`,
          location: stay.location,
          currency: 'ZMW',
          images: {
            create: images.map((url, sortOrder) => ({ url, sortOrder })),
          },
          amenities: {
            create: (stay.amenities || []).map((name) => ({ name })),
          },
          rules: {
            create: rules.map((rule) => ({ rule })),
          },
          stays: {
            create: {
              name: stay.name,
              description: stay.description || null,
              price: priceNgwee,
              roomType: stay.type || 'Lodge',
              bedrooms: stay.beds || 1,
              beds: stay.beds || 1,
              baths: stay.baths || 1,
              maxGuests: stay.guests || 2,
              checkInFrom: '14:00',
              checkInUntil: '22:00',
              checkOutBefore: '11:00',
              cancellationPolicy: 'FLEXIBLE',
              isActive: true,
            },
          },
        },
      });

      // Add a representative review matching the mock rating
      if (stay.rating) {
        await prisma.review.create({
          data: {
            propertyId: property.id,
            guestId: sampleGuest.id,
            rating: Math.round(stay.rating),
            text: `Outstanding stay at ${stay.name}! Pristine location, exceptional hospitality, and unforgettable views.`,
          },
        }).catch(() => {});
      }

      console.log(`  [+] Created Stay: "${stay.name}" in ${stay.location} (K${stay.price}/night)`);
    } else {
      console.log(`  [=] Stay already exists: "${stay.name}"`);
    }
  }

  // 3. Seed Experiences & Hidden Gems
  const allExperiences = [...mockData.mockExperiences, ...mockData.mockGems];
  console.log(`\n--- Seeding ${allExperiences.length} Experiences & Gems ---`);
  for (const exp of allExperiences) {
    let property = await prisma.property.findFirst({
      where: { hostId: host.id, name: exp.name, type: 'EXPERIENCE' },
    });

    if (!property) {
      const cityName = (exp.location || 'Livingstone').split(',')[0].trim();
      const meetingPoint = `${cityName} Rendezvous Point`;
      const meetingPointAddress = exp.location || `${cityName}, Zambia`;
      const priceNgwee = Math.round((exp.price || 150) * 100);

      const itinerary = [
        {
          time: '08:30 AM',
          title: 'Arrival & Welcome Briefing',
          description: `Meet your certified safari guide at ${meetingPoint} for equipment orientation and safety introduction.`,
        },
        {
          time: '09:15 AM',
          title: 'Guided Excursion & Exploration',
          description: `Experience ${exp.name} across scenic viewpoints, natural landscapes, and wildlife corridors.`,
        },
        {
          time: '12:00 PM',
          title: 'Refreshments & Tour Wrap-Up',
          description: 'Enjoy complimentary local refreshments, photo opportunities, and debrief before concluding.',
        },
      ];

      const slots = [
        { id: 'slot-1', label: 'Morning Session', timeSlot: '08:30 AM', capacity: 8 },
        { id: 'slot-2', label: 'Afternoon Session', timeSlot: '14:00 PM', capacity: 8 },
      ];

      const whatsIncluded = [
        'Certified Professional Safari Guide',
        'National Park / Conservation Entry Fees',
        'Safety Equipment & First Aid Coverage',
        'Bottled Mineral Water & Refreshments',
      ];
      const whatsNotIncluded = [
        'Gratuities & Tips',
        'Alcoholic Beverages',
        'Personal Travel Insurance',
      ];
      const whatToBring = [
        'Valid Physical ID or Passport',
        'Comfortable Walking Footwear',
        'Camera or Smartphone',
        'Sun Protection & Insect Repellent',
      ];
      const whatNotToBring = ['Unauthorized Drones', 'Single-use Plastic Bags', 'Pets'];
      const importantInformation = [
        'Please arrive 15 minutes before scheduled session departure',
        'Wilderness First Responder on site',
        '24-hour flexible cancellation policy',
      ];
      const notSuitableFor = [
        'Wheelchair users (rough terrain & step chassis)',
        'Severe mobility impairments',
      ];

      property = await prisma.property.create({
        data: {
          hostId: host.id,
          type: 'EXPERIENCE',
          status: 'ACTIVE',
          name: exp.name,
          description: exp.description || `Discover ${exp.name} in ${exp.location}. Certified guides, full equipment, and immersive local highlights.`,
          location: exp.location,
          currency: 'ZMW',
          images: {
            create: [{ url: exp.image, sortOrder: 0 }],
          },
          experiences: {
            create: {
              name: exp.name,
              description: exp.description || null,
              price: priceNgwee,
              activityType: exp.category || 'Adventure',
              duration: exp.duration || '2 hours',
              maxParticipants: 8,
              difficultyLevel: 'Moderate',
              meetingPoint,
              meetingPointAddress,
              itinerary,
              slots,
              whatsNotIncluded,
              whatToBring,
              whatNotToBring,
              importantInformation,
              notSuitableFor,
              isActive: true,
              inclusions: {
                create: whatsIncluded.map((item) => ({ item })),
              },
              timeSlots: {
                create: [{ slot: '08:30 AM' }, { slot: '14:00 PM' }],
              },
            },
          },
        },
      });

      if (exp.rating) {
        await prisma.review.create({
          data: {
            propertyId: property.id,
            guestId: sampleGuest.id,
            rating: Math.round(exp.rating),
            text: `Incredible experience! The guide was knowledgeable and the itinerary was perfectly paced. Highly recommended!`,
          },
        }).catch(() => {});
      }

      console.log(`  [+] Created Experience: "${exp.name}" in ${exp.location} (K${exp.price})`);
    } else {
      console.log(`  [=] Experience already exists: "${exp.name}"`);
    }
  }

  // 4. Seed Transport Routes
  console.log(`\n--- Seeding ${mockData.mockTransport.length} Transport Routes ---`);
  for (const t of mockData.mockTransport) {
    const propertyTitle = `${t.from} to ${t.to} (${t.operator})`;
    let property = await prisma.property.findFirst({
      where: { hostId: host.id, name: propertyTitle, type: 'TRANSPORT' },
    });

    if (!property) {
      const priceNgwee = Math.round((t.price || 200) * 100);
      property = await prisma.property.create({
        data: {
          hostId: host.id,
          type: 'TRANSPORT',
          status: 'ACTIVE',
          name: propertyTitle,
          description: `${t.operator} daily express transit between ${t.from} and ${t.to}. Estimated travel duration: ${t.duration}. Departure: ${t.departureTime || 'Daily'}, Arrival: ${t.arrivalTime || 'Standard'}.`,
          location: `${t.from}, Zambia`,
          currency: 'ZMW',
          images: {
            create: [{ url: t.image, sortOrder: 0 }],
          },
          transports: {
            create: {
              name: `${t.from} to ${t.to} Express`,
              description: `${t.operator} Transit Service`,
              from: t.from,
              to: t.to,
              vehicleType: t.operator,
              capacity: 14,
              pricePerSeat: priceNgwee,
              schedule: {
                departures: t.departures,
                departureTime: t.departureTime,
                arrivalTime: t.arrivalTime,
                duration: t.duration,
                rateUnit: t.rateUnit || 'trip',
              },
              isActive: true,
            },
          },
        },
      });

      console.log(`  [+] Created Transport: "${propertyTitle}" (K${t.price})`);
    } else {
      console.log(`  [=] Transport already exists: "${propertyTitle}"`);
    }
  }

  const totalProps = await prisma.property.count({ where: { hostId: host.id } });
  console.log(`\n=== Migration Finished Successfully! ===`);
  console.log(`Host User: ${host.email}`);
  console.log(`Password: Host123!`);
  console.log(`Total Active Host Listings in DB: ${totalProps}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
