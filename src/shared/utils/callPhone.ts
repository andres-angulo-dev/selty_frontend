import { Alert, Linking } from 'react-native';
import { Strings } from '@/shared/constants/strings';

const texts = Strings.professional.actions;

/**
 * Opens the native dialer. Never throws: when there is no number, or when the
 * device cannot call (iPad, simulator), the user reads why instead of nothing happening.
 *
 * Security: only digits and "+" reach the URL. Numbers are displayed with spaces, which are
 * not valid in a URL, and a number typed by a user must not be able to carry "*", "#" or ";"
 * (dialer codes) into the call.
 *
 * @param phone Number to call, null when the professional gave none
 */
export const callPhone = async (phone: string | null | undefined): Promise<void> => {
    const number = phone?.replace(/[^\d+]/g, '');
    if (!number) {
        Alert.alert(texts.noPhoneTitle, texts.noPhoneMessage);
        return;
    }
    try {
        // iOS answers false instead of an error when it cannot open the dialer
        const opened: unknown = await Linking.openURL(`tel:${number}`);
        if (opened === false) {
            Alert.alert(texts.callErrorTitle, texts.callErrorMessage);
        }
    } catch {
        Alert.alert(texts.callErrorTitle, texts.callErrorMessage);
    }
};
