import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Spacing, Strings } from '@/shared/constants';
import type { RequestStatus, ServiceRequest } from '@/shared/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { MediaRowCard, MediaRowBadgeTone } from '@/shared/components/MediaRowCard';
import { useRequests } from '@/shared/hooks/useRequests';
import { getRequestStatus } from '@/shared/utils/requestStatus';
import { getTradeById } from '@/__mocks__/mockTrades';
import { CURRENT_USER_ID } from '@/__mocks__/mockSession';

// ============================================
// MY REQUESTS SCREEN (individuals, from the Profile tab)
// Every request of the current user, with its status: the ones that left the
// feed ("Pro trouvé", "Expirée") are still found here. Most recent first.
// The replies from pros will appear here once messaging exists.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'MyRequests'>;

const texts = Strings.request.myRequests;

// Only an open request stands out; a closed one stays neutral
const STATUS_TONES: Record<RequestStatus, MediaRowBadgeTone> = {
    open: 'primary',
    fulfilled: 'neutral',
    expired: 'neutral',
};

const RowSeparator: React.FC = () => <View style={styles.separator} />;

export const MyRequestsScreen: React.FC<Props> = ({ navigation }) => {
    const requests = useRequests();
    const myRequests = useMemo(
        () => requests.filter((request) => request.author.id === CURRENT_USER_ID),
        [requests],
    );

    const renderRequest = ({ item }: { item: ServiceRequest }) => {
        const status = getRequestStatus(item);
        const trade = getTradeById(item.tradeId)?.label;
        const place = `${item.city} (${item.department})`;
        return (
            <MediaRowCard
                title={item.title}
                subtitle={trade ? `${trade} · ${place}` : place}
                imageUrl={item.photos[0]}
                placeholderIcon="create-outline"
                badge={{ label: Strings.request.status[status], tone: STATUS_TONES[status] }}
                onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
            />
        );
    };

    return (
        <View style={styles.screen}>
            {myRequests.length === 0 ? (
                <EmptyState
                    icon="create-outline"
                    title={texts.emptyTitle}
                    message={texts.emptyMessage}
                    actionLabel={Strings.request.form.submitStart}
                    onAction={() => navigation.navigate('RequestForm')}
                />
            ) : (
                <FlatList
                    data={myRequests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={RowSeparator}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    listContent: {
        padding: Spacing.md,
    },
    separator: {
        height: Spacing.sm + Spacing.xs,
    },
});
