namespace ContactManager;

public interface ICommand
{
    Contact? Execute();
    void Undo();
}

public sealed class AddContactCommand : ICommand
{
    private readonly SQLiteContactRepository _repository;
    private readonly Contact _contact;
    private Contact? _createdContact;

    public AddContactCommand(SQLiteContactRepository repository, Contact contact)
    {
        _repository = repository;
        _contact = contact;
    }

    public Contact Execute()
    {
        _createdContact = _repository.Add(_contact);
        return _createdContact;
    }

    public void Undo()
    {
        if (_createdContact?.ContactId is int contactId)
        {
            _repository.Delete(contactId);
        }
    }
}

public sealed class UpdateContactCommand : ICommand
{
    private readonly SQLiteContactRepository _repository;
    private readonly Contact _updatedContact;
    private Contact? _originalContact;

    public UpdateContactCommand(SQLiteContactRepository repository, Contact updatedContact)
    {
        _repository = repository;
        _updatedContact = updatedContact;
    }

    public Contact Execute()
    {
        if (_updatedContact.ContactId is null)
        {
            throw new InvalidOperationException("Cannot update a contact without an id.");
        }

        _originalContact = _repository.Get(_updatedContact.ContactId.Value)
            ?? throw new InvalidOperationException("Contact not found.");

        _repository.Update(_updatedContact);
        return _updatedContact;
    }

    public void Undo()
    {
        if (_originalContact is not null)
        {
            _repository.Update(_originalContact);
        }
    }
}

public sealed class DeleteContactCommand : ICommand
{
    private readonly SQLiteContactRepository _repository;
    private readonly int _contactId;
    private Contact? _deletedContact;

    public DeleteContactCommand(SQLiteContactRepository repository, int contactId)
    {
        _repository = repository;
        _contactId = contactId;
    }

    public Contact? Execute()
    {
        _deletedContact = _repository.Delete(_contactId);
        return _deletedContact;
    }

    public void Undo()
    {
        if (_deletedContact is not null)
        {
            _deletedContact = _repository.Add(
                _deletedContact.Clone(contactId: null, keepExistingId: false)
            );
        }
    }
}

public sealed class CommandManager
{
    private readonly Stack<ICommand> _history = new();

    public Contact? Execute(ICommand command)
    {
        var result = command.Execute();
        _history.Push(command);
        return result;
    }

    public bool UndoLast()
    {
        if (_history.Count == 0)
        {
            return false;
        }

        _history.Pop().Undo();
        return true;
    }
}
