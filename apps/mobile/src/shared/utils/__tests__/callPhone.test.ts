import { Alert, Linking } from 'react-native';
import { callPhone } from '@/shared/utils/callPhone';
import { Strings } from '@/shared/constants/strings';

const actions = Strings.professional.actions;

describe('callPhone', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const openURL = jest.spyOn(Linking, 'openURL');

    beforeEach(() => {
        alert.mockClear();
        openURL.mockReset();
    });

    it('opens the dialer with the number', async () => {
        openURL.mockResolvedValue(undefined);
        await callPhone('0102030405');
        expect(openURL).toHaveBeenCalledWith('tel:0102030405');
        expect(alert).not.toHaveBeenCalled();
    });

    it('keeps only digits and + in the URL: spaces are invalid, dialer codes are refused', async () => {
        openURL.mockResolvedValue(undefined);
        await callPhone('06 12 34 56 78');
        expect(openURL).toHaveBeenLastCalledWith('tel:0612345678');
        await callPhone('+33 6 12;*#');
        expect(openURL).toHaveBeenLastCalledWith('tel:+33612');
    });

    it('treats a number without any digit as no number', async () => {
        await callPhone('   ');
        expect(openURL).not.toHaveBeenCalled();
        expect(alert).toHaveBeenCalledWith(actions.noPhoneTitle, actions.noPhoneMessage);
    });

    it('explains when the system answers it could not open the dialer', async () => {
        // The React Native types announce nothing here, but iOS can resolve to false
        openURL.mockResolvedValue(false as never);
        await callPhone('0102030405');
        expect(alert).toHaveBeenCalledWith(actions.callErrorTitle, actions.callErrorMessage);
    });

    it('explains when the professional has no number, without opening anything', async () => {
        await callPhone(null);
        expect(openURL).not.toHaveBeenCalled();
        expect(alert).toHaveBeenCalledWith(actions.noPhoneTitle, actions.noPhoneMessage);
    });

    it('explains when the device cannot call, instead of an unhandled error', async () => {
        openURL.mockRejectedValue(new Error('no dialer'));
        await expect(callPhone('0102030405')).resolves.toBeUndefined();
        expect(alert).toHaveBeenCalledWith(actions.callErrorTitle, actions.callErrorMessage);
    });
});
