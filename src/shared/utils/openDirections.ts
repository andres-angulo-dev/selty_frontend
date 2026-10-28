import { Linking, Platform } from 'react-native';

interface Destination {
    latitude: number;
    longitude: number;
    label?: string;              // Shown as the destination name when the maps app supports it
}

// Opens the platform navigation app with turn-by-turn directions to `destination`.
// iOS → Apple Maps, Android → Google Maps navigation intent, with a universal web
// fallback when neither scheme can be opened. Returns false when every attempt failed
// so the caller can show a message; never throws.
export const openDirections = async ({ latitude, longitude, label }: Destination): Promise<boolean> => {
    const coords = `${latitude},${longitude}`;
    const encodedLabel = label ? encodeURIComponent(label) : '';

    // Native schemes first (open the installed app directly), then the universal link
    const candidates = Platform.select({
        ios: [
            `maps://?daddr=${coords}&dirflg=d${label ? `&q=${encodedLabel}` : ''}`,
            `https://maps.apple.com/?daddr=${coords}&dirflg=d`,
        ],
        android: [
            `google.navigation:q=${coords}`,
            `geo:${coords}?q=${coords}${label ? `(${encodedLabel})` : ''}`,
            `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
        ],
        default: [`https://www.google.com/maps/dir/?api=1&destination=${coords}`],
    }) ?? [];

    for (const url of candidates) {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
                return true;
            }
        } catch {
            // Try the next candidate: a failing scheme must not block the fallback
        }
    }
    return false;
};
