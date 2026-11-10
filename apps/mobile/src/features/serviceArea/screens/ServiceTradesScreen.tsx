import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Strings, Typography } from '@/shared/constants';
import { MenuSection } from '@/shared/components/MenuSection';
import { SelectField } from '@/shared/components/SelectField';
import { useServiceArea, useServiceAreaActions } from '@/shared/hooks/useServiceArea';
import { getTradeById, isTradeRemoteCapable, TRADE_OPTIONS } from '@/__mocks__/mockTrades';

// ============================================
// SERVICE TRADES SCREEN — "Mes métiers" (professionals)
// The trades whose requests the pro can answer. Changes apply at once to the
// feed and the request screens. The rules are in @sialty/domain (zones/serviceZones.ts).
// Not saved after an app restart until the backend exists.
// ============================================

const texts = Strings.serviceArea;

export const ServiceTradesScreen: React.FC = () => {
    const area = useServiceArea();
    const { addTrade, removeTrade } = useServiceAreaActions();

    // Trades the pro does not have yet
    const availableTrades = TRADE_OPTIONS.filter((option) => !area.tradeIds.includes(option.value));

    const handleRemoveTrade = (tradeId: string) => {
        const result = removeTrade(tradeId, isTradeRemoteCapable);
        if (result.outcome === 'last_trade') {
            Alert.alert(texts.limits.title, texts.limits.lastTrade);
        } else if (result.outcome === 'country_is_only_zone') {
            Alert.alert(texts.limits.title, texts.limits.countryOnly);
        } else if (result.countryZoneRemoved) {
            Alert.alert(texts.limits.countryRemoved);
        }
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.intro}>{texts.tradesIntro}</Text>

            <MenuSection title={texts.trades} cardStyle={styles.card}>
                <View style={styles.trades}>
                    {area.tradeIds.map((tradeId) => {
                        const label = getTradeById(tradeId)?.label ?? tradeId;
                        return (
                            <Pressable
                                key={tradeId}
                                onPress={() => handleRemoveTrade(tradeId)}
                                style={({ pressed }) => [styles.tradePill, pressed && styles.pressed]}
                                accessibilityRole="button"
                                accessibilityLabel={texts.removeTrade(label)}
                            >
                                <Text style={styles.tradeText}>{label}</Text>
                                <Ionicons name="close" size={16} color={Colors.text.inverse} />
                            </Pressable>
                        );
                    })}
                </View>
                {/* Empty value: the field stays ready to add another trade */}
                <SelectField
                    label={texts.addTrade}
                    options={availableTrades}
                    value=""
                    onChange={addTrade}
                    placeholder={texts.addTrade}
                    searchPlaceholder={texts.tradeSearch}
                    emptyText={texts.tradeEmpty}
                    closeLabel={Strings.selectField.close}
                />
            </MenuSection>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    intro: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
    },
    card: {
        padding: Spacing.md,
    },
    trades: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    tradePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm + Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.main,
    },
    tradeText: {
        ...Typography.label,
        color: Colors.text.inverse,
    },
    pressed: {
        opacity: 0.6,
    },
});
