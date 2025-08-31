import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PodcastInfoProps {
  title: string;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  duration: string;
  description: string;
  category: string;
  tags: string[];
}

export default function PodcastInfo({
  title,
  host,
  duration,
  description,
  category,
  tags,
}: PodcastInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.hostContainer}>
        <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
        <View>
          <View style={styles.hostNameContainer}>
            <Text style={styles.hostName}>{host.name}</Text>
            {host.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.durationContainer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={Colors.dark.subtext}
            />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.tagsContainer}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>

        {tags.slice(0, 2).map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tagButton}>
            <Ionicons
              name="pricetag-outline"
              size={12}
              color={Colors.dark.text}
            />
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}

        {tags.length > 2 && (
          <Text style={styles.moreTagsText}>+{tags.length - 2}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 64,
    padding: 20,
    backgroundColor: "rgba(18, 22, 32, 0.8)",
    borderRadius: 20,
  },
  title: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  hostNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostName: {
    color: Colors.dark.text,
    fontWeight: "bold",
    marginRight: 5,
  },
  verifiedBadge: {
    backgroundColor: Colors.dark.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: "bold",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  durationText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: "bold",
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.dark.text,
    fontSize: 12,
    marginLeft: 4,
  },
  moreTagsText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    alignSelf: "center",
  },
});
