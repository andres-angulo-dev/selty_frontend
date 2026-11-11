import { describe, expect, it } from 'vitest';
import { MemoryEmailSender } from '../memoryEmailSender';

describe('MemoryEmailSender', () => {
    it('keeps the messages in order', async () => {
        const sender = new MemoryEmailSender();
        await sender.send({ to: 'a@b.fr', subject: 's', text: 'Code 111111' });
        expect(sender.sent).toHaveLength(1);
        expect(sender.sent[0]?.to).toBe('a@b.fr');
    });

    it('finds the code of the latest message to the address', async () => {
        const sender = new MemoryEmailSender();
        await sender.send({ to: 'a@b.fr', subject: 's', text: 'Code 111111' });
        await sender.send({ to: 'a@b.fr', subject: 's', text: 'Code 222222' });
        expect(sender.lastCodeFor('a@b.fr')).toBe('222222');
    });

    it('ignores other addresses', async () => {
        const sender = new MemoryEmailSender();
        await sender.send({ to: 'other@b.fr', subject: 's', text: 'Code 333333' });
        expect(sender.lastCodeFor('a@b.fr')).toBeUndefined();
    });

    it('compares addresses case-insensitively', async () => {
        const sender = new MemoryEmailSender();
        await sender.send({ to: 'Ab@B.fr', subject: 's', text: 'Code 444444' });
        expect(sender.lastCodeFor('aB@b.FR')).toBe('444444');
    });

    it('returns undefined when the message holds no 6-digit code', async () => {
        const sender = new MemoryEmailSender();
        await sender.send({ to: 'a@b.fr', subject: 's', text: 'Hello 12345' });
        expect(sender.lastCodeFor('a@b.fr')).toBeUndefined();
    });
});
