import type { EmailMessage, EmailSender } from './emailSender';

// =============================================================================
// In-memory sender for tests: keeps the messages so a test can read the code.
// =============================================================================

export class MemoryEmailSender implements EmailSender {
    private readonly messages: EmailMessage[] = [];

    /** Read-only view of the messages sent so far, oldest first. */
    get sent(): readonly EmailMessage[] {
        return this.messages;
    }

    /**
     * Stores a copy of the message (the caller's object is never kept).
     * @param message The e-mail to "deliver".
     */
    async send(message: EmailMessage): Promise<void> {
        this.messages.push({ ...message });
    }

    /**
     * Finds the 6-digit code in the latest message sent to an address.
     * @param email Recipient, compared lower-cased.
     * @returns The code, or undefined when no message or no code is found.
     */
    lastCodeFor(email: string): string | undefined {
        const wanted = email.toLowerCase();
        for (let i = this.messages.length - 1; i >= 0; i -= 1) {
            const message = this.messages[i];
            if (message !== undefined && message.to.toLowerCase() === wanted) {
                return /(?<!\d)\d{6}(?!\d)/.exec(message.text)?.[0];
            }
        }
        return undefined;
    }
}
