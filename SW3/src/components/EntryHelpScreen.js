/**
 * Samostatná obrazovka s vysvětlením, jak aplikace funguje.
 */

import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

export function EntryHelpScreen({ onBack }) {
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Zpět</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Jak to funguje</Text>
        <Text style={styles.title}>Průvodce zpravodajskou čtečkou</Text>
        <Text style={styles.lead}>
          Tahle obrazovka vysvětluje, co aplikace umí a jak se v ní nejrychleji
          zorientovat.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Výběr kanálu</Text>
        <Text style={styles.sectionText}>
          Přes tlačítko `Kanály` si vybereš některý z připravených RSS zdrojů
          nebo přidáš vlastní kanál přes URL adresu.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Načtení článků</Text>
        <Text style={styles.sectionText}>
          Aplikace načte aktuální články z vybraného kanálu, seřadí je od
          nejnovějších a při větším množství je rozdělí po deseti na stránky.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Co dělá Obnovit data</Text>
        <Text style={styles.sectionText}>
          Tlačítko `Obnovit data` spustí nové načtení aktivního RSS kanálu,
          stáhne nejnovější dostupné články a zároveň přepíše lokální cache
          aktuální verzí obsahu.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Detail a plný text</Text>
        <Text style={styles.sectionText}>
          Po otevření článku se nejprve zobrazí RSS obsah. Pokud to zdroj dovolí,
          aplikace se pokusí stáhnout i plný text z původního webu.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Oblíbené a přečíst později</Text>
        <Text style={styles.sectionText}>
          Články si můžeš uložit jako oblíbené nebo do seznamu `Přečíst později`.
          Tyto seznamy jsou uložené lokálně v SQLite databázi a zůstanou dostupné
          i po restartu aplikace.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Offline režim</Text>
        <Text style={styles.sectionText}>
          Poslední načtené články se ukládají i do lokální cache, takže při výpadku
          sítě aplikace stále zobrazí naposledy synchronizovaná data.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: (StatusBar.currentHeight ?? 0) + 18,
    paddingBottom: 32,
    gap: 16
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  backButton: {
    backgroundColor: "#e8ddd0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  backButtonText: {
    color: "#4a3e37",
    fontWeight: "700"
  },
  heroCard: {
    backgroundColor: "#243129",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#415648"
  },
  eyebrow: {
    color: "#d8c4a6",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10
  },
  title: {
    color: "#fff8ef",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    marginBottom: 12
  },
  lead: {
    color: "#ddd4c8",
    fontSize: 16,
    lineHeight: 24
  },
  sectionCard: {
    backgroundColor: "#fffaf5",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eadbc8"
  },
  sectionTitle: {
    color: "#2d241f",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 8
  },
  sectionText: {
    color: "#5b4f45",
    fontSize: 15,
    lineHeight: 23
  }
});
