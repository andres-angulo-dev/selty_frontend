import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Image, Platform, LayoutAnimation } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Comment } from '../types';
import { getCommentsByAnnonceId } from '../data/mockComments';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/shared/hooks/useKeyboardHeight';

type Props = NativeStackScreenProps<RootStackParamList, 'CommentsModal'>;
type CommentWithReplies = Comment & { replies: Comment[] }; // Local type: comment with its replies nested
type FlatItem =  // FlatList requires a flat array - we flatten comments + replies + toggles into one list, so we can use scrollToIndex on any item directly
    | { type: 'comment'; comment: CommentWithReplies }
    | { type: 'toggle_show'; parentId: string; replyCount: number }
    | { type: 'reply'; comment: Comment, parentId: string; isFirst: boolean; isLast: boolean }
    | { type: 'toggle_hide'; parentId: string };

export const CommentsModal: React.FC<Props> = ({ route, navigation }) => {
    const { annonceId } = route.params;
    const [comments, setComments] = useState<Comment[]>(getCommentsByAnnonceId(annonceId));
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string; parentId: string; } | null>(null); // Tracks which comment is being replied to
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set()); // Tracks which top-level comments have their replies expanded
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const pendingScrollId = useRef<string | null>(null); // Stores the id of the comment to scroll to after next render

    // Mock current user (will come from auth context later)
    const currentUser = {
        userName: Strings.comments.currentUser,
        userAvatar: null as string | null,
    }
    
    // Allows to display the send button in inputBar
    const canSend = inputText.trim().length > 0;

    // Build comment tree (needed to group replies under parents)
    const commentTree = useMemo<CommentWithReplies[]>(() => {
        const topLevel = comments.filter((c) => c.parentId === null);
        return topLevel.map((parent) => ({
            ...parent,
            replies: comments.filter((c) => c.parentId === parent.id),
        }));
    }, [comments]);

    // Build flat list: each comment, reply and toggle is a separate item
    const flatListData = useMemo<FlatItem[]>(() => {
        const result: FlatItem[] = [];
        for (const parent of commentTree) {
            result.push({ type: 'comment', comment: parent });
            if (parent.replies.length > 0) {
                if (expandedComments.has(parent.id)) {
                    parent.replies.forEach((reply, index) => {
                        result.push({
                            type: 'reply',
                            comment: reply,
                            parentId: parent.id,
                            isFirst: index === 0,
                            isLast: index === parent.replies.length - 1,
                        });
                    }) ;
                    result.push({ type: 'toggle_hide', parentId: parent.id });
                } else {
                    result.push({ type: 'toggle_show', parentId: parent.id, replyCount: parent.replies.length });
                }
            }
        }
        return result;
    }, [commentTree, expandedComments]);    

    // Track keyboard height with cross-platform hook (iOS: keyboardWill*, Android: keyboardDid*)
    const keyboardHeight = useKeyboardHeight();

    // Once flatListData updates, scroll to the pending comment id if any
    useEffect(() => {
        if (!pendingScrollId.current) return;
        const targetId = pendingScrollId.current;
        const index = flatListData.findIndex((item) => (item.type === 'comment' || item.type === 'reply') && item.comment.id === targetId);
        if (index !== -1) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.8 });
            }, 50);
            pendingScrollId.current = null;
        }
    }, [flatListData]);

    // Toggle replies visibility with animation 
    const toggleReplies = (commentId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedComments((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next
        })
    };

    // Add a new comment locally (will be replaced by API call later)
    const handleSend = () => {
        const trimmed = inputText.trim();
        if (!trimmed) return; 
        const newId = `comment-${Date.now()}`;


        const newComment: Comment = {
            id: newId,
            content: replyingTo ? `${Strings.comments.replyingTo(replyingTo.userName)} ${trimmed}` : trimmed,
            userId: 'current-user',
            userName: currentUser.userName,
            userAvatar: currentUser.userAvatar,
            annonceId,
            parentId: replyingTo ? replyingTo.parentId : null,
            createdAt: new Date(),
            usefulCount: 0,
            isUseful: false,
        };

        setComments((prev) => [...prev, newComment]);
        setInputText('');

        // Auto-expand parent replies if replying
        if (replyingTo) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpandedComments((prev) => {
                const next = new Set(prev);
                next.add(replyingTo.parentId);
                return next;
            });
        }

        // Schedule scroll to new comment (handled in useEffect after render)
        pendingScrollId.current = newId;
        setReplyingTo(null);
    };

    // Toggle useful state on a comment 
    const handleUseful = (commentId: string) => {
        setComments((prev) => 
            prev.map((c) => 
                c.id === commentId ? { ...c, isUseful: !c.isUseful, usefulCount: c.isUseful ? c.usefulCount - 1 : c.usefulCount + 1 } : c 
            )
        );
    };
 
    // Render a single comment card (isReply = true for indented replies)
    const renderComment = (item: Comment, isReply = false, effectiveParentId?: string, hasReplies = false, noBottomMargin = false) => (
        <View style={[styles.commentCard, hasReplies && { marginBottom: 0 }, noBottomMargin && { marginBottom: 0}, isReply && styles.replyCard]}>
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

                {/* Footer: useful + reply */}
                {item.userName !== currentUser.userName &&
                    <View style={styles.commentFooter}>
                        {/* Useful button */}
                        <Pressable onPress={() => handleUseful(item.id)} style={styles.usefulButton}>
                            <Ionicons name={item.isUseful ? 'thumbs-up' : 'thumbs-up-outline'} size={13} color={item.isUseful ? Colors.primary.main : Colors.text.tertiary} />
                            <Text style={[styles.usefulText, item.isUseful && styles.usefulTextActive]}>{item.usefulCount > 0 ? `${Strings.comments.useful} (${item.usefulCount})` : Strings.comments.useful}</Text>
                        </Pressable>
                        {/* Reply Button */}
                        <Pressable onPress={() => setReplyingTo({ id: item.id, userName: item.userName, parentId: effectiveParentId ?? item.id })} style={styles.replyButton}>
                            <Ionicons name='return-down-forward-outline' size={13} color={Colors.text.tertiary} />
                            <Text style={styles.replyButtonText}>{Strings.comments.reply}</Text>
                        </Pressable>
                    </View>
                }
            </View>
        </View>
    );

    // Render each flat list item based on its type
    const renderItem = ({ item }: { item: FlatItem }) => {
        switch (item.type) {
            case 'comment':
                return renderComment(item.comment, false, undefined, item.comment.replies.length > 0);
        
            case 'reply':
                return (
                    <View style={item.isFirst && { marginTop: Spacing.md }}>
                        {renderComment(item.comment, true, item.parentId, false, item.isLast)}
                    </View>
                );
              
            case 'toggle_show':
                return (
                    <Pressable onPress={() => toggleReplies(item.parentId)} style={styles.repliesToggle}>
                        <View style={styles.repliesToggleLine} />
                        <Text style={styles.repliesToggleText}>
                            {item.replyCount === 1 ? Strings.comments.viewReply : Strings.comments.viewReplies(item.replyCount)}
                        </Text>
                    </Pressable>
                );
              
            case 'toggle_hide':
                return (
                    <Pressable onPress={() => toggleReplies(item.parentId)} style={[styles.repliesToggle, { marginLeft: 88 }]}>
                        <View style={styles.repliesToggleLine} />
                        <Text style={styles.repliesToggleText}>{Strings.comments.collapseReplies}</Text>
                    </Pressable>
                );
        }
    };

    return (
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
                    data={flatListData}
                    keyExtractor={(item) => {
                        if (item.type === 'comment' || item.type === 'reply') return item.comment.id;
                        if (item.type === 'toggle_show') return `toggle_show_${item.parentId}`;
                        return `toggle_hide_${item.parentId}`;
                    }}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{Strings.comments.empty}</Text>
                    }
                    onScrollToIndexFailed={(info) => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                />

                {/* Reply banner - shown when replying to a comment */}
                {replyingTo && (
                    <View style={styles.replyBanner}>
                        <Text style={styles.replyBannerText}>
                            {Strings.comments.replyLabel}{' '}
                            <Text style={styles.replyBannerName}>@{replyingTo.userName}</Text>
                        </Text>
                        <Pressable onPress={() => setReplyingTo(null)}>
                            <Ionicons name='close' size={16} color={Colors.text.secondary} />
                        </Pressable>
                    </View>
                )}
                
                {/* Input bar */}
                <View style={[styles.inputBar, { paddingBottom: keyboardHeight > 0 ? Spacing.md : insets.bottom }]}>
                    {/* Avatar photo or initial */}
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
        backgroundColor: Colors.neutral.background,
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

    commentFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Spacing.xs,
    },

    replyCard: {
        marginLeft: 44,
    },

    replyButton: {
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: Spacing.xs,
        marginLeft: Spacing.sm,
    },

    replyButtonText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        fontSize: 11,
    },

    replyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm, 
        backgroundColor: Colors.neutral.card,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
    },

    replyBannerText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },

    replyBannerName: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '600',
    },

    usefulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: Spacing.xs,
    },

    usefulText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        fontSize: 11,
    },

    usefulTextActive: {
        color: Colors.primary.main,
    },

    repliesToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 44,
        marginBottom: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    repliesToggleLine: {
        flex: 1, 
        height: 1,
        backgroundColor: Colors.neutral.border,
        marginRight: Spacing.xs,
    },

    repliesToggleText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        fontSize: 11,
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