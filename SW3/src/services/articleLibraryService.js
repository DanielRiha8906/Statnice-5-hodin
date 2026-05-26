/**
 * Lokální databáze SQLite pro oblíbené články a seznam "přečíst později".
 */

import * as SQLite from "expo-sqlite";

const databasePromise = SQLite.openDatabaseAsync("rss-reader-library.db");

export async function initializeArticleLibrary() {
  const database = await databasePromise;

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS saved_articles (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      link TEXT,
      description TEXT,
      pub_date TEXT,
      content TEXT,
      channel_label TEXT,
      channel_url TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_read_later INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export async function loadSavedArticles() {
  const database = await databasePromise;

  return database.getAllAsync(`
    SELECT
      id,
      title,
      link,
      description,
      pub_date AS pubDate,
      content,
      channel_label AS channelLabel,
      channel_url AS channelUrl,
      is_favorite AS isFavorite,
      is_read_later AS isReadLater,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM saved_articles
    WHERE is_favorite = 1 OR is_read_later = 1
    ORDER BY updated_at DESC
  `);
}

export async function saveArticleState(article, options = {}) {
  const database = await databasePromise;
  const { isFavorite = false, isReadLater = false, currentChannel = null } = options;
  const timestamp = new Date().toISOString();

  if (!isFavorite && !isReadLater) {
    await database.runAsync(
      "DELETE FROM saved_articles WHERE id = ?",
      article.id
    );
    return;
  }

  await database.runAsync(
    `
      INSERT INTO saved_articles (
        id,
        title,
        link,
        description,
        pub_date,
        content,
        channel_label,
        channel_url,
        is_favorite,
        is_read_later,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        link = excluded.link,
        description = excluded.description,
        pub_date = excluded.pub_date,
        content = excluded.content,
        channel_label = excluded.channel_label,
        channel_url = excluded.channel_url,
        is_favorite = excluded.is_favorite,
        is_read_later = excluded.is_read_later,
        updated_at = excluded.updated_at
    `,
    article.id,
    article.title || "Bez názvu",
    article.link || "",
    article.description || "",
    article.pubDate || "",
    article.content || "",
    currentChannel?.label || article.channelLabel || "",
    currentChannel?.url || article.channelUrl || "",
    isFavorite ? 1 : 0,
    isReadLater ? 1 : 0,
    timestamp,
    timestamp
  );
}
