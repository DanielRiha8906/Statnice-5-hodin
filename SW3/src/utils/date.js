/**
 * Pomocné funkce pro datumy a čas.
 */

/**
 * Bezpečně převede textové datum na objekt Date.
 *
 * Pokud se datum nepodaří rozumně interpretovat, vrátíme null. Díky tomu pak
 * můžeme v dalších částech kódu dobře ošetřit články s neúplnými daty.
 */
export function parseDateSafely(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

/**
 * Vrátí true, pokud je článek ještě považovaný za časově relevantní.
 */
export function isDateRelevant(dateValue, relevanceDays) {
  const parsedDate = parseDateSafely(dateValue);

  if (!parsedDate) {
    return true;
  }

  const currentTime = Date.now();
  const relevanceWindowMs = relevanceDays * 24 * 60 * 60 * 1000;

  return currentTime - parsedDate.getTime() <= relevanceWindowMs;
}

/**
 * Vytvoří lidsky čitelný popis času pro UI.
 */
export function formatDateTime(dateValue) {
  const parsedDate = parseDateSafely(dateValue);

  if (!parsedDate) {
    return "Neznámé datum";
  }

  return parsedDate.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

