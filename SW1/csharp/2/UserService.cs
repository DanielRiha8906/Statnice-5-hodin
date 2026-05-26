namespace CourseManagementSystem;

public sealed class UserService
{
    private readonly SQLiteSchoolRepository _repository;
    private readonly UserFactory _userFactory = new();
    private int _nextUserId;

    public Dictionary<string, User> Users { get; } = new(StringComparer.OrdinalIgnoreCase);

    public UserService(SQLiteSchoolRepository repository)
    {
        _repository = repository;
        Users = _repository.LoadUsers();
        _nextUserId = Users.Values
            .Select(user => int.TryParse(user.UserId, out var userId) ? userId : 0)
            .DefaultIfEmpty(0)
            .Max();
    }

    public User RegisterUser(string username, string password, string email, string role)
    {
        if (Users.ContainsKey(username))
        {
            throw new InvalidOperationException("Username already exists");
        }

        _nextUserId++;
        var userId = _nextUserId.ToString();
        var user = _userFactory.CreateUser(username, password, email, userId, role);
        Users[username] = user;
        _repository.AddUser(user);
        return user;
    }

    public User LoginUser(string username, string password)
    {
        if (!Users.TryGetValue(username, out var user))
        {
            throw new InvalidOperationException("User does not exist");
        }

        if (user.Password != password)
        {
            throw new InvalidOperationException("Incorrect password");
        }

        return user;
    }

    public User? FindUser(string username)
    {
        return Users.TryGetValue(username, out var user) ? user : null;
    }

    public bool DeleteUser(string username)
    {
        if (!Users.Remove(username))
        {
            throw new InvalidOperationException("User does not exist");
        }

        _repository.DeleteUser(username);
        return true;
    }

    public List<User> FindUsersByRole(string role)
    {
        return Users.Values
            .Where(user => string.Equals(user.Role, role, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
}
