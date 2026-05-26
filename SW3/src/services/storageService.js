/**
 * Perzistentní ukládání dat pomocí AsyncStorage.
 *
 * AsyncStorage je jednoduchá klíč-hodnota databáze běžně používaná v React
 * Native aplikacích pro lokální persistenci menších objemů dat.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  cachedArticles: "rss-reader.cached-articles",
  currentChannel: "rss-reader.current-channel",
  customChannels: "rss-reader.custom-channels",
  lastUpdated: "rss-reader.last-updated"
};

/**
 * Uloží balík článků do lokálního úložiště.
 */
export async function saveArticlesToStorage(articles) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.cachedArticles,
    JSON.stringify(articles)
  );
}

/**
 * Načte dříve uložené články z lokálního úložiště.
 */
export async function loadArticlesFromStorage() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.cachedArticles);
  return rawValue ? JSON.parse(rawValue) : [];
}

/**
 * Uloží aktivně zvolený RSS kanál.
 */
export async function saveCurrentChannel(channel) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.currentChannel,
    JSON.stringify(channel)
  );
}

/**
 * Načte naposledy zvolený RSS kanál.
 */
export async function loadCurrentChannel() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.currentChannel);
  return rawValue ? JSON.parse(rawValue) : null;
}

/**
 * Uloží uživatelsky přidané RSS kanály.
 */
export async function saveCustomChannels(channels) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.customChannels,
    JSON.stringify(channels)
  );
}

/**
 * Načte uživatelsky přidané RSS kanály.
 */
export async function loadCustomChannels() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.customChannels);
  return rawValue ? JSON.parse(rawValue) : [];
}

/**
 * Uloží čas poslední úspěšné synchronizace.
 */
export async function saveLastUpdated(timestamp) {
  await AsyncStorage.setItem(STORAGE_KEYS.lastUpdated, timestamp);
}

/**
 * Načte čas poslední synchronizace.
 */
export async function loadLastUpdated() {
  return AsyncStorage.getItem(STORAGE_KEYS.lastUpdated);
}
