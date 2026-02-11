import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

// Components
import { SearchBar } from '@/shared/components/SearchBar';

export const HomeScreen: React.FC = () => {
    // Temporary state to test SearchBar
    const [ searchText, setSearchText ] = useState('');

    return (
        <View style={styles.container}>
            {/* Test SearchBar */}
            <SearchBar placeholder='Rechercher un professionnel...' value={searchText} onChangeText={setSearchText} onClear={() => setSearchText('')} onBackPress={() => setSearchText('')} /> 

            <Text style={styles.title}>Accueil</Text>
            <Text style={styles.subtitle}>Feed des professionels</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.neutral.background,
    },

    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
    },

    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.sm,
    }
})


