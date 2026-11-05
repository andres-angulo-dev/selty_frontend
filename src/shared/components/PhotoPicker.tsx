import React from 'react';
import { View, Text, Image, Pressable, Alert, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// PHOTO PICKER
// Lets the user add photos from the library or the camera, see them,
// and remove them. Controlled component: the parent owns the list of
// URIs (`photos`) and receives every change through `onChange`.
// - layout 'grid'  : first photo = large 16:9 cover, others in a 3-column grid (annonce)
// - layout 'banner': one wide 16:9 slot (optional offer image)
// - layout 'tiles' : square tiles only, no cover (optional request photos)
// Every text comes from the caller (`labels`), so another app can reuse it.
//
// Permissions (signalled on purpose):
// - Library: iOS 14+ uses the system picker, which needs no permission —
//   the app only receives the photos the user picks.
// - Camera: permission asked at the moment of use, never at app start.
//   A permanent refusal opens a link to the Settings app.
// Privacy: EXIF metadata (GPS position) is NOT requested (`exif: false`).
// The server must still strip metadata from uploaded files.
// ============================================

export interface PhotoPickerLabels {
    add: string;
    addCover: string;            // Empty cover slot of the grid layout
    cover: string;
    chooseSource: string;
    fromLibrary: string;
    takePhoto: string;
    cancel: string;
    removePhoto: (position: number) => string;
    cameraDeniedTitle: string;
    cameraDeniedMessage: string;
    openSettings: string;
    pickError: string;
}

type PhotoPickerLayout = 'grid' | 'banner' | 'tiles';

interface PhotoPickerProps {
    photos: string[];                       // Local URIs, in display order
    onChange: (photos: string[]) => void;
    max: number;                            // Maximum number of photos
    labels: PhotoPickerLabels;
    layout?: PhotoPickerLayout;             // Default 'grid'
    addLabel?: string;                      // Text of the empty slot (defaults to labels.add)
    error?: string;                         // Validation message under the picker
}

// Same compression for both sources: keeps uploads light, quality stays good on a phone
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    exif: false,
};

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
    photos,
    onChange,
    max,
    labels,
    layout = 'grid',
    addLabel,
    error,
}) => {
    const remaining = max - photos.length;
    const canAdd = remaining > 0;

    /** Appends picked URIs without ever exceeding `max` (new array, no mutation). */
    const addPhotos = (uris: string[]) => {
        onChange([...photos, ...uris].slice(0, max));
    };

    /** Opens the system library; several photos at once when room is left. */
    const pickFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                ...PICKER_OPTIONS,
                allowsMultipleSelection: remaining > 1,
                selectionLimit: remaining,
            });
            if (!result.canceled) {
                addPhotos(result.assets.map((asset) => asset.uri));
            }
        } catch {
            Alert.alert(labels.pickError);
        }
    };

    /** Asks for the camera permission when needed, then opens the camera. */
    const takePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                // iOS never shows the system prompt twice: only the Settings app can change it
                if (!permission.canAskAgain) {
                    Alert.alert(labels.cameraDeniedTitle, labels.cameraDeniedMessage, [
                        { text: labels.cancel, style: 'cancel' },
                        { text: labels.openSettings, onPress: () => Linking.openSettings() },
                    ]);
                }
                return;
            }

            const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
            if (!result.canceled) {
                addPhotos(result.assets.map((asset) => asset.uri));
            }
        } catch {
            Alert.alert(labels.pickError);
        }
    };

    /** Lets the user choose the source (native action list on both platforms). */
    const handleAddPress = () => {
        Alert.alert(labels.chooseSource, undefined, [
            { text: labels.fromLibrary, onPress: pickFromLibrary },
            { text: labels.takePhoto, onPress: takePhoto },
            { text: labels.cancel, style: 'cancel' },
        ]);
    };

    /** Removes one photo; the next one becomes the cover if the first is removed. */
    const removePhoto = (index: number) => {
        onChange(photos.filter((_, i) => i !== index));
    };

    /** One photo slot: image, optional cover badge, remove button. */
    const renderPhoto = (uri: string, index: number, slotStyle: object, isCover: boolean) => (
        <View key={`${uri}-${index}`} style={slotStyle}>
            <Image source={{ uri }} style={styles.image} accessibilityIgnoresInvertColors />

            {isCover ? (
                <View style={styles.coverBadge}>
                    <Text style={styles.coverText}>{labels.cover}</Text>
                </View>
            ) : null}

            <Pressable
                onPress={() => removePhoto(index)}
                accessibilityRole="button"
                accessibilityLabel={labels.removePhoto(index + 1)}
                hitSlop={Spacing.sm}
                style={styles.removeButton}
            >
                <Ionicons name="close" size={14} color={Colors.text.inverse} />
            </Pressable>
        </View>
    );

    /** Empty slot that opens the source choice; hidden once `max` is reached. */
    const renderAddSlot = (slotStyle: object, label: string) =>
        canAdd ? (
            <Pressable
                onPress={handleAddPress}
                accessibilityRole="button"
                accessibilityLabel={label}
                style={({ pressed }) => [slotStyle, styles.addSlot, pressed && styles.pressed]}
            >
                <Ionicons name="camera-outline" size={26} color={Colors.primary.main} />
                <Text style={styles.addText}>{label}</Text>
            </Pressable>
        ) : null;

    // Banner: a single wide slot (optional offer image)
    if (layout === 'banner') {
        return (
            <View>
                {photos.length > 0
                    ? renderPhoto(photos[0], 0, styles.wideSlot, false)
                    : renderAddSlot(styles.wideSlot, addLabel ?? labels.add)}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    }

    // Tiles: every photo is a square tile, the add slot is the next tile
    if (layout === 'tiles') {
        return (
            <View>
                <View style={styles.tiles}>
                    {photos.map((uri, i) => renderPhoto(uri, i, styles.gridSlot, false))}
                    {renderAddSlot(styles.gridSlot, addLabel ?? labels.add)}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    }

    // Grid: the first photo is the large cover, the others are thumbnails below it
    const [cover, ...others] = photos;

    return (
        <View>
            {cover
                ? renderPhoto(cover, 0, styles.wideSlot, true)
                : renderAddSlot(styles.wideSlot, labels.addCover)}

            {cover ? (
                <View style={styles.grid}>
                    {others.map((uri, i) => renderPhoto(uri, i + 1, styles.gridSlot, false))}
                    {renderAddSlot(styles.gridSlot, addLabel ?? labels.add)}
                </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },

    // Tiles layout: same row as the grid thumbnails, without the cover above
    tiles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },

    // 3 per row: 3 × 31% + 2 gaps of 8px fits the card's inner width
    gridSlot: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    // Large 16:9 slot: cover of the grid, or the single banner image
    wideSlot: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    coverBadge: {
        position: 'absolute',
        left: Spacing.xs + 2,
        bottom: Spacing.xs + 2,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    coverText: {
        ...Typography.captionBis,
        fontWeight: '700',
        color: Colors.text.inverse,
    },

    // Dark translucent round button, readable on any photo
    removeButton: {
        position: 'absolute',
        top: Spacing.xs + 2,
        right: Spacing.xs + 2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.overlay.darkScrim,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addSlot: {
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    pressed: {
        opacity: 0.7,
    },
    addText: {
        ...Typography.label,
        color: Colors.primary.main,
    },

    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        marginTop: Spacing.sm,
    },
});
