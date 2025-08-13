import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorDisplayProps {
  error: string;
  useSupabaseData: boolean;
  podcastsLength: number;
  isLoading: boolean;
  onRetry: () => void;
}

export const ErrorDisplay = ({
  error,
  useSupabaseData,
  podcastsLength,
  isLoading,
  onRetry,
}: ErrorDisplayProps) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={48} color={Colors.dark.primary} />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>再試行</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  debugText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.dark.text,
    fontWeight: "bold",
  },
});
