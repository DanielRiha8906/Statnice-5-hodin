namespace CourseManagementSystem;

public abstract class User
{
    protected User(string username, string password, string email, string userId)
    {
        Username = username;
        Password = password;
        Email = email;
        UserId = userId;
    }

    public string Username { get; }
    public string Password { get; }
    public string Email { get; }
    public string UserId { get; }
    public abstract string Role { get; }
}

public sealed class Student : User
{
    public Student(string username, string password, string email, string userId)
        : base(username, password, email, userId)
    {
    }

    public override string Role => "Student";

    public List<Course> EnrolledCourses { get; } = new();
    public List<string> Notifications { get; } = new();

    public void Update(string message)
    {
        Notifications.Add(message);
    }
}

public sealed class Teacher : User
{
    public Teacher(string username, string password, string email, string userId)
        : base(username, password, email, userId)
    {
    }

    public override string Role => "Teacher";

    public List<Course> TaughtCourses { get; } = new();
}

public sealed class Admin : User
{
    public Admin(string username, string password, string email, string userId)
        : base(username, password, email, userId)
    {
    }

    public override string Role => "Admin";
}
