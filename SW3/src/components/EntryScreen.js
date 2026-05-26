/**
 * Úvodní obrazovka aplikace.
 */

import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

export function EntryScreen({
  articleCount,
  channelTitle,
  isLoading,
  lastUpdatedLabel,
  onEnterReader,
  onOpenHelp,
  onOpenChannelPicker,
  onRefresh
}) {
  const { height } = useWindowDimensions();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainer,
        { minHeight: height }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />

        <View style={styles.topRow}>
          <Text style={styles.eyebrow}>Ranní přehled bez chaosu</Text>
          <Pressable onPress={onOpenHelp} style={styles.helpButton}>
            <Text style={styles.helpButtonText}>?</Text>
          </Pressable>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>Vstup do zpravodajské čtečky</Text>
          <Text style={styles.lead}>
            Místo obyčejného seznamu dostaneš rychlý rozcestník, odkud si zvolíš
            zdroj a pak přejdeš rovnou do čtení.
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Aktivní kanál</Text>
              <Text style={styles.badgeValue}>{channelTitle}</Text>
            </View>

            <View style={styles.badgeAccent}>
              <Text style={styles.badgeLabelDark}>Dostupné články</Text>
              <Text style={styles.badgeValueDark}>{articleCount}</Text>
            </View>
          </View>

          <View style={styles.actionColumn}>
            <Pressable style={styles.primaryButton} onPress={onEnterReader}>
              <Text style={styles.primaryButtonText}>Vstoupit do přehledu</Text>
            </Pressable>

            <View style={styles.secondaryRow}>
              <Pressable style={styles.secondaryButton} onPress={onOpenChannelPicker}>
                <Text style={styles.secondaryButtonText}>Vybrat kanál</Text>
              </Pressable>

              <Pressable style={styles.ghostButton} onPress={onRefresh}>
                <Text style={styles.ghostButtonText}>
                  {isLoading ? "Načítám..." : "Obnovit data"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.syncFooter}>{lastUpdatedLabel}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  },
  heroCard: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1f2a24",
    paddingTop: (StatusBar.currentHeight ?? 0) + 18,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "android" ? 76 : 40
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26
  },
  helpButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(248, 243, 235, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 243, 235, 0.24)",
    alignItems: "center",
    justifyContent: "center"
  },
  helpButtonText: {
    color: "#fff7ed",
    fontSize: 20,
    fontWeight: "900"
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    gap: 18
  },
  heroGlowLarge: {
    position: "absolute",
    top: -30,
    right: -10,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#c46e3d"
  },
  heroGlowSmall: {
    position: "absolute",
    bottom: -18,
    left: -12,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#7c8f73"
  },
  eyebrow: {
    color: "#d8c4a6",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    color: "#f8f3eb",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900"
  },
  lead: {
    color: "#e5ddd0",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320
  },
  badgeRow: {
    gap: 12
  },
  badge: {
    backgroundColor: "rgba(248, 243, 235, 0.12)",
    padding: 16,
    borderRadius: 18
  },
  badgeAccent: {
    backgroundColor: "#f0ddc3",
    padding: 16,
    borderRadius: 18
  },
  badgeLabel: {
    color: "#d7c6ae",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  badgeValue: {
    color: "#fffaf4",
    fontSize: 20,
    fontWeight: "800"
  },
  badgeLabelDark: {
    color: "#7a4a24",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  badgeValueDark: {
    color: "#372117",
    fontSize: 30,
    fontWeight: "900"
  },
  actionColumn: {
    gap: 12
  },
  primaryButton: {
    backgroundColor: "#f6ead8",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18
  },
  primaryButtonText: {
    color: "#231810",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#6c3426",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: "#fff6ed",
    fontWeight: "700",
    textAlign: "center"
  },
  ghostButton: {
    flex: 1,
    backgroundColor: "rgba(248, 243, 235, 0.12)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(248, 243, 235, 0.22)"
  },
  ghostButtonText: {
    color: "#f5ede1",
    fontWeight: "700",
    textAlign: "center"
  },
  syncFooter: {
    color: "#d4dbd3",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 24
  }
});
