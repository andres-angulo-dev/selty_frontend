import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// MENU SWITCH ROW
// Same layout as MenuRow (icon square + label), but ends with an on/off
// switch instead of a chevron. Meant for settings such as notifications,
// and used today by the development-only account type control.
// Every text comes from the caller.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuSwitchRowProps {
    icon: IoniconName;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    hint?: string;          // Optional second line under the label
}

export const MenuSwitchRow: React.FC<MenuSwitchRowProps> = ({
    icon,
    label,
    value,
    onValueChange,
    hint,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={18} color={Colors.primary.main} />
            </View>

            {/* flex: 1 keeps the switch on the right whatever the label length */}
            <View style={styles.texts}>
                <Text style={styles.label}>{label}</Text>
                {hint ? <Text style={styles.hint}>{hint}</Text> : null}
            </View>

            {/* The native Switch carries its own accessibility role and state;
                the label is attached so VoiceOver reads "Compte professionnel, on" */}
            <Switch
                value={value}
                onValueChange={onValueChange}
                accessibilityLabel={label}
                trackColor={{ true: Colors.primary.main, false: Colors.neutral.border }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md - Spacing.xs,       // 12px, same as MenuRow
        gap: Spacing.md - Spacing.xs,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flex: 1,
    },
    label: {
        ...Typography.body,
        color: Colors.text.primary,
    },
    hint: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
