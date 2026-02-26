import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Keyboard, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Comment } from '../types';
import { getCommentsByAnnonceId } from '../data/mockComments';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'CommentsModal'>;

export const CommentsModal: React.FC<Props> = ({ route, navigation }) => {
    const { annonceId } = route.params;
    const [comments, setComments] = useState<Comment[]>(getCommentsByAnnonceId(annonceId));
    const [inputText, setInputText] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    
    // Mock current user (will come from auth context later)
    const currentUser = {
        userName: 'Moi',
        userAvatar: null as string | null,
    }
    
    // Allows to display the send button in inputBar
    const canSend = inputText.trim().length > 0;

    // Track keyboard height to manually push content above the keyboard, we listen to native keyboard events and apply marginBottom directly
    useEffect(() => {
      const show = Keyboard.addListener('keyboardWillShow', (e) => setKeyboardHeight(e.endCoordinates.height)); // listening to the size once opened
      const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0)); // once closed
      
      return () => { show.remove(); hide.remove(); };
    }, []);

    // Add a new comment locally (will be replaced by API call later)
    const handleSend = () => {
        const trimmed = inputText.trim();
        if (!trimmed) return; 

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            content: trimmed,
            userId: 'current-user',
            userName: currentUser.userName,
            userAvatar: currentUser.userAvatar,
            annonceId,
            createdAt: new Date(),
        };

        setComments((prev) => [newComment, ...prev]);
        setInputText('');

        // Scroll to top to show the new comment 
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    // Render a signle comment card
    const renderComment = ({ item }: { item: Comment}) => (
        <View style={styles.commentCard}>
            {/* Avatar photo or initial */}
            <View style={styles.avatar}>
                {item.userAvatar ? (
                    <Image source={{ uri: item.userAvatar }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarInitials}>{item.userName[0].toUpperCase()}</Text>
                )}
            </View>

            {/* Content */}
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.date}>{formatRelativeDate(item.createdAt, 'seconds')}</Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
            </View>
        </View>
    );


    return (
        // <SafeAreaView style={styles.container}>
        <SafeAreaView style={styles.container} edges={[ 'top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{Strings.comments.title(comments.length)}</Text>
                <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name='close' size={22} color={Colors.text.primary} />
                </Pressable>
            </View>

            {/* FlatList + inputBar, marginBottom pushes content above keyboard */}
            <View style={{ flex: 1, marginBottom: keyboardHeight}}>
                {/* Comments list */}
                <FlatList
                    style={{ flex: 1, }}
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderComment}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{Strings.comments.empty}</Text>
                    }
                />
                {/* Input bar */}
                <View style={[styles.inputBar, { paddingBottom: keyboardHeight > 0 ? Spacing.md : insets.bottom }]}>
                    {/* Avatar photo or initila */}
                    <View style={styles.avatar}>
                        {currentUser.userAvatar ? (
                            <Image source={{ uri: currentUser.userAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarInitials}>{currentUser.userName.charAt(0).toUpperCase()}</Text>
                        )}
                    </View>

                    {/* Text input */}
                    <TextInput
                        style={styles.input}
                        placeholder={Strings.comments.placeholder}
                        placeholderTextColor={Colors.text.tertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    {/* Send button */}
                    <Pressable onPress={handleSend} disabled={!canSend} style={({ pressed }) => [styles.sendButton, !canSend && styles.sendButtonDisabled, pressed && canSend && styles.sendButtonPressed]}>
                        <Ionicons name='send' size={18} color={Colors.neutral.white} />
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: Platform.OS === 'android' ? 32 : 0,
        borderTopRightRadius: Platform.OS === 'android' ? 32 : 0,
        overflow: 'hidden',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.border,
    },

    headerTitle: {
        ...Typography.label,
        color: Colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },

    closeButton: {
        position: 'absolute',
        right: Spacing.md,
    },

    listContent: {
        padding: Spacing.md, 
        paddingBottom: Spacing.sm,
        flexGrow: 1,
    },

    commentCard: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.secondary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },

    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
    },

    avatarInitials: {
        ...Typography.label,
        color: Colors.primary.main,
        fontWeight: '600',
    },

    commentContent: {
        flex: 1,
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    userName: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    date: {
        ...Typography.caption, 
        color: Colors.text.tertiary,
    },

    commentText: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 20,
    },

    emptyText: {
        ...Typography.body,
        color: Colors.text.tertiary,
        textAlign: 'center',
        marginTop: Spacing.xl,
    },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
        backgroundColor: Colors.neutral.white,
    },

    input: {
        flex: 1,
        ...Typography.label, 
        fontSize: 12,
        color: Colors.text.primary,
        backgroundColor: Colors.neutral.background,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        maxHeight: 100,
    },

    sendButton : {
        width: 36,
        height: 36,
        marginLeft: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },

    sendButtonDisabled: {
        backgroundColor: Colors.neutral.border,
    },

    sendButtonPressed: {
        opacity: 0.8,
    },
});