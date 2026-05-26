namespace ContactManager;

public sealed class Contact
{
    public Contact(int? contactId, string name, string phone, string email, string note = "")
    {
        ContactId = contactId;
        Name = name;
        Phone = phone;
        Email = email;
        Note = note;
    }

    public int? ContactId { get; }
    public string Name { get; }
    public string Phone { get; }
    public string Email { get; }
    public string Note { get; }

    public Contact Clone(
        int? contactId = null,
        string? name = null,
        string? phone = null,
        string? email = null,
        string? note = null,
        bool keepExistingId = true)
    {
        return new Contact(
            keepExistingId ? contactId ?? ContactId : contactId,
            name ?? Name,
            phone ?? Phone,
            email ?? Email,
            note ?? Note
        );
    }
}
