import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// モック下書きデータ
const mockDrafts = [
  {
    id: "1",
    title: "量子コンピュータについて",
    duration: "2分",
    createdAt: "2024-01-15",
    status: "draft",
  },
  {
    id: "2",
    title: "AI技術の未来",
    duration: "3分",
    createdAt: "2024-01-14",
    status: "generating",
  },
];

export default function CreateScreen() {
  const handleCreateNew = () => {
    router.push("/create-script");
  };

  const handleDraftPress = (draft: any) => {
    // TODO: 下書き編集画面への遷移
    console.log("下書き選択:", draft.title);
  };

  const renderDraftItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.draftItem}
      onPress={() => handleDraftPress(item)}
    >
      <View style={styles.draftInfo}>
        <Text style={styles.draftTitle}>{item.title}</Text>
        <View style={styles.draftMeta}>
          <Text style={styles.draftDuration}>{item.duration}</Text>
          <Text style={styles.draftDate}>{item.createdAt}</Text>
        </View>
      </View>
      <View style={styles.draftStatus}>
        {item.status === "draft" && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>下書き</Text>
          </View>
        )}
        {item.status === "generating" && (
          <View style={[styles.statusBadge, styles.generatingBadge]}>
            <Text style={styles.statusText}>生成中</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.dark.subtext}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>新しいポッドキャストを作る</Text>
        <Text style={styles.subtitle}>
          AIがあなたの代わりに魅力的なポッドキャストを作成します
        </Text>
      </View>

      {/* 新規作成ボタン */}
      <View style={styles.createContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            style={styles.createGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.createContent}>
              <Ionicons name="add-circle" size={48} color={Colors.dark.text} />
              <Text style={styles.createTitle}>原稿を新規作成</Text>
              <Text style={styles.createDescription}>
                テーマや参考URLから
                {"\n"}AIが自動で原稿を生成します
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 下書き一覧 */}
      <View style={styles.draftsSection}>
        <View style={styles.draftsHeader}>
          <Text style={styles.draftsTitle}>下書き一覧</Text>
          <Text style={styles.draftsCount}>{mockDrafts.length}件</Text>
        </View>

        {mockDrafts.length > 0 ? (
          <FlatList
            data={mockDrafts}
            renderItem={renderDraftItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyDrafts}>
            <Ionicons
              name="document-outline"
              size={48}
              color={Colors.dark.inactive}
            />
            <Text style={styles.emptyText}>下書きはありません</Text>
            <Text style={styles.emptySubtext}>
              上記から新しいポッドキャストを作成してみましょう
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.dark.subtext,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  createContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  createButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  createGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  createContent: {
    alignItems: "center",
  },
  createTitle: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  createDescription: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  draftsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  draftsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  draftsTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  draftsCount: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  draftItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  draftMeta: {
    flexDirection: "row",
  },
  draftDuration: {
    color: Colors.dark.subtext,
    fontSize: 14,
    marginRight: 12,
  },
  draftDate: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  draftStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  generatingBadge: {
    backgroundColor: Colors.dark.highlight,
  },
  statusText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: "bold",
  },
  separator: {
    height: 12,
  },
  emptyDrafts: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.dark.subtext,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
