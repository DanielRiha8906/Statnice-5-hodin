/**
 * Seznamové zobrazení článků.
 *
 * V Android ekosystému by se v zadání často mluvilo o RecyclerView.
 * V React Native plní stejnou roli efektivní komponenta FlatList.
 */

import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDateTime } from "../utils/date";

export function ArticleList({
  articles,
  currentPage,
  isLoading,
  onNextPage,
  onOpenArticle,
  onPreviousPage,
  pageCount,
  totalArticles
}) {
  if (!isLoading && totalArticles === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Zatím nejsou k dispozici žádné zprávy</Text>
        <Text style={styles.emptyText}>
          Zkus načíst jiný kanál nebo obnovit data, až bude zařízení online.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={articles}
      keyExtractor={(item) => item.id}
      ListFooterComponent={
        totalArticles > 10 ? (
          <View style={styles.paginationWrapper}>
            <Text style={styles.paginationLabel}>
              Strana {currentPage} z {pageCount} • {totalArticles} článků
            </Text>

            <View style={styles.paginationRow}>
              <Pressable
                disabled={currentPage === 1}
                onPress={onPreviousPage}
                style={[
                  styles.paginationButton,
                  currentPage === 1 ? styles.paginationButtonDisabled : null
                ]}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    currentPage === 1 ? styles.paginationButtonTextDisabled : null
                  ]}
                >
                  Předchozí
                </Text>
              </Pressable>

              <Pressable
                disabled={currentPage === pageCount}
                onPress={onNextPage}
                style={[
                  styles.paginationButtonPrimary,
                  currentPage === pageCount ? styles.paginationButtonDisabled : null
                ]}
              >
                <Text
                  style={[
                    styles.paginationPrimaryText,
                    currentPage === pageCount ? styles.paginationButtonTextDisabled : null
                  ]}
                >
                  Další
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => onOpenArticle(item)}>
          <Text style={styles.date}>{formatDateTime(item.pubDate)}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.badgeColumn}>
              {item.isFavorite ? <Text style={styles.favoriteBadge}>★</Text> : null}
              {item.isReadLater ? <Text style={styles.readLaterBadge}>🕒 Později</Text> : null}
            </View>
          </View>
          <Text numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 14
  },
  card: {
    backgroundColor: "#fffaf5",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eadbc8",
    shadowColor: "#6c4c2f",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 3
  },
  date: {
    color: "#9c6a3d",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8
  },
  title: {
    flex: 1,
    color: "#2d241f",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  badgeColumn: {
    alignItems: "flex-end",
    gap: 6
  },
  favoriteBadge: {
    color: "#a45a1f",
    fontWeight: "900"
  },
  readLaterBadge: {
    backgroundColor: "#dfe8d8",
    color: "#385239",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  description: {
    color: "#584b41",
    fontSize: 15,
    lineHeight: 22
  },
  paginationWrapper: {
    marginTop: 8,
    paddingBottom: 12
  },
  paginationLabel: {
    color: "#6a5d52",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12
  },
  paginationRow: {
    flexDirection: "row",
    gap: 10
  },
  paginationButton: {
    flex: 1,
    backgroundColor: "#e8ddd0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  paginationButtonPrimary: {
    flex: 1,
    backgroundColor: "#7a3428",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  paginationButtonDisabled: {
    opacity: 0.5
  },
  paginationButtonText: {
    color: "#4a3e37",
    fontWeight: "700",
    textAlign: "center"
  },
  paginationPrimaryText: {
    color: "#fffaf5",
    fontWeight: "700",
    textAlign: "center"
  },
  paginationButtonTextDisabled: {
    color: "#7c7066"
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  emptyTitle: {
    color: "#2d241f",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10
  },
  emptyText: {
    color: "#6f6258",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22
  }
});
