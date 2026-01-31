import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface ProfileInfoItemProps {
    label: string,      // Left text (ex: "Email")   
    value: string,      // Right text (ex: "john@example.com") 
    isLast?: boolean;   // If true, no bottom border
}

export const ProfileInfoItem : React.FC<ProfileInfoItemProps> = ({
    label,
    value,
    isLast = false, // Default value is false   
}) => {
    return (
        <View style={[styles.container, !isLast && styles.border]}> 
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={1}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',               // Horizontal layout
        justifyContent: 'space-between',    // Label left, value right 
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.neutral.white,
    }, 
    border: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.border,
    },
    label: {
        ...Typography.body,
        color: Colors.text.primary,
    },
    value: {
        ...Typography.body,
        color: Colors.text.secondary,
        flex: 1,                            // Take remaining space  
        textAlign: 'right',                 // Align text to right 
        marginLeft: Spacing.md              // Space between label and value 
    }

})