using System.Collections;

namespace ContactManager;

public sealed class ContactIterator : IEnumerator<Contact>
{
    private readonly IReadOnlyList<Contact> _contacts;
    private int _index = -1;

    public ContactIterator(IReadOnlyList<Contact> contacts)
    {
        _contacts = contacts;
    }

    public Contact Current => _contacts[_index];

    object IEnumerator.Current => Current;

    public bool MoveNext()
    {
        if (_index + 1 >= _contacts.Count)
        {
            return false;
        }

        _index++;
        return true;
    }

    public void Reset()
    {
        _index = -1;
    }

    public void Dispose()
    {
    }
}

public sealed class ContactCollection : IEnumerable<Contact>
{
    private readonly IReadOnlyList<Contact> _contacts;

    public ContactCollection(IReadOnlyList<Contact> contacts)
    {
        _contacts = contacts;
    }

    public IEnumerator<Contact> GetEnumerator() => new ContactIterator(_contacts);

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
