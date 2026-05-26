# Aplikace pro správu výsledků modelů strojového učení

Tato aplikace je desktopová GUI aplikace v Pythonu pro evidenci experimentů, modelů strojového učení, jejich konfigurací a dosažených výsledků. Projekt je připravený jako studijní materiál ke státnicím, proto obsahuje hodně komentářů a vysvětlujících docstringů.

## Co aplikace umí

1. Založit experiment pomocí názvu a textového popisu.
2. Založit model typu `RandomForestClassifier` nebo `SVC`.
3. U každého modelu uložit jméno, popis a minimálně tři parametry.
4. Přiřadit model do experimentu a uložit k němu číselný výsledek.
5. V rámci vybraného experimentu filtrovat modely podle typu.
6. V rámci vybraného experimentu řadit modely podle výsledku.
7. Uložit všechna data do relační databáze SQLite.

## Architektura projektu

Projekt je rozdělený do několika vrstev:

- `src/ml_experiments/models.py`
  Obsahuje datové třídy reprezentující experiment, model, parametr modelu a výsledek.
- `src/ml_experiments/database.py`
  Obsahuje správu připojení a vytvoření databázového schématu.
- `src/ml_experiments/repository.py`
  Obsahuje SQL dotazy a práci s databází.
- `src/ml_experiments/service.py`
  Obsahuje validační a aplikační logiku.
- `src/ml_experiments/app.py`
  Obsahuje grafické rozhraní v Tkinteru.
- `src/main.py`
  Spouští aplikaci.

Takové rozdělení je vhodné i k obhajobě, protože je dobře vidět:

- oddělení prezentační vrstvy od databáze,
- oddělení aplikační logiky od SQL,
- a práce s relačním datovým modelem.

## Spuštění aplikace

### Požadavky

- Python 3.11 nebo novější
- Tkinter

Tkinter bývá součástí standardní instalace Pythonu. SQLite je také součástí Pythonu, takže není nutné nic doinstalovávat.

### Jak aplikaci spustit

Z kořenové složky repozitáře spusť:

```bash
python3 SW2/src/main.py
```

Po prvním spuštění se automaticky vytvoří databázový soubor:

```text
SW2/data/ml_experiments.db
```

## Uživatelská příručka

### 1. Založení experimentu

1. Otevři záložku `Experimenty`.
2. Vyplň název experimentu.
3. Doplň textový popis experimentu.
4. Klikni na tlačítko `Uložit experiment`.

### 2. Založení modelu

1. Otevři záložku `Modely`.
2. Vyber typ modelu `RandomForestClassifier` nebo `SVC`.
3. Vyplň jméno modelu.
4. Vyplň popis modelu.
5. Doplň všechny tři konfigurační parametry.
6. Klikni na tlačítko `Uložit model`.

### 3. Přiřazení modelu do experimentu

1. Otevři záložku `Výsledky v experimentech`.
2. Vyber existující experiment.
3. Vyber existující model.
4. Zadej číselný výsledek modelu.
5. Klikni na `Přiřadit model a uložit výsledek`.

### 4. Filtrování a řazení výsledků

1. Ve stejné záložce vyber experiment.
2. V poli `Filtr typu modelu` vyber `Vše`, `RandomForestClassifier` nebo `SVC`.
3. V poli `Řazení výsledků` vyber `Sestupně` nebo `Vzestupně`.
4. Tabulka se podle volby překreslí.

## Poznámky k návrhu

- Databáze je relační a používá cizí klíče.
- Model a jeho konfigurace jsou uložené odděleně od výsledku v experimentu.
- Jeden experiment může obsahovat více modelů.
- Jeden model může být znovupoužitý ve více experimentech.
- Kombinace `experiment + model` je v tabulce výsledků unikátní, takže stejný model není možné do stejného experimentu uložit dvakrát.

## Databázová dokumentace

Krátký popis schématu je v souboru [DATABASE.md](DATABASE.md).

