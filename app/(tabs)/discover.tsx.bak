import Colors from "@/constants/Colors";
import { categories } from "@/mocks/categories";
import { podcasts } from "@/mocks/podcasts";
import { formatNumber } from "@/utils/formatNumber";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiscoverScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const trendingPodcasts = [...podcasts].sort((a, b) => b.likes - a.likes);
  const newPodcasts = [...podcasts].sort((a, b) => b.timestamp - a.timestamp);

  const filteredPodcasts =
    selectedCategory === "all"
      ? trendingPodcasts
      : trendingPodcasts.filter(
          (podcast) =>
            podcast.category.toLowerCase() === selectedCategory ||
            podcast.tags.some((tag) => tag.toLowerCase() === selectedCategory)
        );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.dark.subtext} />
          <Text style={styles.searchPlaceholder}>
            Search podcasts, topics, or people
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === "all" && styles.activeCategoryButton,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === "all" && styles.activeCategoryText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id &&
                    styles.activeCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.activeCategoryText,
                  ]}
                >
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="trending-up"
              size={18}
              color={Colors.dark.highlight}
            />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>

          <FlatList
            data={filteredPodcasts.slice(0, 4)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.podcastsScrollView}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.podcastCard}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.podcastImage}
                />
                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.podcastHost}>{item.host.name}</Text>
                  <View style={styles.podcastStats}>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="time"
                        size={12}
                        color={Colors.dark.subtext}
                      />
                      <Text style={styles.statText}>{item.duration}</Text>
                    </View>
                    <Text style={styles.statText}>
                      {formatNumber(item.likes)} likes
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Hosts</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hostsScrollView}
          >
            {podcasts
              .map((podcast) => podcast.host)
              .filter(
                (host, index, self) =>
                  index === self.findIndex((h) => h.id === host.id)
              )
              .map((host) => (
                <TouchableOpacity key={host.id} style={styles.hostCard}>
                  <Image
                    source={{ uri: host.avatar }}
                    style={styles.hostAvatar}
                  />
                  <Text style={styles.hostName}>{host.name}</Text>
                  <View style={styles.hostVerified}>
                    {host.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
          </View>

          {newPodcasts.slice(0, 5).map((podcast) => (
            <TouchableOpacity key={podcast.id} style={styles.listItemCard}>
              <Image
                source={{ uri: podcast.imageUrl }}
                style={styles.listItemImage}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle} numberOfLines={1}>
                  {podcast.title}
                </Text>
                <Text style={styles.listItemHost}>{podcast.host.name}</Text>
                <View style={styles.listItemFooter}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {podcast.category}
                    </Text>
                  </View>
                  <Text style={styles.listItemDuration}>
                    {podcast.duration}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  searchContainer: {
    padding: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    color: Colors.dark.subtext,
    marginLeft: 10,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScrollView: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: Colors.dark.primary,
  },
  categoryText: {
    color: Colors.dark.text,
  },
  activeCategoryText: {
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  podcastsScrollView: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  podcastCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    overflow: "hidden",
  },
  podcastImage: {
    width: "100%",
    height: 120,
  },
  podcastInfo: {
    padding: 12,
  },
  podcastTitle: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  podcastHost: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 8,
  },
  podcastStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginLeft: 4,
  },
  hostsScrollView: {
    paddingHorizontal: 15,
  },
  hostCard: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  hostAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  hostName: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  hostVerified: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
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
  listItemCard: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  listItemImage: {
    width: 80,
    height: 80,
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listItemTitle: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 14,
  },
  listItemHost: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  listItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(79, 124, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontWeight: "bold",
  },
  listItemDuration: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
});
