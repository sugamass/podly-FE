import Colors from "@/constants/Colors";
import { currentUser } from "@/mocks/users";
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

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: string;
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
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: currentUser.username,
      avatar: currentUser.avatar,
      text: newComment,
      likes: 0,
      timestamp: "Just now",
    };

    setComments([comment, ...comments]);
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

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{comments.length} comments</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.commentContent}>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <View style={styles.commentFooter}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.replyButton}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.likeContainer}
              onPress={() => handleLikeComment(item.id)}
            >
              <Ionicons
                name={
                  likedComments.has(item.id) ? "thumbs-up" : "thumbs-up-outline"
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
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <Image
          source={{ uri: currentUser.avatar }}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={Colors.dark.subtext}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Ionicons name="send" size={20} color={Colors.dark.text} />
        </TouchableOpacity>
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
    height: "60%",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.card,
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: Colors.dark.text,
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
