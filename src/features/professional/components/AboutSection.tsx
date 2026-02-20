import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

// Props type
type AboutSectionProps= {
    description: string;
    services: string[];
};

export const AboutSection: React.FC<AboutSectionProps> = ({
    description,
    services,
}) => {
    const hasChecked = useRef(false); // Ref to check only once (does NOT trigger re-render)
    const [isExpanded, setIsExpanded] = useState(false); // State to toggle description expand/collapse
    const [needsTruncation, setNeedsTruncation] = useState(false); // State to show or hide "See more / See less"
    const lines = 5;

    // Called every time Text renders - but we only act once
    const handleTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (!hasChecked.current) {
            hasChecked.current = true;
            if (event.nativeEvent.lines.length > lines) setNeedsTruncation(true) // Only check when text is NOT truncated (first render or expanded)
        }
    };

    return (
        <View style={styles.container}>
            {/* Section title */}
            <Text style={styles.sectionTitle}>{Strings.professional.about.title}</Text>

            {/* Description with "See more / See less" */}
            <Text 
                style={[styles.description, !needsTruncation && { paddingBottom: Spacing.lg }]} 
                numberOfLines={hasChecked.current ? (isExpanded ? undefined : lines) : undefined} 
                onTextLayout={handleTextLayout}
            >
                {description}
            </Text>

            {/* Show toggle button only if text needs truncation */}
            {needsTruncation && (
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.toggleText}>{ isExpanded ? Strings.professional.about.seeLess : Strings.professional.about.seeMore }</Text>
                </TouchableOpacity>
            )}    

            {/* Services list */}
            <Text style={styles.sectionTitle}>{Strings.professional.about.servicesTitle}</Text>

            {services.map((service, index) => (
                <View key={index} style={styles.serviceRow}>
                    <Ionicons name='checkmark-circle' size={18} color={Colors.semantic.success} />
                    <Text style={styles.serviceText}>{service}</Text>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.text.secondary,
        marginBottom: Spacing.sm
    },

    description: {
        ...Typography.caption,
        lineHeight: 22,
    },

    toggleText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginBottom: Spacing.lg,
    },

    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    serviceText: {
        ...Typography.caption,
        lineHeight: 22,
    },
})