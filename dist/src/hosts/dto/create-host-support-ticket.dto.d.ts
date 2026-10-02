export declare enum TicketTopic {
    PAYOUT = "payout",
    CALENDAR = "calendar",
    GUEST = "guest",
    VERIFICATION = "verification",
    OTHER = "other"
}
export declare enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved"
}
export declare class CreateHostSupportTicketDto {
    topic: TicketTopic;
    subject: string;
    message: string;
    bookingRef?: string;
    listingId?: string;
}
