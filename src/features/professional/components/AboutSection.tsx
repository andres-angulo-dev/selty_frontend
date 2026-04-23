import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';

type AboutSectionProps = {
    description: string;
    services: string[];
};

export const AboutSection: React.FC<AboutSectionProps> = ({
    description,
    services,
}) => {
    const hasChecked = useRef(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const lines = 5;

    const handleTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (!hasChecked.current) {
            hasChecked.current = true;
            if (event.nativeEvent.lines.length > lines) setNeedsTruncation(true);
        }
    };

    return (
        <View style={styles.container}>
            {/* Section title */}
            <Text style={styles.sectionTitle}>{Strings.professional.about.title}</Text>

            {/* Description with "See more / See less" */}
            <Text
                style={styles.description}
                numberOfLines={hasChecked.current ? (isExpanded ? undefined : lines) : undefined}
                onTextLayout={handleTextLayout}
            >
                {description}
            </Text>

            {needsTruncation && (
                <Pressable onPress={() => setIsExpanded(!isExpanded)} style={({ pressed }) => pressed && styles.pressed}>
                    <Text style={styles.toggleText}>
                        {isExpanded ? Strings.professional.about.seeLess : Strings.professional.about.seeMore}
                    </Text>
                </Pressable>
            )}

            {/* Services as pill chips — no separate title, flows below description */}
            {services.length > 0 && (
                <View style={styles.chipsRow}>
                    {services.map((service) => (
                        <View key={service} style={styles.chip}>
                            <Text style={styles.chipText}>{service}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        gap: Spacing.md,
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '700',
    },

    description: {
        ...Typography.caption,
        lineHeight: 22,
        color: Colors.text.secondary,
    },

    toggleText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },

    pressed: {
        opacity: 0.7,
    },

    // Wrapping row of pills
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },

    // Individual pill — light blue bg, primary text, full rounded
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        backgroundColor: '#EEF2F7',
        borderRadius: BorderRadius.full,
    },

    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.primary.main,
    },
});
