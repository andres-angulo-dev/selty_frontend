// =============================================================================
// E-mail sending contract. Features depend on this interface only, so the
// transport (Mailpit in development, a real provider later, memory in tests)
// can be swapped without touching them.
// =============================================================================

/** A plain-text e-mail. */
export interface EmailMessage {
    to: string;
    subject: string;
    text: string;
}

/** Anything able to deliver an e-mail. */
export interface EmailSender {
    /**
     * Delivers one message.
     * Security: implementations must never log the recipient or the body
     * (the body may hold a sign-in code).
     */
    send(message: EmailMessage): Promise<void>;
}
