import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Reply {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
  replyTo?: string; // リプライ先のユーザー名
}

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
  replies?: Reply[];
}

const mockComments: Comment[] = [
  {
    id: "1",
    username: "business_analyst",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
    text: "Great insights on AI implementation strategies! Would love to hear more about ROI metrics.",
    likes: 24,
    timestamp: "2h",
    replies: [
      {
        id: "1-1",
        username: "tech_lead",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
        text: "I agree! The ROI in our company was 300% within 6 months.",
        likes: 8,
        timestamp: "1h",
        replyTo: "business_analyst",
      },
    ],
  },
  {
    id: "2",
    username: "tech_investor",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
    text: "The point about regulatory challenges is spot on. Companies need to prepare for this now.",
    likes: 18,
    timestamp: "4h",
  },
  {
    id: "3",
    username: "startup_founder",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
    text: "We implemented similar strategies at our company. The ROI has been incredible.",
    likes: 15,
    timestamp: "5h",
  },
  {
    id: "4",
    username: "data_scientist",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
    text: "Could you elaborate on the technical infrastructure needed for these implementations?",
    likes: 12,
    timestamp: "6h",
  },
  {
    id: "5",
    username: "cto_fintech",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80",
    text: "The ethical considerations mentioned are crucial. We need more discussion on responsible AI.",
    likes: 9,
    timestamp: "8h",
  },
];

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  podcastId: string;
}

export default function CommentModal({
  visible,
  onClose,
  podcastId,
}: CommentModalProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    if (replyingTo) {
      // リプライを追加
      const reply: Reply = {
        id: Date.now().toString(),
        username: profile?.username || user?.email?.split('@')[0] || 'guest',
        avatar: profile?.avatar_url || '',
        text: newComment,
        likes: 0,
        timestamp: "Just now",
        replyTo: replyingTo.username,
      };

      setComments(
        comments.map((comment) => {
          if (comment.id === replyingTo.commentId) {
            return {
              ...comment,
              replies: [reply, ...(comment.replies || [])],
            };
          }
          return comment;
        })
      );

      // リプライ後は自動的にコメントを展開
      const newExpandedComments = new Set(expandedComments);
      newExpandedComments.add(replyingTo.commentId);
      setExpandedComments(newExpandedComments);

      setReplyingTo(null);
    } else {
      // 新しいコメントを追加
      const comment: Comment = {
        id: Date.now().toString(),
        username: profile?.username || user?.email?.split('@')[0] || 'guest',
        avatar: profile?.avatar_url || '',
        text: newComment,
        likes: 0,
        timestamp: "Just now",
      };

      setComments([comment, ...comments]);
    }

    setNewComment("");
  };

  const handleLikeComment = (commentId: string) => {
    const newLikedComments = new Set(likedComments);
    const isLiked = newLikedComments.has(commentId);

    if (isLiked) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }

    setLikedComments(newLikedComments);

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      })
    );
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    const newLikedReplies = new Set(likedReplies);
    const isLiked = newLikedReplies.has(replyId);

    if (isLiked) {
      newLikedReplies.delete(replyId);
    } else {
      newLikedReplies.add(replyId);
    }

    setLikedReplies(newLikedReplies);

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies?.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  likes: isLiked ? reply.likes - 1 : reply.likes + 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleReplyPress = (commentId: string, username: string) => {
    setReplyingTo({ commentId, username });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  const toggleReplies = (commentId: string) => {
    const newExpandedComments = new Set(expandedComments);
    if (newExpandedComments.has(commentId)) {
      newExpandedComments.delete(commentId);
    } else {
      newExpandedComments.add(commentId);
    }
    setExpandedComments(newExpandedComments);
  };

  const renderReply = (reply: Reply, commentId: string) => (
    <View key={reply.id} style={styles.replyItem}>
      <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
      <View style={styles.replyContent}>
        <Text style={styles.username}>
          @{reply.username}
          {reply.replyTo && (
            <Text style={styles.replyToText}>
              {" "}
              replying to @{reply.replyTo}
            </Text>
          )}
        </Text>
        <Text style={styles.commentText}>{reply.text}</Text>
        <View style={styles.commentFooter}>
          <Text style={styles.timestamp}>{reply.timestamp}</Text>
          <TouchableOpacity
            onPress={() => handleReplyPress(commentId, reply.username)}
          >
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.likeContainer}
        onPress={() => handleLikeReply(commentId, reply.id)}
      >
        <Ionicons
          name={likedReplies.has(reply.id) ? "thumbs-up" : "thumbs-up-outline"}
          size={14}
          color={
            likedReplies.has(reply.id)
              ? Colors.dark.primary
              : Colors.dark.subtext
          }
        />
        <Text
          style={[
            styles.likeCount,
            likedReplies.has(reply.id) && styles.likedCount,
          ]}
        >
          {reply.likes}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {comments.reduce(
            (total, comment) => total + 1 + (comment.replies?.length || 0),
            0
          )}{" "}
          comments
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <View style={styles.commentItem}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.commentContent}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
                <View style={styles.commentFooter}>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                  <TouchableOpacity
                    onPress={() => handleReplyPress(item.id, item.username)}
                  >
                    <Text style={styles.replyButton}>Reply</Text>
                  </TouchableOpacity>
                  {item.replies && item.replies.length > 0 && (
                    <TouchableOpacity
                      onPress={() => toggleReplies(item.id)}
                      style={styles.repliesToggle}
                    >
                      <Text style={styles.repliesToggleText}>
                        {expandedComments.has(item.id) ? "Hide" : "View"}{" "}
                        {item.replies.length}{" "}
                        {item.replies.length === 1 ? "reply" : "replies"}
                      </Text>
                      <Ionicons
                        name={
                          expandedComments.has(item.id)
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={12}
                        color={Colors.dark.subtext}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.likeContainer}
                onPress={() => handleLikeComment(item.id)}
              >
                <Ionicons
                  name={
                    likedComments.has(item.id)
                      ? "thumbs-up"
                      : "thumbs-up-outline"
                  }
                  size={16}
                  color={
                    likedComments.has(item.id)
                      ? Colors.dark.primary
                      : Colors.dark.subtext
                  }
                />
                <Text
                  style={[
                    styles.likeCount,
                    likedComments.has(item.id) && styles.likedCount,
                  ]}
                >
                  {item.likes}
                </Text>
              </TouchableOpacity>
            </View>

            {/* リプライ表示 */}
            {item.replies && expandedComments.has(item.id) && (
              <View style={styles.repliesContainer}>
                {item.replies.map((reply) => renderReply(reply, item.id))}
              </View>
            )}
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to @{replyingTo.username}
            </Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <Ionicons name="close" size={16} color={Colors.dark.subtext} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <Image
            source={
              profile?.avatar_url 
                ? { uri: profile.avatar_url }
                : require('@/assets/images/defaultAvatar.png')
            }
            style={styles.inputAvatar}
          />
          <TextInput
            style={styles.input}
            placeholder={
              replyingTo
                ? `Reply to @${replyingTo.username}...`
                : "Add a comment..."
            }
            placeholderTextColor={Colors.dark.subtext}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: newComment.trim() ? 1 : 0.5 },
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    position: "relative",
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 15,
  },
  commentItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    color: Colors.dark.text,
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentText: {
    color: Colors.dark.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  timestamp: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginRight: 15,
  },
  replyButton: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 15,
  },
  repliesToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  repliesToggleText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },
  likeContainer: {
    alignItems: "center",
    marginLeft: 10,
    justifyContent: "center",
  },
  likeCount: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  likedCount: {
    color: Colors.dark.primary,
  },
  repliesContainer: {
    backgroundColor: Colors.dark.background,
    paddingLeft: 50,
  },
  replyItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyToText: {
    color: Colors.dark.subtext,
    fontWeight: "normal",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  replyingToContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.dark.background,
  },
  replyingToText: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: Colors.dark.text,
    textAlignVertical: "top",
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
