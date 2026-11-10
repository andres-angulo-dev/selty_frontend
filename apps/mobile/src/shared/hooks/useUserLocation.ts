import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { Strings } from '@/shared/constants';

interface UserLocation {
    latitude: number;
    longitude: number;
}

interface UseUserLocationReturn {
    userLocation: UserLocation | null;
    errorMsg: string | null;
    isLoading: boolean;
}

// After this delay the position counts as unavailable; the next return to the app tries again
const POSITION_TIMEOUT_MS = 15000;

/**
 * Position of the user, kept in step with the system permission: asks at mount, then
 * only reads the permission each time the app comes back to the foreground, so
 * enabling or revoking it in the Settings applies without closing the screen.
 *
 * @returns The position (null when unknown), the reason it is unknown, and the first loading state
 */
export const useUserLocation = (): UseUserLocationReturn => {
    const [userLocation, setLocation] = useState<UserLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // The permission dialog itself makes the app inactive then active: without this
    // guard, closing it would start a second reading while the first one is running
    const isReading = useRef(false);
    // Coming back to the app must not move the map: a known position is not read again
    const hasPosition = useRef(false);

    useEffect(() => {
        const readLocation = async (readPermission: () => Promise<{ status: string }>) => {
            if (isReading.current) return;
            isReading.current = true;

            try {
                const { status } = await readPermission();

                if (status !== 'granted') {
                    hasPosition.current = false;
                    setLocation(null);
                    setErrorMsg(Strings.location.permissionDenied);
                    return;
                }

                if (hasPosition.current) return;

                // Get current position. Limited in time: a reading that never ends
                // would keep isReading on and block every later attempt
                const currentLocation = await Promise.race([
                    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
                    new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error('Location timeout')), POSITION_TIMEOUT_MS);
                    }),
                ]);

                hasPosition.current = true;
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                });
                setErrorMsg(null);
            } catch {
                setErrorMsg(Strings.location.fetchError);
            } finally {
                isReading.current = false;
                setIsLoading(false);
            }
        };

        // Ask user for permission to access location
        readLocation(Location.requestForegroundPermissionsAsync);

        // Back from the Settings: read the permission again, never ask a second time
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                readLocation(Location.getForegroundPermissionsAsync);
            }
        });

        return () => subscription.remove();
    }, []);

    return { userLocation, errorMsg, isLoading};
}
