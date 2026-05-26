/**
 * Horní hlavička aplikace s tlačítky.
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

export function ReaderHeader({
  channelTitle,
  errorMessage,
  filterMode,
  isLoading,
  lastUpdatedLabel,
  onSelectFilterMode,
  onOpenHome,
  onOpenChannelPicker,
  onRefresh
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  function closeSidebar() {
    setIsSidebarVisible(false);
  }

  function handleOpenHome() {
    closeSidebar();
    onOpenHome();
  }

  function handleOpenChannelPicker() {
    closeSidebar();
    onOpenChannelPicker();
  }

  function handleRefresh() {
    closeSidebar();
    onRefresh();
  }

  function handleSelectFilterMode(nextMode) {
    closeSidebar();
    onSelectFilterMode(nextMode);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerLayout}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Mobilní RSS čtečka</Text>
            <Text style={styles.title}>{channelTitle}</Text>
            <Text style={styles.subtitle}>{lastUpdatedLabel}</Text>
          </View>

          <Pressable onPress={() => setIsSidebarVisible(true)} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7a3428" />
          <Text style={styles.loadingText}>Načítám aktuální zprávy...</Text>
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Modal
        animationType="fade"
        transparent
        visible={isSidebarVisible}
        onRequestClose={closeSidebar}
      >
        <View style={styles.sidebarBackdrop}>
          <Pressable style={styles.sidebarDismissArea} onPress={closeSidebar} />

          <View style={styles.sidebarDrawer}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu čtečky</Text>
              <Pressable onPress={closeSidebar} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarLabel}>Navigace</Text>

              <View style={styles.sidebarButtonColumn}>
                <Pressable style={styles.ghostButton} onPress={handleOpenHome}>
                  <Text style={styles.ghostButtonText}>Úvod</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleOpenChannelPicker}>
                  <Text style={styles.secondaryButtonText}>Kanály</Text>
                </Pressable>

                <Pressable style={styles.primaryButton} onPress={handleRefresh}>
                  <Text style={styles.primaryButtonText}>Obnovit</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarLabel}>Zobrazení článků</Text>

              <View style={styles.filterColumn}>
                <Pressable
                  onPress={() => handleSelectFilterMode("all")}
                  style={[
                    styles.filterButton,
                    filterMode === "all" ? styles.filterButtonActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterMode === "all" ? styles.filterButtonTextActive : null
                    ]}
                  >
                    Vše
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectFilterMode("favorites")}
                  style={[
                    styles.filterButton,
                    filterMode === "favorites" ? styles.filterButtonActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterMode === "favorites" ? styles.filterButtonTextActive : null
                    ]}
                  >
                    Oblíbené
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectFilterMode("readLater")}
                  style={[
                    styles.filterButton,
                    filterMode === "readLater" ? styles.filterButtonActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterMode === "readLater" ? styles.filterButtonTextActive : null
                    ]}
                  >
                    🕒 Přečíst později
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    paddingTop: (StatusBar.currentHeight ?? 0) + 20,
    paddingBottom: 14,
    backgroundColor: "#f4efe6"
  },
  headerLayout: {
    gap: 16
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  titleBlock: {
    flex: 1,
    gap: 4
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#9c6a3d"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2d241f"
  },
  subtitle: {
    fontSize: 13,
    color: "#6f6258"
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#efe5d9",
    borderWidth: 1,
    borderColor: "#dfcfbc",
    alignItems: "center",
    justifyContent: "center"
  },
  menuButtonText: {
    color: "#5d4e44",
    fontSize: 22,
    fontWeight: "800"
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20, 17, 14, 0.28)",
    flexDirection: "row"
  },
  sidebarDismissArea: {
    flex: 1
  },
  sidebarDrawer: {
    width: 300,
    backgroundColor: "#f8f1e8",
    paddingTop: (StatusBar.currentHeight ?? 0) + 18,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderLeftWidth: 1,
    borderLeftColor: "#dfcfbc",
    gap: 12
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sidebarTitle: {
    color: "#2d241f",
    fontSize: 20,
    fontWeight: "800"
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#eadfce",
    alignItems: "center",
    justifyContent: "center"
  },
  closeButtonText: {
    color: "#5e5046",
    fontWeight: "800"
  },
  sidebarSection: {
    backgroundColor: "#efe5d9",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dfcfbc"
  },
  sidebarLabel: {
    color: "#7a4a24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10
  },
  sidebarButtonColumn: {
    gap: 10
  },
  filterColumn: {
    gap: 10
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#7a3428",
    borderRadius: 14
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e8ddd0",
    borderRadius: 14
  },
  ghostButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f7f0e5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9cbb8"
  },
  primaryButtonText: {
    color: "#fffaf5",
    fontWeight: "700"
  },
  secondaryButtonText: {
    color: "#4a3e37",
    fontWeight: "700"
  },
  ghostButtonText: {
    color: "#5c4e45",
    fontWeight: "700"
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12
  },
  loadingText: {
    color: "#5f5147",
    fontSize: 13
  },
  errorText: {
    marginTop: 10,
    color: "#a12626",
    fontSize: 13,
    fontWeight: "600"
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f7efe5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#decebc"
  },
  filterButtonActive: {
    backgroundColor: "#7a3428"
  },
  filterButtonText: {
    color: "#5e5046",
    fontWeight: "700"
  },
  filterButtonTextActive: {
    color: "#fffaf5"
  }
});
