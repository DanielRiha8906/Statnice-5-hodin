/**
 * Služba pro načítání a parsování RSS XML.
 *
 * V projektu nepoužíváme velkou externí XML knihovnu. Pro potřeby školní
 * demonstrace si vystačíme s jednodušším parserem nad XML textem. To má dvě
 * výhody:
 * - řešení je menší a přehlednější,
 * - a student může lépe vysvětlit celý tok dat end-to-end.
 *
 * Omezení:
 * Tento parser není obecný XML parser pro všechny možné varianty RSS/Atom
 * standardu. Je ale dostatečný pro běžné veřejné RSS zdroje tohoto typu.
 */

import { RELEVANCE_DAYS } from "../constants/channels";
import { isDateRelevant, parseDateSafely } from "../utils/date";

/**
 * Načte a zpracuje RSS kanál z dané URL adresy.
 */
export async function fetchRssFeed(channel) {
  const response = await fetch(channel.url);

  if (!response.ok) {
    throw new Error(`RSS kanál se nepodařilo načíst. HTTP ${response.status}`);
  }

  const xmlText = await response.text();
  const parsedArticles = parseRssXml(xmlText);

  return parsedArticles
    .filter((article) => isDateRelevant(article.pubDate, RELEVANCE_DAYS))
    .sort(sortArticlesByNewestFirst);
}

/**
 * Pokusí se načíst celý text článku z původní webové stránky.
 */
export async function fetchFullArticleContent(article) {
  if (!article?.link) {
    return article?.content || article?.description || "";
  }

  const response = await fetch(article.link);

  if (!response.ok) {
    throw new Error(`Článek se nepodařilo načíst. HTTP ${response.status}`);
  }

  const htmlText = await response.text();
  const extractedContent = extractArticleTextFromHtml(htmlText);

  return extractedContent || article.content || article.description || "";
}

/**
 * Rozparsuje XML RSS do pole článků.
 */
export function parseRssXml(xmlText) {
  const itemMatches = xmlText.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return itemMatches.map((itemXml, index) => {
    const title = normalizeXmlText(extractTagValue(itemXml, "title")) || "Bez názvu";
    const link = normalizeXmlText(extractTagValue(itemXml, "link")) || "";
    const description = normalizeXmlText(extractTagValue(itemXml, "description")) || "Bez popisu";
    const pubDate = normalizeXmlText(extractTagValue(itemXml, "pubDate")) || "";
    const guid = normalizeXmlText(extractTagValue(itemXml, "guid")) || `${link}-${index}`;

    return {
      id: guid,
      title,
      link,
      description: stripHtml(description),
      pubDate,
      content:
        formatArticleText(
          normalizeXmlText(extractTagValue(itemXml, "content:encoded"))
        ) || formatArticleText(description)
    };
  });
}

/**
 * Vytáhne obsah jednoho XML tagu.
 *
 * Použití regulárního výrazu je zde kompromisní řešení pro přehlednost. Na
 * robustní XML zpracování by byla vhodnější plnohodnotná parser knihovna.
 */
function extractTagValue(xmlFragment, tagName) {
  const escapedTagName = tagName.replace(":", "\\:");
  const regularExpression = new RegExp(
    `<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`,
    "i"
  );
  const match = xmlFragment.match(regularExpression);

  return match ? match[1].trim() : "";
}

/**
 * Odstraní nejběžnější HTML značky z popisů.
 */
function stripHtml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Převádí HTML text článku na čitelný víceodstavcový obsah.
 */
function formatArticleText(value) {
  return cleanupArticleText(
    normalizeWhitespace(
      decodeXmlEntities(value)
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|h6|li|ul|ol|blockquote)>/gi, "\n\n")
        .replace(/<li\b[^>]*>/gi, "- ")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

/**
 * Rozbalí CDATA a dekóduje běžné XML entity.
 */
function normalizeXmlText(value) {
  return decodeXmlEntities(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
}

function extractArticleTextFromHtml(htmlText) {
  const sanitizedHtml = htmlText
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|iframe|svg|form|footer|nav|aside)\b[\s\S]*?<\/\1>/gi, " ");

  const structuredArticleText = extractStructuredArticleText(htmlText);

  if (structuredArticleText) {
    return structuredArticleText;
  }

  const candidates = [
    ...collectHtmlCandidates(
      sanitizedHtml,
      /<article\b[^>]*>([\s\S]*?)<\/article>/gi,
      5
    ),
    ...collectHtmlCandidates(
      sanitizedHtml,
      /<(main|section|div)\b[^>]*(?:class|id)=["'][^"']*(article|content|body|text|story|entry|post|detail|node)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi,
      3
    ),
    ...collectHtmlCandidates(
      sanitizedHtml,
      /<div\b[^>]*(?:class|id)=["'][^"']*(paragraph|perex|article-body|article-content|detail-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      4
    )
  ];

  const bestCandidate = candidates
    .filter((candidate) => candidate.text.length > 280)
    .sort((candidateA, candidateB) => candidateB.score - candidateA.score)[0];

  if (bestCandidate) {
    return bestCandidate.text;
  }

  const bodyMatch = sanitizedHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? formatArticleText(bodyMatch[1]) : "";
}

function extractStructuredArticleText(htmlText) {
  const scriptMatches = htmlText.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of scriptMatches) {
    const scriptContent = decodeXmlEntities(match[1].trim());

    if (!scriptContent) {
      continue;
    }

    const parsedJson = tryParseJson(scriptContent);

    if (!parsedJson) {
      continue;
    }

    const articleBody = findArticleBodyInStructuredData(parsedJson);

    if (articleBody) {
      return formatArticleText(articleBody);
    }
  }

  return "";
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function findArticleBodyInStructuredData(value) {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const articleBody = findArticleBodyInStructuredData(item);

      if (articleBody) {
        return articleBody;
      }
    }

    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  if (typeof value.articleBody === "string" && value.articleBody.trim()) {
    return value.articleBody.trim();
  }

  if (value["@graph"]) {
    return findArticleBodyInStructuredData(value["@graph"]);
  }

  for (const nestedValue of Object.values(value)) {
    const articleBody = findArticleBodyInStructuredData(nestedValue);

    if (articleBody) {
      return articleBody;
    }
  }

  return "";
}

function collectHtmlCandidates(htmlText, pattern, keywordScore) {
  const candidates = [];

  for (const match of htmlText.matchAll(pattern)) {
    const htmlFragment = match[match.length - 1];
    const text = formatArticleText(htmlFragment);

    if (!text) {
      continue;
    }

    const paragraphCount = text.split(/\n{2,}/).filter(Boolean).length;
    const score = text.length + paragraphCount * 120 + keywordScore * 250;

    candidates.push({
      score,
      text
    });
  }

  return candidates;
}

function normalizeWhitespace(value) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanupArticleText(value) {
  return normalizeWhitespace(
    value
      .replace(/\b[oO]dkaz\b(?=\s|$|[.,;:!?])/g, "")
      .replace(/\(\s*\)/g, "")
      .replace(/\n{2,}Štítky[\s\S]*$/i, "")
      .replace(/^Štítky[\s\S]*$/im, "")
  );
}

/**
 * Převede nejběžnější XML entity na čitelný text.
 */
function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

/**
 * Seřadí články od nejnovějších.
 */
function sortArticlesByNewestFirst(articleA, articleB) {
  const dateA = parseDateSafely(articleA.pubDate)?.getTime() ?? 0;
  const dateB = parseDateSafely(articleB.pubDate)?.getTime() ?? 0;

  return dateB - dateA;
}
