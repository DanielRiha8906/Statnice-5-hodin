/**
 * Vlastní hook, který drží hlavní stav aplikace.
 *
 * Sem soustředíme:
 * - načítání dat,
 * - obnovování dat,
 * - práci s offline cache,
 * - jednoduchou navigaci mezi seznamem a detailem,
 * - a databázově uložené seznamy oblíbených článků a "přečíst později".
 */

import { useEffect, useRef, useState } from "react";

import {
  AUTO_REFRESH_INTERVAL_MS,
  DEFAULT_CHANNELS,
  RELEVANCE_DAYS
} from "../constants/channels";
import {
  initializeArticleLibrary,
  loadSavedArticles,
  saveArticleState
} from "../services/articleLibraryService";
import { fetchFullArticleContent, fetchRssFeed } from "../services/rssService";
import {
  loadArticlesFromStorage,
  loadCustomChannels,
  loadCurrentChannel,
  loadLastUpdated,
  saveArticlesToStorage,
  saveCustomChannels,
  saveCurrentChannel,
  saveLastUpdated
} from "../services/storageService";
import { formatDateTime, isDateRelevant } from "../utils/date";

export function useRssReader() {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [customChannels, setCustomChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(DEFAULT_CHANNELS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [articleErrorMessage, setArticleErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("Zatím neproběhla synchronizace");

  const intervalReference = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      await initializeArticleLibrary();

      const savedChannel = await loadCurrentChannel();
      const savedCustomChannels = await loadCustomChannels();
      const cachedArticles = await loadArticlesFromStorage();
      const savedLastUpdated = await loadLastUpdated();
      const savedLibraryArticles = await loadSavedArticles();

      if (!isMounted) {
        return;
      }

      const normalizedCustomChannels = sanitizeChannelList(savedCustomChannels);
      const availableChannels = [...DEFAULT_CHANNELS, ...normalizedCustomChannels];
      const activeChannel = savedChannel ?? availableChannels[0] ?? DEFAULT_CHANNELS[0];
      const savedStatusMap = createSavedStatusMap(savedLibraryArticles);

      setCustomChannels(normalizedCustomChannels);
      setSavedArticles(normalizeSavedArticles(savedLibraryArticles));
      setCurrentChannel(activeChannel);
      setArticles(
        applySavedStatuses(filterRelevantArticles(cachedArticles), savedStatusMap)
      );

      if (savedLastUpdated) {
        setLastUpdatedLabel(`Poslední aktualizace: ${formatDateTime(savedLastUpdated)}`);
      }

      await refreshFeed(activeChannel, { silentError: true, savedStatusMap });
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentChannel) {
      return undefined;
    }

    intervalReference.current = setInterval(() => {
      refreshFeed(currentChannel, { silentError: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      if (intervalReference.current) {
        clearInterval(intervalReference.current);
      }
    };
  }, [currentChannel]);

  async function refreshFeed(channel = currentChannel, options = {}) {
    if (!channel) {
      return;
    }

    const { silentError = false, savedStatusMap = createSavedStatusMap(savedArticles) } = options;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const fetchedArticles = await fetchRssFeed(channel);
      const normalizedArticles = applySavedStatuses(fetchedArticles, savedStatusMap);
      const lastUpdated = new Date().toISOString();

      setArticles(normalizedArticles);
      setCurrentPage(1);
      setLastUpdatedLabel(`Poslední aktualizace: ${formatDateTime(lastUpdated)}`);

      await saveArticlesToStorage(normalizedArticles);
      await saveCurrentChannel(channel);
      await saveLastUpdated(lastUpdated);
    } catch (error) {
      if (!silentError) {
        setErrorMessage(
          "Nepodařilo se načíst RSS kanál. Zobrazují se poslední uložené zprávy."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSelectedChannel(channel) {
    setCurrentChannel(channel);
    setCurrentPage(1);
    setFilterMode("all");
    setIsPickerVisible(false);
    setSelectedArticle(null);
    await refreshFeed(channel);
  }

  async function addCustomChannel(input) {
    const normalizedUrl = normalizeChannelUrl(input.url);
    const normalizedLabel = normalizeChannelLabel(input.label, normalizedUrl);

    if (!normalizedUrl) {
      return {
        success: false,
        message: "Zadej platnou URL adresu RSS kanálu."
      };
    }

    const duplicateChannel = [...DEFAULT_CHANNELS, ...customChannels].find(
      (channel) => channel.url.toLowerCase() === normalizedUrl.toLowerCase()
    );

    if (duplicateChannel) {
      await loadSelectedChannel(duplicateChannel);
      return { success: true, message: "" };
    }

    const newChannel = createCustomChannelRecord(normalizedLabel, normalizedUrl);

    try {
      await fetchRssFeed(newChannel);

      const updatedCustomChannels = [...customChannels, newChannel];
      setCustomChannels(updatedCustomChannels);
      await saveCustomChannels(updatedCustomChannels);
      await loadSelectedChannel(newChannel);

      return { success: true, message: "" };
    } catch (error) {
      return {
        success: false,
        message: "Zadanou adresu se nepodařilo načíst jako RSS kanál."
      };
    }
  }

  async function updateCustomChannel(channelId, input) {
    const normalizedUrl = normalizeChannelUrl(input.url);
    const existingChannel = customChannels.find((channel) => channel.id === channelId);

    if (!existingChannel) {
      return {
        success: false,
        message: "Vybraný kanál se nepodařilo najít."
      };
    }

    if (!normalizedUrl) {
      return {
        success: false,
        message: "Zadej platnou URL adresu RSS kanálu."
      };
    }

    const normalizedLabel = normalizeChannelLabel(input.label, normalizedUrl);
    const duplicateChannel = [...DEFAULT_CHANNELS, ...customChannels].find(
      (channel) =>
        channel.id !== channelId &&
        channel.url.toLowerCase() === normalizedUrl.toLowerCase()
    );

    if (duplicateChannel) {
      return {
        success: false,
        message: "Kanál s touto URL už v seznamu existuje."
      };
    }

    const updatedChannel = createCustomChannelRecord(
      normalizedLabel,
      normalizedUrl,
      existingChannel.id
    );

    try {
      await fetchRssFeed(updatedChannel);

      const updatedCustomChannels = customChannels.map((channel) =>
        channel.id === channelId ? updatedChannel : channel
      );

      setCustomChannels(updatedCustomChannels);
      await saveCustomChannels(updatedCustomChannels);

      if (currentChannel?.id === channelId || currentChannel?.url === existingChannel.url) {
        setCurrentChannel(updatedChannel);
        await saveCurrentChannel(updatedChannel);
        await refreshFeed(updatedChannel);
      }

      return { success: true, message: "" };
    } catch (error) {
      return {
        success: false,
        message: "Upravenou adresu se nepodařilo načíst jako RSS kanál."
      };
    }
  }

  async function deleteCustomChannel(channelId) {
    const channelToDelete = customChannels.find((channel) => channel.id === channelId);

    if (!channelToDelete) {
      return;
    }

    const updatedCustomChannels = customChannels.filter(
      (channel) => channel.id !== channelId
    );

    setCustomChannels(updatedCustomChannels);
    await saveCustomChannels(updatedCustomChannels);

    if (currentChannel?.id === channelId || currentChannel?.url === channelToDelete.url) {
      const fallbackChannel = DEFAULT_CHANNELS[0];
      setCurrentChannel(fallbackChannel);
      setCurrentPage(1);
      setFilterMode("all");
      setSelectedArticle(null);
      await saveCurrentChannel(fallbackChannel);
      await refreshFeed(fallbackChannel);
    }
  }

  async function toggleFavorite(article) {
    await persistArticleFlags(article, {
      isFavorite: !article.isFavorite,
      isReadLater: article.isReadLater
    });
  }

  async function toggleReadLater(article) {
    await persistArticleFlags(article, {
      isFavorite: article.isFavorite,
      isReadLater: !article.isReadLater
    });
  }

  async function persistArticleFlags(article, nextFlags) {
    const normalizedArticle = {
      ...article,
      isFavorite: Boolean(nextFlags.isFavorite),
      isReadLater: Boolean(nextFlags.isReadLater),
      channelLabel: currentChannel?.label || article.channelLabel || "",
      channelUrl: currentChannel?.url || article.channelUrl || ""
    };

    await saveArticleState(normalizedArticle, {
      currentChannel,
      isFavorite: normalizedArticle.isFavorite,
      isReadLater: normalizedArticle.isReadLater
    });

    const refreshedSavedArticles = normalizeSavedArticles(await loadSavedArticles());
    setSavedArticles(refreshedSavedArticles);

    const savedStatusMap = createSavedStatusMap(refreshedSavedArticles);

    setArticles((currentArticles) =>
      applySavedStatuses(
        currentArticles.map((currentArticle) =>
          currentArticle.id === normalizedArticle.id
            ? { ...currentArticle, ...normalizedArticle }
            : currentArticle
        ),
        savedStatusMap
      )
    );

    setSelectedArticle((currentArticle) =>
      currentArticle?.id === normalizedArticle.id
        ? { ...currentArticle, ...normalizedArticle }
        : currentArticle
    );
  }

  async function openArticleDetail(article) {
    setSelectedArticle(article);
    setArticleErrorMessage("");

    if (!article?.link) {
      return;
    }

    try {
      setIsArticleLoading(true);

      const fullContent = await fetchFullArticleContent(article);

      if (!isBetterArticleContent(fullContent, article)) {
        return;
      }

      const updatedArticle = {
        ...article,
        content: fullContent
      };

      setSelectedArticle(updatedArticle);
      setArticles((currentArticles) => {
        const updatedArticles = currentArticles.map((currentArticle) =>
          currentArticle.id === updatedArticle.id ? updatedArticle : currentArticle
        );

        saveArticlesToStorage(updatedArticles);
        return updatedArticles;
      });

      if (updatedArticle.isFavorite || updatedArticle.isReadLater) {
        await saveArticleState(updatedArticle, {
          currentChannel,
          isFavorite: updatedArticle.isFavorite,
          isReadLater: updatedArticle.isReadLater
        });

        setSavedArticles(normalizeSavedArticles(await loadSavedArticles()));
      }
    } catch (error) {
      setArticleErrorMessage(
        "Celý článek se nepodařilo stáhnout, proto zůstává zobrazená RSS verze."
      );
    } finally {
      setIsArticleLoading(false);
    }
  }

  function closeArticleDetail() {
    setSelectedArticle(null);
    setArticleErrorMessage("");
    setIsArticleLoading(false);
  }

  function selectFilterMode(nextMode) {
    setFilterMode(nextMode);
    setCurrentPage(1);
    setSelectedArticle(null);
  }

  const displayedArticles =
    filterMode === "all"
      ? articles
      : savedArticles.filter((article) =>
          filterMode === "favorites" ? article.isFavorite : article.isReadLater
        );

  const pageCount = getPageCount(displayedArticles.length);
  const paginatedArticles = getArticlesForPage(displayedArticles, currentPage);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  function goToNextPage() {
    setCurrentPage((page) => Math.min(page + 1, pageCount));
  }

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }

  function showPicker() {
    setIsPickerVisible(true);
  }

  function hidePicker() {
    setIsPickerVisible(false);
  }

  return {
    articleErrorMessage,
    articles,
    currentPage,
    channelOptions: [...DEFAULT_CHANNELS, ...customChannels],
    currentChannel,
    customChannels,
    errorMessage,
    addCustomChannel,
    deleteCustomChannel,
    filterMode,
    goToNextPage,
    goToPreviousPage,
    isArticleLoading,
    isLoading,
    isPickerVisible,
    lastUpdatedLabel,
    pageCount,
    paginatedArticles,
    refreshCurrentChannel: () => refreshFeed(currentChannel),
    savedArticles,
    selectFilterMode,
    selectedArticle,
    totalDisplayedArticles: displayedArticles.length,
    closeArticleDetail,
    hidePicker,
    loadSelectedChannel,
    openArticleDetail,
    showPicker,
    toggleFavorite,
    toggleReadLater,
    updateCustomChannel
  };
}

function filterRelevantArticles(articles) {
  return articles.filter((article) =>
    isDateRelevant(article.pubDate, RELEVANCE_DAYS)
  );
}

function isBetterArticleContent(fullContent, article) {
  const currentContent = article.content || article.description || "";
  const normalizedCurrentContent = currentContent.trim();
  const normalizedFullContent = (fullContent || "").trim();

  if (!normalizedFullContent) {
    return false;
  }

  if (normalizedFullContent.length <= normalizedCurrentContent.length + 40) {
    return false;
  }

  return !normalizedFullContent.startsWith(normalizedCurrentContent);
}

function sanitizeChannelList(channels) {
  return channels
    .filter((channel) => channel?.label && channel?.url)
    .map((channel) => ({
      ...channel,
      id: channel.id || createChannelId(channel.url),
      isCustom: true
    }));
}

function normalizeChannelUrl(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const urlWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(urlWithProtocol).toString();
  } catch (error) {
    return "";
  }
}

function createChannelLabel(urlValue) {
  const parsedUrl = new URL(urlValue);
  const hostLabel = parsedUrl.hostname.replace(/^www\./i, "");

  return `Vlastní kanál - ${hostLabel}`;
}

function normalizeChannelLabel(labelValue, fallbackUrl) {
  const trimmedLabel = labelValue.trim();
  return trimmedLabel || createChannelLabel(fallbackUrl);
}

function createCustomChannelRecord(label, url, existingId) {
  return {
    id: existingId || createChannelId(url),
    isCustom: true,
    label,
    url
  };
}

function createChannelId(urlValue) {
  return `custom-${urlValue.toLowerCase()}`;
}

function createSavedStatusMap(savedArticles) {
  return savedArticles.reduce((map, article) => {
    map[article.id] = {
      isFavorite: Boolean(article.isFavorite),
      isReadLater: Boolean(article.isReadLater)
    };
    return map;
  }, {});
}

function applySavedStatuses(articles, savedStatusMap) {
  return articles.map((article) => ({
    ...article,
    isFavorite: Boolean(savedStatusMap[article.id]?.isFavorite),
    isReadLater: Boolean(savedStatusMap[article.id]?.isReadLater)
  }));
}

function normalizeSavedArticles(savedArticles) {
  return savedArticles.map((article) => ({
    ...article,
    isFavorite: Boolean(article.isFavorite),
    isReadLater: Boolean(article.isReadLater)
  }));
}

function getPageCount(articleCount) {
  return Math.max(1, Math.ceil(articleCount / ARTICLES_PER_PAGE));
}

function getArticlesForPage(articles, currentPage) {
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  return articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
}

const ARTICLES_PER_PAGE = 10;
