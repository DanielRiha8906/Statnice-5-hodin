using Mono.Data.Sqlite;

namespace ContactManager;

public sealed class SQLiteContactRepository
{
    private readonly string _dbPath;

    public SQLiteContactRepository(string dbPath)
    {
        _dbPath = dbPath;
        var directory = Path.GetDirectoryName(_dbPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        Initialize();
    }

    private SqliteConnection Connect()
    {
        return new SqliteConnection($"Data Source={_dbPath}");
    }

    private void Initialize()
    {
        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText =
            @"CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                note TEXT NOT NULL DEFAULT ''
            )";
        command.ExecuteNonQuery();
    }

    public Contact Add(Contact contact)
    {
        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT INTO contacts (name, phone, email, note)
            VALUES (@name, @phone, @email, @note);
            SELECT last_insert_rowid();";
        command.Parameters.AddWithValue("@name", contact.Name);
        command.Parameters.AddWithValue("@phone", contact.Phone);
        command.Parameters.AddWithValue("@email", contact.Email);
        command.Parameters.AddWithValue("@note", contact.Note);

        var id = Convert.ToInt32(command.ExecuteScalar());
        return contact.Clone(contactId: id, keepExistingId: false);
    }

    public Contact? Get(int contactId)
    {
        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText =
            "SELECT id, name, phone, email, note FROM contacts WHERE id = @id";
        command.Parameters.AddWithValue("@id", contactId);

        using var reader = command.ExecuteReader();
        return reader.Read() ? MapRow(reader) : null;
    }

    public List<Contact> ListAll()
    {
        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText =
            "SELECT id, name, phone, email, note FROM contacts ORDER BY name, id";

        using var reader = command.ExecuteReader();
        var contacts = new List<Contact>();
        while (reader.Read())
        {
            contacts.Add(MapRow(reader));
        }

        return contacts;
    }

    public List<Contact> Search(string query)
    {
        using var connection = Connect();
        connection.Open();

        var normalized = $"%{query.ToLowerInvariant()}%";
        using var command = connection.CreateCommand();
        command.CommandText =
            @"SELECT id, name, phone, email, note
            FROM contacts
            WHERE LOWER(name) LIKE @query
               OR LOWER(phone) LIKE @query
               OR LOWER(email) LIKE @query
               OR LOWER(note) LIKE @query
            ORDER BY name, id";
        command.Parameters.AddWithValue("@query", normalized);

        using var reader = command.ExecuteReader();
        var contacts = new List<Contact>();
        while (reader.Read())
        {
            contacts.Add(MapRow(reader));
        }

        return contacts;
    }

    public void Update(Contact contact)
    {
        if (contact.ContactId is null)
        {
            throw new InvalidOperationException("Cannot update a contact without an id.");
        }

        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText =
            @"UPDATE contacts
            SET name = @name, phone = @phone, email = @email, note = @note
            WHERE id = @id";
        command.Parameters.AddWithValue("@id", contact.ContactId.Value);
        command.Parameters.AddWithValue("@name", contact.Name);
        command.Parameters.AddWithValue("@phone", contact.Phone);
        command.Parameters.AddWithValue("@email", contact.Email);
        command.Parameters.AddWithValue("@note", contact.Note);
        command.ExecuteNonQuery();
    }

    public Contact? Delete(int contactId)
    {
        var existing = Get(contactId);
        if (existing is null)
        {
            return null;
        }

        using var connection = Connect();
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM contacts WHERE id = @id";
        command.Parameters.AddWithValue("@id", contactId);
        command.ExecuteNonQuery();
        return existing;
    }

    private static Contact MapRow(SqliteDataReader reader)
    {
        return new Contact(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.GetString(4)
        );
    }
}
