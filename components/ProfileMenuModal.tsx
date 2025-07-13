import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, danger = false, isLast = false }) => (
  <TouchableOpacity 
    style={[
      styles.menuItem, 
      danger && styles.menuItemDanger,
      isLast && styles.lastMenuItem
    ]} 
    onPress={onPress}
  >
    <Ionicons 
      name={icon as any} 
      size={24} 
      color={danger ? Colors.dark.highlight : Colors.dark.text} 
    />
    <Text style={[styles.menuItemText, danger && styles.menuItemDangerText]}>
      {title}
    </Text>
    <Ionicons 
      name="chevron-forward" 
      size={20} 
      color={danger ? Colors.dark.highlight : Colors.dark.inactive} 
    />
  </TouchableOpacity>
);

export function ProfileMenuModal({ visible, onClose }: ProfileMenuModalProps) {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "ログアウト",
      "ログアウトしますか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "ログアウト",
          style: "destructive",
          onPress: async () => {
            try {
              // まずモーダルを閉じる
              onClose();
              
              // ログアウト処理を実行
              await signOut();
              
              // ログアウト成功時は、_layout.tsxの認証チェックにより
              // 自動的にAuthModalが表示されます
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                "エラー",
                "ログアウトに失敗しました。もう一度お試しください。"
              );
            }
          },
        },
      ]
    );
  };

  const menuItems: Array<Omit<MenuItemProps, 'onPress'> & { onPress: () => void }> = [
    {
      icon: "settings-outline",
      title: "設定",
      onPress: () => {
        // TODO: 設定画面への遷移を実装
        Alert.alert("設定", "設定画面は今後実装予定です");
      },
    },
    {
      icon: "help-circle-outline",
      title: "ヘルプ・サポート",
      onPress: () => {
        // TODO: ヘルプ画面への遷移を実装
        Alert.alert("ヘルプ", "ヘルプ画面は今後実装予定です");
      },
    },
    {
      icon: "document-text-outline",
      title: "利用規約・プライバシーポリシー",
      onPress: () => {
        // TODO: 利用規約画面への遷移を実装
        Alert.alert("利用規約", "利用規約画面は今後実装予定です");
      },
    },
    {
      icon: "log-out-outline",
      title: "ログアウト",
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>メニュー</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                onPress={item.onPress}
                danger={item.danger}
                isLast={index === menuItems.length - 1}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  menuSection: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  menuItemDangerText: {
    color: Colors.dark.highlight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
});