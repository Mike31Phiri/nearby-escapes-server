SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Booking") as bookings,
  (SELECT COUNT(*) FROM "BookingItem") as booking_items,
  (SELECT COUNT(*) FROM "Accommodation") as accommodations,
  (SELECT COUNT(*) FROM "Payment") as payments,
  (SELECT COUNT(*) FROM "Collection") as collections,
  (SELECT COUNT(*) FROM "Feedback") as feedbacks,
  (SELECT COUNT(*) FROM "Thread") as threads,
  (SELECT COUNT(*) FROM "Message") as messages,
  (SELECT COUNT(*) FROM "Host") as hosts;
