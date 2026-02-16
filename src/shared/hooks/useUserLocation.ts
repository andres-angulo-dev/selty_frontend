import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
    latitude: number;
    longitude: number;
}

interface UseUserLocationReturn {
    userLocation: UserLocation | null; 
    errorMsg: string | null;
    isLoading: boolean;
}

export const useUserLocation = (): UseUserLocationReturn => {
    const [userLocation, setLocation] = useState<UserLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getLocation = async () => {
            try {
                // Ask user for permission to access location
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    setErrorMsg('Permission de localisation refusée');
                    setIsLoading(false);
                    return;
                }

                // Get current position
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });

                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                });
            } catch (error) {
                setErrorMsg('Impossible de récupérer la localisation');
            } finally {
                setIsLoading(false);
            }
        };

        getLocation();
    }, []);

    return { userLocation, errorMsg, isLoading};
}