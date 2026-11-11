import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailMessage, EmailSender } from './emailSender';

// =============================================================================
// SMTP sender (nodemailer). Development only: Mailpit has no TLS and no auth.
// The real provider (TLS + credentials) is configured at the stop point.
// =============================================================================

export interface SmtpEmailSenderOptions {
    host: string;
    port: number;
    from: string;
}

export class SmtpEmailSender implements EmailSender {
    private readonly transport: Transporter;
    private readonly from: string;

    /**
     * @param options SMTP host, port and the "from" address.
     */
    constructor(options: SmtpEmailSenderOptions) {
        // Security: secure:false means no TLS. Acceptable for local Mailpit only.
        this.transport = nodemailer.createTransport({
            host: options.host,
            port: options.port,
            secure: false,
        });
        this.from = options.from;
    }

    /**
     * Sends the message. Nothing is logged (recipient and body stay private).
     * @param message The e-mail to deliver.
     */
    async send(message: EmailMessage): Promise<void> {
        await this.transport.sendMail({
            from: this.from,
            to: message.to,
            subject: message.subject,
            text: message.text,
        });
    }
}
