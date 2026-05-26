namespace ContactManager;

public sealed class ContactService
{
    private readonly SQLiteContactRepository _repository;
    private readonly CommandManager _commandManager = new();

    public ContactService(string dbPath)
    {
        _repository = new SQLiteContactRepository(dbPath);
    }

    public Contact AddContact(string name, string phone, string email, string note = "")
    {
        var contact = new Contact(null, name, phone, email, note);
        return (Contact)_commandManager.Execute(new AddContactCommand(_repository, contact))!;
    }

    public Contact UpdateContact(int contactId, string name, string phone, string email, string note = "")
    {
        var updated = new Contact(contactId, name, phone, email, note);
        return (Contact)_commandManager.Execute(new UpdateContactCommand(_repository, updated))!;
    }

    public Contact? DeleteContact(int contactId)
    {
        return _commandManager.Execute(new DeleteContactCommand(_repository, contactId));
    }

    public Contact? GetContact(int contactId) => _repository.Get(contactId);

    public ContactCollection ListContacts() => new(_repository.ListAll());

    public ContactCollection SearchContacts(string query) => new(_repository.Search(query));

    public bool UndoLastAction() => _commandManager.UndoLast();
}
