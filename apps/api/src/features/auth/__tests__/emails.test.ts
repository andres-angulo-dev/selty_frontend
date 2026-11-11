import { describe, expect, it } from 'vitest';
import { signInCodeEmail } from '../emails';

describe('signInCodeEmail', () => {
    it('puts the code in the subject and the text, and states the validity', () => {
        const message = signInCodeEmail('a@b.fr', '123456', 10);
        expect(message.to).toBe('a@b.fr');
        expect(message.subject).toBe('Votre code Sialty : 123456');
        expect(message.text).toContain('Votre code de connexion : 123456');
        expect(message.text).toContain('10 minutes');
        expect(message.text).toContain("Si vous n'avez pas demandé ce code, ignorez cet e-mail.");
    });
});
