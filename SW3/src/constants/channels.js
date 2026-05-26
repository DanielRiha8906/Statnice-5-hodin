/**
 * Předdefinované veřejné RSS kanály.
 *
 * Zadání říká "např. https://www.idnes.cz/rss", proto je iDNES použité jako
 * výchozí ukázkový zdroj. Pole lze snadno rozšířit o další veřejné kanály.
 */

export const DEFAULT_CHANNELS = [
  {
    label: "iDNES - Hlavní zprávy",
    url: "https://servis.idnes.cz/rss.aspx"
  },
  {
    label: "iDNES - Zpravodajství",
    url: "https://servis.idnes.cz/rss.aspx?c=zpravodaj"
  },
  {
    label: "ČT24 - Hlavní zprávy",
    url: "https://ct24.ceskatelevize.cz/rss/hlavni-zpravy"
  }
];

/**
 * Zprávy chceme zobrazovat i offline, ale jen časově relevantní.
 *
 * Pro demonstrační projekt používáme jednoduché pravidlo:
 * ponecháme články publikované za posledních 7 dnů. Toto rozhodnutí je snadno
 * obhajitelné a zároveň se dobře implementuje i vysvětluje.
 */
export const RELEVANCE_DAYS = 7;

/**
 * Automatická aktualizace RSS kanálu.
 *
 * Interval je nastaven na 15 minut. V produkci by mohl být konfigurovatelný
 * nebo řízený background taskem, ale pro školní ukázku je tento přístup plně
 * dostačující.
 */
export const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
