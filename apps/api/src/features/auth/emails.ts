import type { EmailMessage } from '../../shared/email/emailSender';

// =============================================================================
// Texts of the e-mails sent by the auth feature (user-facing, in French).
// =============================================================================

/**
 * Builds the sign-in code e-mail.
 * @param to Recipient address.
 * @param code The 6-digit code.
 * @param validMinutes How long the code stays valid, in minutes.
 * @returns The message to hand to an EmailSender.
 */
export function signInCodeEmail(to: string, code: string, validMinutes: number): EmailMessage {
    return {
        to,
        subject: `Votre code Sialty : ${code}`,
        text:
            `Votre code de connexion : ${code}\n` +
            `Il est valable ${validMinutes} minutes.\n` +
            `Si vous n'avez pas demandé ce code, ignorez cet e-mail.`,
    };
}
