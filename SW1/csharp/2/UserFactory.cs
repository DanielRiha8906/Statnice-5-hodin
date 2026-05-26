namespace CourseManagementSystem;

public sealed class UserFactory
{
    public User CreateUser(string username, string password, string email, string userId, string role)
    {
        return role.Trim().ToLowerInvariant() switch
        {
            "student" => new Student(username, password, email, userId),
            "teacher" => new Teacher(username, password, email, userId),
            "admin" => new Admin(username, password, email, userId),
            _ => throw new InvalidOperationException("Invalid role specified"),
        };
    }
}
