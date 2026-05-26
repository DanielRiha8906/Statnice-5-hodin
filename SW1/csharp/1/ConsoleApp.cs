namespace ContactManager;

public static class ConsoleApp
{
    public static void Run()
    {
        var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "data", "contacts.db");
        var service = new ContactService(dbPath);

        var actions = new Dictionary<string, string>
        {
            ["1"] = "Vypsat kontakty",
            ["2"] = "Pridat kontakt",
            ["3"] = "Vyhledat kontakt",
            ["4"] = "Upravit kontakt",
            ["5"] = "Smazat kontakt",
            ["6"] = "Vratit posledni zmenu",
            ["0"] = "Konec",
        };

        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("=== Sprava kontaktu ===");
            foreach (var action in actions)
            {
                Console.WriteLine($"{action.Key}. {action.Value}");
            }

            var choice = ReadRequired("Zvol akci: ");

            switch (choice)
            {
                case "1":
                    var contacts = service.ListContacts().ToList();
                    if (contacts.Count == 0)
                    {
                        Console.WriteLine("Seznam kontaktu je prazdny.");
                        break;
                    }

                    contacts.ForEach(PrintContact);
                    break;
                case "2":
                    var newContactData = ReadContactData();
                    var created = service.AddContact(
                        newContactData.Name,
                        newContactData.Phone,
                        newContactData.Email,
                        newContactData.Note
                    );
                    Console.WriteLine("Kontakt ulozen:");
                    PrintContact(created);
                    break;
                case "3":
                    var query = ReadRequired("Zadej hledany text: ");
                    var results = service.SearchContacts(query).ToList();
                    if (results.Count == 0)
                    {
                        Console.WriteLine("Nebyl nalezen zadny kontakt.");
                        break;
                    }

                    results.ForEach(PrintContact);
                    break;
                case "4":
                    if (!int.TryParse(ReadRequired("ID kontaktu pro upravu: "), out var updateId))
                    {
                        Console.WriteLine("ID musi byt cislo.");
                        break;
                    }

                    var existing = service.GetContact(updateId);
                    if (existing is null)
                    {
                        Console.WriteLine("Kontakt nebyl nalezen.");
                        break;
                    }

                    var updateData = ReadContactData(existing);
                    var updated = service.UpdateContact(
                        updateId,
                        updateData.Name,
                        updateData.Phone,
                        updateData.Email,
                        updateData.Note
                    );
                    Console.WriteLine("Kontakt upraven:");
                    PrintContact(updated);
                    break;
                case "5":
                    if (!int.TryParse(ReadRequired("ID kontaktu pro smazani: "), out var deleteId))
                    {
                        Console.WriteLine("ID musi byt cislo.");
                        break;
                    }

                    var deleted = service.DeleteContact(deleteId);
                    Console.WriteLine(deleted is null ? "Kontakt nebyl nalezen." : "Kontakt smazan.");
                    break;
                case "6":
                    Console.WriteLine(
                        service.UndoLastAction()
                            ? "Posledni operace byla vracena."
                            : "Neni co vratit."
                    );
                    break;
                case "0":
                    Console.WriteLine("Aplikace ukoncena.");
                    return;
                default:
                    Console.WriteLine("Neplatna volba.");
                    break;
            }
        }
    }

    private static void PrintContact(Contact contact)
    {
        Console.WriteLine(
            $"[{contact.ContactId}] {contact.Name} | tel: {contact.Phone} | email: {contact.Email} | poznamka: {contact.Note}"
        );
    }

    private static Contact ReadContactData(Contact? existing = null)
    {
        var name = ReadWithDefault("Jmeno", existing?.Name);
        var phone = ReadWithDefault("Telefon", existing?.Phone);
        var email = ReadWithDefault("E-mail", existing?.Email);
        var note = ReadWithDefault("Poznamka", existing?.Note);
        return new Contact(existing?.ContactId, name, phone, email, note);
    }

    private static string ReadWithDefault(string label, string? defaultValue)
    {
        Console.Write($"{label} [{defaultValue ?? string.Empty}]: ");
        var value = Console.ReadLine()?.Trim();
        return string.IsNullOrEmpty(value) ? defaultValue ?? string.Empty : value;
    }

    private static string ReadRequired(string prompt)
    {
        Console.Write(prompt);
        return Console.ReadLine()?.Trim() ?? string.Empty;
    }
}
