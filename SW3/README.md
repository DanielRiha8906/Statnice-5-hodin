# Mobilní RSS čtečka v React Native

Tento projekt je mobilní aplikace postavená v React Native a Expo. Slouží jako studijní ukázka RSS čtečky, která umí načítat veřejné zpravodajské kanály, ukládat data pro offline použití a pracovat i s uživatelsky spravovanými RSS zdroji.

## Co aplikace umí

- Úvodní obrazovku s rychlým vstupem do čtečky, informací o aktivním kanálu a počtu dostupných článků
- Samostatnou nápovědu vysvětlující fungování aplikace
- Výběr vestavěných RSS kanálů
- Přidání, úpravu a smazání vlastních RSS kanálů přes URL adresu
- Načtení a zobrazení článků z aktivního kanálu
- Stránkování článků po 10 položkách
- Detail článku s pokusem o stažení plného textu z původního webu
- Označení článků jako `Oblíbené` a `Přečíst později`
- Filtrování seznamu na `Vše`, `Oblíbené` a `Přečíst později`
- Offline režim nad poslední uloženou synchronizací
- Automatickou obnovu dat každých 15 minut

## Použité technologie

- React Native
- Expo
- `@react-native-async-storage/async-storage`
- `expo-sqlite`
- `expo-navigation-bar`

## Uložení dat

Aplikace používá dva typy lokální persistence:

- `AsyncStorage`
  Ukládá naposledy načtené články, aktivní kanál, vlastní kanály a čas poslední synchronizace.
- `SQLite`
  Ukládá trvalý seznam článků označených jako oblíbené nebo k pozdějšímu přečtení.

Díky tomu je možné po ztrátě připojení dál pracovat s posledními načtenými daty a zachovat i uživatelské seznamy po restartu aplikace.

## Výchozí RSS kanály

V aplikaci jsou předpřipravené tyto zdroje:

- `iDNES - Hlavní zprávy`
- `iDNES - Zpravodajství`
- `ČT24 - Hlavní zprávy`

K nim je možné přidávat i vlastní RSS kanály.

## Struktura projektu

- `App.js`
  Hlavní vstupní bod aplikace a jednoduché přepínání mezi úvodem, nápovědou a čtečkou.
- `src/hooks/useRssReader.js`
  Centrální aplikační logika: načítání RSS, automatická synchronizace, stránkování, filtry, detail článku i správa lokálně uložených stavů.
- `src/components/EntryScreen.js`
  Úvodní obrazovka.
- `src/components/EntryHelpScreen.js`
  Obrazovka s nápovědou.
- `src/components/ReaderHeader.js`
  Hlavička čtečky s postranním menu a filtry.
- `src/components/ArticleList.js`
  Seznam článků včetně stránkování.
- `src/components/ArticleDetail.js`
  Detail článku a akce pro uložení článku.
- `src/components/ChannelPickerModal.js`
  Modal pro výběr a CRUD správu RSS kanálů.
- `src/services/rssService.js`
  Stažení RSS XML, jeho parsování a pokus o získání plného textu článku.
- `src/services/storageService.js`
  Uložení a načtení dat přes `AsyncStorage`.
- `src/services/articleLibraryService.js`
  SQLite vrstva pro oblíbené články a seznam `Přečíst později`.
- `src/constants/channels.js`
  Výchozí kanály, relevance článků a interval automatické obnovy.
- `src/utils/date.js`
  Pomocné funkce pro práci s datem a filtrování podle relevance.

## Instalace a spuštění

V adresáři `SW3` spusť:

```bash
npm install
```

Potom aplikaci spustíš:

```bash
npm start
```

Další varianty spuštění:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Jak aplikaci používat

### 1. Úvodní obrazovka

Po spuštění se zobrazí vstupní obrazovka, odkud můžeš:

- otevřít nápovědu,
- vybrat kanál,
- ručně obnovit data,
- přejít do samotné čtečky.

### 2. Výběr kanálu

Přes modal `Kanály` lze:

- vybrat některý z dostupných kanálů,
- přidat vlastní RSS kanál,
- upravit dříve přidaný vlastní kanál,
- smazat vlastní kanál.

Vestavěné kanály jsou pouze ke čtení a nelze je měnit.

### 3. Seznam článků

Ve čtečce se zobrazí články aktivního kanálu:

- seřazené od nejnovějších,
- rozdělené po 10 položkách na stránky,
- s možností přepnout filtr na všechny články, oblíbené nebo přečíst později.

### 4. Detail článku

Po otevření článku aplikace:

- zobrazí datum, titulek a text článku,
- nabídne přidání do oblíbených,
- nabídne přidání do seznamu `Přečíst později`,
- pokud je k dispozici odkaz, umožní otevřít původní článek v prohlížeči,
- pokusí se načíst i plnější text z původního webu než jen RSS výtah.

### 5. Offline režim

Při chybě načtení RSS kanálu se zobrazí poslední uložené články. Uživatelské příznaky `Oblíbené` a `Přečíst později` zůstávají zachované díky SQLite databázi.

## Poznámky k implementaci

- Články jsou filtrovány podle časové relevance na posledních 7 dní.
- Automatická synchronizace běží každých 15 minut.
- RSS parsování je řešené vlastním lehkým parserem nad XML textem, aby byl projekt přehledný pro studijní účely.
- Načítání plného textu článku je heuristické, takže u některých webů může zůstat pouze RSS verze obsahu.
