/**
 * Hlavní vstupní bod mobilní aplikace.
 *
 * Aplikace je navržená jako jednoduchá RSS čtečka splňující zadání:
 * - umí načítat veřejný RSS kanál,
 * - zobrazuje seznam zpráv,
 * - umí zobrazit detail zprávy,
 * - ukládá zprávy perzistentně pro offline režim,
 * - a automaticky se v intervalu obnovuje.
 *
 * Kvůli studijnímu charakteru projektu je kód rozdělený do více menších modulů
 * a obsahuje větší množství komentářů a JSDoc popisů.
 */

import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { ChannelPickerModal } from "./src/components/ChannelPickerModal";
import { ReaderHeader } from "./src/components/ReaderHeader";
import { ArticleDetail } from "./src/components/ArticleDetail";
import { ArticleList } from "./src/components/ArticleList";
import { EntryHelpScreen } from "./src/components/EntryHelpScreen";
import { EntryScreen } from "./src/components/EntryScreen";
import { useRssReader } from "./src/hooks/useRssReader";

export default function App() {
  const [entryView, setEntryView] = React.useState("home");
  const {
    addCustomChannel,
    articleErrorMessage,
    articles,
    currentPage,
    channelOptions,
    currentChannel,
    filterMode,
    errorMessage,
    goToNextPage,
    goToPreviousPage,
    isArticleLoading,
    isLoading,
    isPickerVisible,
    lastUpdatedLabel,
    selectedArticle,
    closeArticleDetail,
    deleteCustomChannel,
    hidePicker,
    loadSelectedChannel,
    openArticleDetail,
    pageCount,
    paginatedArticles,
    refreshCurrentChannel,
    selectFilterMode,
    totalDisplayedArticles,
    toggleFavorite,
    toggleReadLater,
    updateCustomChannel,
    showPicker
  } = useRssReader();

  function openEntryScreen() {
    setEntryView("home");
  }

  function enterReader() {
    setEntryView("reader");
  }

  function openHelpScreen() {
    setEntryView("help");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />

      <View style={styles.container}>
        {entryView === "home" ? (
          <EntryScreen
            articleCount={articles.length}
            channelTitle={currentChannel?.label ?? "RSS čtečka"}
            isLoading={isLoading}
            lastUpdatedLabel={lastUpdatedLabel}
            onEnterReader={enterReader}
            onOpenHelp={openHelpScreen}
            onOpenChannelPicker={showPicker}
            onRefresh={refreshCurrentChannel}
          />
        ) : entryView === "help" ? (
          <EntryHelpScreen onBack={openEntryScreen} />
        ) : (
          <>
            <ReaderHeader
              channelTitle={currentChannel?.label ?? "RSS čtečka"}
              errorMessage={errorMessage}
              filterMode={filterMode}
              isLoading={isLoading}
              lastUpdatedLabel={lastUpdatedLabel}
              onOpenHome={openEntryScreen}
              onOpenChannelPicker={showPicker}
              onRefresh={refreshCurrentChannel}
              onSelectFilterMode={selectFilterMode}
            />

            {selectedArticle ? (
              <ArticleDetail
                article={selectedArticle}
                articleErrorMessage={articleErrorMessage}
                isLoadingContent={isArticleLoading}
                onBack={closeArticleDetail}
                onToggleFavorite={toggleFavorite}
                onToggleReadLater={toggleReadLater}
              />
            ) : (
              <ArticleList
                articles={paginatedArticles}
                currentPage={currentPage}
                isLoading={isLoading}
                onOpenArticle={openArticleDetail}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
                pageCount={pageCount}
                totalArticles={totalDisplayedArticles}
              />
            )}
          </>
        )}

        <ChannelPickerModal
          channels={channelOptions}
          currentChannelUrl={currentChannel?.url ?? null}
          isVisible={isPickerVisible}
          onAddCustomChannel={addCustomChannel}
          onClose={hidePicker}
          onDeleteCustomChannel={deleteCustomChannel}
          onSelectChannel={loadSelectedChannel}
          onUpdateCustomChannel={updateCustomChannel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6"
  },
  container: {
    flex: 1,
    backgroundColor: "#f4efe6"
  }
});
