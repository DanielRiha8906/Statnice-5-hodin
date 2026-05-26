/**
 * Detail vybraného článku.
 */

import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { formatDateTime } from "../utils/date";

export function ArticleDetail({
  article,
  articleErrorMessage,
  isLoadingContent,
  onBack,
  onToggleFavorite,
  onToggleReadLater
}) {
  async function openOriginalLink() {
    if (!article.link) {
      return;
    }

    await Linking.openURL(article.link);
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Zpět na seznam</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.date}>{formatDateTime(article.pubDate)}</Text>
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onToggleFavorite(article)}
            style={[
              styles.stateButton,
              article.isFavorite ? styles.stateButtonActive : null
            ]}
          >
            <Text
              style={[
                styles.stateButtonText,
                article.isFavorite ? styles.stateButtonTextActive : null
              ]}
            >
              {article.isFavorite ? "★ Oblíbené" : "☆ Přidat do oblíbených"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onToggleReadLater(article)}
            style={[
              styles.stateButtonSecondary,
              article.isReadLater ? styles.stateButtonActive : null
            ]}
          >
            <Text
              style={[
                styles.stateButtonText,
                article.isReadLater ? styles.stateButtonTextActive : null
              ]}
            >
              {article.isReadLater ? "✓ Přečíst později" : "+ Přečíst později"}
            </Text>
          </Pressable>
        </View>

        {isLoadingContent ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#7a3428" />
            <Text style={styles.loadingText}>Načítám celý článek z původního webu...</Text>
          </View>
        ) : null}

        {articleErrorMessage ? (
          <Text style={styles.errorText}>{articleErrorMessage}</Text>
        ) : null}

        <Text style={styles.description}>{article.content || article.description}</Text>

        {article.link ? (
          <Pressable style={styles.linkButton} onPress={openOriginalLink}>
            <Text style={styles.linkButtonText}>Otevřít původní článek</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 28
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#e8ddd0",
    borderRadius: 14
  },
  backButtonText: {
    color: "#4a3e37",
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#fffaf5",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eadbc8"
  },
  date: {
    color: "#9c6a3d",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10
  },
  title: {
    color: "#2d241f",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 16
  },
  description: {
    color: "#584b41",
    fontSize: 16,
    lineHeight: 26
  },
  actionRow: {
    gap: 10,
    marginBottom: 16
  },
  stateButton: {
    backgroundColor: "#f6e7d0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e4cda8"
  },
  stateButtonSecondary: {
    backgroundColor: "#eef2e7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#cdd8c3"
  },
  stateButtonActive: {
    backgroundColor: "#7a3428",
    borderColor: "#7a3428"
  },
  stateButtonText: {
    color: "#4d4138",
    fontWeight: "700"
  },
  stateButtonTextActive: {
    color: "#fffaf5"
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14
  },
  loadingText: {
    color: "#5f5147",
    fontSize: 13
  },
  errorText: {
    marginBottom: 14,
    color: "#a12626",
    fontSize: 13,
    fontWeight: "600"
  },
  linkButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#7a3428",
    borderRadius: 14
  },
  linkButtonText: {
    color: "#fffaf5",
    fontWeight: "700"
  }
});
