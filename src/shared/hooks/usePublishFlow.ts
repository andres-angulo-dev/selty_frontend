import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, usePreventRemove } from '@react-navigation/native';

// ============================================
// usePublishFlow
// Shared by the annonce and offer forms:
// 1. Discard guard — while the form has unsaved input, leaving it ("Annuler",
//    iOS swipe back, Android back) first asks for confirmation.
// 2. Publish exit — `publish(leave)` switches the guard off, then runs
//    `leave` once on the next render (store the publication, replace the form
//    by the confirmation). Put the store write in `leave` so it runs once too.
//    The guard must be off BEFORE leaving, otherwise it would block our own
//    navigation and ask "Abandonner ?" right after a successful publication.
//
// iOS swipe back: while the guard is on, the swipe gesture is disabled.
// With native-stack, a blocked swipe is not cancelled by UIKit: the screen is
// popped (the previous screen shows for a moment), then reattached before the
// alert appears (react-native-screens #3885). Disabling the gesture avoids
// that flash; the user leaves through "Annuler", which asks for confirmation.
// ============================================

export interface DiscardTexts {
    title: string;
    message: string;
    confirm: string;
    keepEditing: string;
}

/**
 * @param isDirty true when the user has typed or picked something
 * @param texts   texts of the discard confirmation
 * @returns publish: call it with the navigation to run once published
 */
export const usePublishFlow = (isDirty: boolean, texts: DiscardTexts) => {
    const navigation = useNavigation();

    // Navigation to run once the guard is off (null while not published)
    const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);

    // Guard on = unsaved input and not published yet
    const isGuarded = isDirty && pendingExit === null;

    // Swipe back only while there is nothing to lose (see header comment).
    // Layout effect: applied before the screen paints, so no swipe slips through.
    useLayoutEffect(() => {
        navigation.setOptions({ gestureEnabled: !isGuarded });
    }, [navigation, isGuarded]);

    usePreventRemove(isGuarded, ({ data }) => {
        Alert.alert(texts.title, texts.message, [
            { text: texts.keepEditing, style: 'cancel' },
            // Replays the blocked action (goBack, swipe…) once confirmed
            { text: texts.confirm, style: 'destructive', onPress: () => navigation.dispatch(data.action) },
        ]);
    });

    // Runs after the re-render that switched the guard off
    useEffect(() => {
        pendingExit?.();
    }, [pendingExit]);

    return {
        // Keeps the first call: a double tap on "Publier" must publish once.
        // `leave` is returned by the updater, so useState stores it instead of calling it.
        publish: (leave: () => void) => setPendingExit((current) => current ?? leave),
    };
};
