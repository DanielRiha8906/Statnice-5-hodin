# SW1 C# Ports

Tady jsou dve konzolove C# verze Python aplikaci z `SW1/python`.

## Projekty

- `SW1/csharp/1` - port aplikace pro spravu kontaktu
- `SW1/csharp/2` - port course management systemu

## Spusteni

Pouzij z korene repozitare:

```bash
DOTNET_CLI_HOME=/tmp dotnet run --project SW1/csharp/1
DOTNET_CLI_HOME=/tmp dotnet run --project SW1/csharp/2
```

Prvni aplikace si vytvori SQLite databazi v `data/contacts.db` podle aktualniho pracovniho adresare.

## Poznamka

Projekt `SW1/csharp/1` pouziva lokalne dostupnou knihovnu `Mono.Data.Sqlite`, aby slo SQLite spustit i bez stahovani dalsich NuGet balicku.
