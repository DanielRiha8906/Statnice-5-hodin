# CourseManagementSystem

Console course management system backed by SQLite.

## Requirements

- Windows 10/11
- Visual Studio 2022 or the .NET 9 SDK
- Internet access for the first package restore

No separate SQLite installation is needed. The project downloads `Microsoft.Data.Sqlite` through NuGet.

## Restore dependencies

From the project folder:

```powershell
dotnet restore
```

The repository also includes a `NuGet.Config` at `Statnice-5-hodin/SW1/csharp/NuGet.Config`, which points restores to `nuget.org`.

## Build and run

```powershell
dotnet build
dotnet run
```

If you prefer opening it in Visual Studio 2022, open `CourseManagementSystem.csproj` directly or use the folder `Statnice-5-hodin/SW1/csharp/2`.

## Data storage

The app stores data in:

```text
data/courses.db
```

The database file is created relative to the current working directory.

