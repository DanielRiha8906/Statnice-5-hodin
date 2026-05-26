/**
 * Modal okno pro správu RSS kanálů v režimu CRUD.
 */

import React, { useEffect, useState } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const EMPTY_FORM = {
  id: "",
  label: "",
  url: ""
};

export function ChannelPickerModal({
  channels,
  currentChannelUrl,
  isVisible,
  onAddCustomChannel,
  onClose,
  onDeleteCustomChannel,
  onSelectChannel,
  onUpdateCustomChannel
}) {
  const [screen, setScreen] = useState("menu");
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      resetState();
    }
  }, [isVisible]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return undefined;
    }

    async function syncNavigationBar() {
      if (isVisible) {
        await NavigationBar.setBackgroundColorAsync("#211813");
        await NavigationBar.setButtonStyleAsync("light");
      } else {
        await NavigationBar.setBackgroundColorAsync("#f4efe6");
        await NavigationBar.setButtonStyleAsync("dark");
      }
    }

    syncNavigationBar();

    return () => {
      NavigationBar.setBackgroundColorAsync("#f4efe6");
      NavigationBar.setButtonStyleAsync("dark");
    };
  }, [isVisible]);

  function resetState() {
    setScreen("menu");
    setFormMode("create");
    setFormValues(EMPTY_FORM);
    setErrorMessage("");
    setIsSubmitting(false);
  }

  function openCreateScreen() {
    setFormMode("create");
    setFormValues(EMPTY_FORM);
    setErrorMessage("");
    setScreen("form");
  }

  function openEditScreen(channel) {
    setFormMode("edit");
    setFormValues({
      id: channel.id,
      label: channel.label,
      url: channel.url
    });
    setErrorMessage("");
    setScreen("form");
  }

  async function submitForm() {
    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      label: formValues.label,
      url: formValues.url
    };

    const result =
      formMode === "create"
        ? await onAddCustomChannel(payload)
        : await onUpdateCustomChannel(formValues.id, payload);

    if (!result.success) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    resetState();
  }

  async function deleteChannel(channelId) {
    await onDeleteCustomChannel(channelId);
    setScreen("manage");
  }

  function renderMenuScreen() {
    return (
      <>
        <Text style={styles.title}>Kanály</Text>
        <Text style={styles.subtitle}>
          Můžeš si zobrazit existující kanály nebo přejít do správy, kde vytvoříš,
          upravíš a smažeš vlastní RSS zdroje.
        </Text>

        <Pressable style={styles.primaryActionCard} onPress={() => setScreen("pick")}>
          <Text style={styles.actionTitle}>Vybrat existující kanál</Text>
          <Text style={styles.actionText}>
            Otevře seznam všech dostupných kanálů a vybraný zdroj se ihned načte.
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryActionCard} onPress={() => setScreen("manage")}>
          <Text style={styles.actionTitle}>Spravovat kanály</Text>
          <Text style={styles.actionText}>
            Přidej nový kanál, uprav vlastní položky nebo je odstraň ze seznamu.
          </Text>
        </Pressable>
      </>
    );
  }

  function renderPickScreen() {
    return (
      <>
        <Pressable style={styles.backLink} onPress={() => setScreen("menu")}>
          <Text style={styles.backLinkText}>Zpět</Text>
        </Pressable>

        <Text style={styles.title}>Vyber RSS kanál</Text>
        <Text style={styles.subtitle}>
          Výběr kanálu spustí jeho načtení a následné uložení pro offline režim.
        </Text>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {channels.map((channel) => {
            const isCurrent = currentChannelUrl === channel.url;

            return (
              <Pressable
                key={channel.id || channel.url}
                style={[styles.channelButton, isCurrent ? styles.currentChannelButton : null]}
                onPress={() => onSelectChannel(channel)}
              >
                <View style={styles.channelRow}>
                  <Text style={styles.channelLabel}>{channel.label}</Text>
                  {channel.isCustom ? <Text style={styles.customBadge}>Vlastní</Text> : null}
                </View>
                <Text style={styles.channelUrl}>{channel.url}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </>
    );
  }

  function renderManageScreen() {
    return (
      <>
        <Pressable style={styles.backLink} onPress={() => setScreen("menu")}>
          <Text style={styles.backLinkText}>Zpět</Text>
        </Pressable>

        <Text style={styles.title}>Správa kanálů</Text>
        <Text style={styles.subtitle}>
          Vestavěné kanály jsou jen ke čtení. Vlastní kanály můžeš vytvářet, upravovat
          a mazat.
        </Text>

        <Pressable style={styles.submitButton} onPress={openCreateScreen}>
          <Text style={styles.submitButtonText}>Přidat nový kanál</Text>
        </Pressable>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {channels.map((channel) => {
            const isCurrent = currentChannelUrl === channel.url;

            return (
              <View
                key={channel.id || channel.url}
                style={[styles.manageCard, isCurrent ? styles.currentChannelButton : null]}
              >
                <View style={styles.channelRow}>
                  <Text style={styles.channelLabel}>{channel.label}</Text>
                  <Text style={channel.isCustom ? styles.customBadge : styles.readOnlyBadge}>
                    {channel.isCustom ? "Vlastní" : "Vestavěný"}
                  </Text>
                </View>

                <Text style={styles.channelUrl}>{channel.url}</Text>

                {channel.isCustom ? (
                  <View style={styles.manageActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => openEditScreen(channel)}
                    >
                      <Text style={styles.editButtonText}>Upravit</Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteChannel(channel.id)}
                    >
                      <Text style={styles.deleteButtonText}>Smazat</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.readOnlyText}>
                    Tento kanál je součástí aplikace a nelze ho upravit.
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </>
    );
  }

  function renderFormScreen() {
    return (
      <>
        <Pressable style={styles.backLink} onPress={() => setScreen("manage")}>
          <Text style={styles.backLinkText}>Zpět</Text>
        </Pressable>

        <Text style={styles.title}>
          {formMode === "create" ? "Přidat nový kanál" : "Upravit kanál"}
        </Text>
        <Text style={styles.subtitle}>
          Vyplň název a URL RSS kanálu. Aplikace zdroj ověří a pak ho uloží do seznamu.
        </Text>

        <Text style={styles.inputLabel}>Název kanálu</Text>
        <TextInput
          onChangeText={(label) => setFormValues((current) => ({ ...current, label }))}
          placeholder="např. Můj oblíbený web"
          placeholderTextColor="#9b8c80"
          style={styles.input}
          value={formValues.label}
        />

        <Text style={styles.inputLabel}>URL RSS kanálu</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onChangeText={(url) => setFormValues((current) => ({ ...current, url }))}
          placeholder="např. https://example.com/rss.xml"
          placeholderTextColor="#9b8c80"
          style={styles.input}
          value={formValues.url}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
          onPress={submitForm}
        >
          {isSubmitting ? (
            <View style={styles.submitLoadingRow}>
              <ActivityIndicator color="#fffaf5" size="small" />
              <Text style={styles.submitButtonText}>
                {formMode === "create" ? "Přidávám kanál..." : "Ukládám změny..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {formMode === "create" ? "Vytvořit kanál" : "Uložit změny"}
            </Text>
          )}
        </Pressable>
      </>
    );
  }

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      transparent
      statusBarTranslucent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {screen === "menu" ? renderMenuScreen() : null}
          {screen === "pick" ? renderPickScreen() : null}
          {screen === "manage" ? renderManageScreen() : null}
          {screen === "form" ? renderFormScreen() : null}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Zavřít</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(33, 24, 19, 0.72)",
    paddingHorizontal: 18
  },
  modalCard: {
    backgroundColor: "#fffaf5",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%"
  },
  title: {
    color: "#2d241f",
    fontSize: 22,
    fontWeight: "800"
  },
  subtitle: {
    color: "#6f6258",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18
  },
  primaryActionCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#f2e1d8",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d8b8a8"
  },
  secondaryActionCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#f5ede2",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eadbc8"
  },
  actionTitle: {
    color: "#2d241f",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6
  },
  actionText: {
    color: "#64564d",
    fontSize: 14,
    lineHeight: 20
  },
  backLink: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingVertical: 6
  },
  backLinkText: {
    color: "#7a3428",
    fontWeight: "700"
  },
  scrollArea: {
    maxHeight: 420
  },
  channelButton: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f5ede2",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eadbc8"
  },
  manageCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f5ede2",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eadbc8"
  },
  currentChannelButton: {
    borderColor: "#7a3428",
    backgroundColor: "#f2e1d8"
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6
  },
  channelLabel: {
    flex: 1,
    color: "#2d241f",
    fontSize: 16,
    fontWeight: "700"
  },
  channelUrl: {
    color: "#7a675b",
    fontSize: 12
  },
  customBadge: {
    color: "#fffaf5",
    backgroundColor: "#7a3428",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700"
  },
  readOnlyBadge: {
    color: "#4f5f54",
    backgroundColor: "#d6e0d2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700"
  },
  manageActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  editButton: {
    flex: 1,
    backgroundColor: "#e8ddd0",
    borderRadius: 14,
    paddingVertical: 12
  },
  editButtonText: {
    color: "#4a3e37",
    fontWeight: "700",
    textAlign: "center"
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#f6d9d4",
    borderRadius: 14,
    paddingVertical: 12
  },
  deleteButtonText: {
    color: "#902c28",
    fontWeight: "700",
    textAlign: "center"
  },
  readOnlyText: {
    marginTop: 14,
    color: "#5f6f64",
    fontSize: 13
  },
  inputLabel: {
    color: "#4a3e37",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 6
  },
  input: {
    backgroundColor: "#f8f1e8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfcfbc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#2d241f",
    fontSize: 15
  },
  errorText: {
    marginTop: 10,
    color: "#a12626",
    fontSize: 13,
    fontWeight: "600"
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#7a3428",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  submitButtonDisabled: {
    opacity: 0.78
  },
  submitButtonText: {
    color: "#fffaf5",
    fontWeight: "700",
    textAlign: "center"
  },
  submitLoadingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  closeButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#e8ddd0",
    borderRadius: 14
  },
  closeButtonText: {
    color: "#4a3e37",
    fontWeight: "700"
  }
});
