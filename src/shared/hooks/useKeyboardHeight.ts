// NOT USED IN THIS PROJECT - Allows to automatically calculate the keyboard height 
import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export const useKeyboardHeight = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        // iOS: "will" events (fires before animation, smoother)
        // Android: "did" events (fires after keyboard is shown)
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        // Listen for keyboard show
        const showListener = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });

        // Listen for keyboard hide
        const hideListener = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        // Cleanup: remove listeners when component unmounts
        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    return keyboardHeight;
};