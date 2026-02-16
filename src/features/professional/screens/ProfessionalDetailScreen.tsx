import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { getProfessionalDetail } from '../data/mockProfessionalDetails';

// Type for the route props of this screen
type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalDetail'>;

export const ProfessionalDetailScreen: React.FC<Props> = ({ route })=> {
    // Get the professionalId from navigation params
    const { professionalId } = route.params;

    // Fetch professional data (simulates API call)
    const professional = getProfessionalDetail(professionalId);

    // Handle case where professional is not found
    if (!professional) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Professionnel non trouvé</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{professional.firstName} {professional.lastName}</Text>
            <Text style={styles.subTitle}>{professional.profession}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center'
    },

    title: {
        ...Typography.h2,
        color: Colors.text.secondary,
        marginTop: Spacing.sm,
    },

    subTitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.sm, 
    },

    errorText: {
        ...Typography.body,
        color: Colors.semantic.error,
    }
})