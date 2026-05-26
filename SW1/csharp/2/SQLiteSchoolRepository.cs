using Microsoft.Data.Sqlite;

namespace CourseManagementSystem;

public sealed class SQLiteSchoolRepository
{
    private readonly string _dbPath;

    public SQLiteSchoolRepository(string dbPath)
    {
        _dbPath = dbPath;
        var directory = Path.GetDirectoryName(_dbPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        Initialize();
    }

    public Dictionary<string, User> LoadUsers()
    {
        var users = new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            "SELECT UserId, Username, Password, Email, Role FROM Users ORDER BY CAST(UserId AS INTEGER), Username";

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            var user = CreateUser(
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(0),
                reader.GetString(4)
            );
            users[user.Username] = user;
        }

        return users;
    }

    public Dictionary<string, Course> LoadCourses(IReadOnlyDictionary<string, User> users)
    {
        var courses = new Dictionary<string, Course>(StringComparer.OrdinalIgnoreCase);
        var usersById = users.Values.ToDictionary(user => user.UserId);

        using var connection = OpenConnection();

        using (var command = connection.CreateCommand())
        {
            command.CommandText =
                "SELECT CourseId, Name, Description, TeacherUserId, GradingStrategy FROM Courses ORDER BY CourseId";

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var teacher = GetTeacher(usersById, reader.GetString(3));
                var course = new Course(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    teacher,
                    CreateGradingStrategy(reader.GetString(4))
                );
                courses[course.CourseId] = course;
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText =
                "SELECT CourseId, StudentUserId FROM Enrollments ORDER BY CourseId, StudentUserId";

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var course = GetCourse(courses, reader.GetString(0));
                var student = GetStudent(usersById, reader.GetString(1));
                course.EnrollStudent(student);
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText =
                "SELECT CourseId, StudentUserId, GradeValue, GradeWeight FROM Grades ORDER BY CourseId, StudentUserId, Id";

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var course = GetCourse(courses, reader.GetString(0));
                var student = GetStudent(usersById, reader.GetString(1));
                var grade = new Grade(reader.GetInt32(2), reader.GetInt32(3));

                if (!course.Grades.TryGetValue(student.UserId, out var grades))
                {
                    grades = new List<Grade>();
                    course.Grades[student.UserId] = grades;
                }

                grades.Add(grade);
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText =
                "SELECT StudentUserId, Message FROM Notifications ORDER BY Id";

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var student = GetStudent(usersById, reader.GetString(0));
                student.Notifications.Add(reader.GetString(1));
            }
        }

        return courses;
    }

    public void AddUser(User user)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT INTO Users (UserId, Username, Password, Email, Role)
            VALUES (@userId, @username, @password, @email, @role)";
        command.Parameters.AddWithValue("@userId", user.UserId);
        command.Parameters.AddWithValue("@username", user.Username);
        command.Parameters.AddWithValue("@password", user.Password);
        command.Parameters.AddWithValue("@email", user.Email);
        command.Parameters.AddWithValue("@role", user.Role);
        command.ExecuteNonQuery();
    }

    public void DeleteUser(string username)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Users WHERE Username = @username";
        command.Parameters.AddWithValue("@username", username);
        command.ExecuteNonQuery();
    }

    public void AddCourse(Course course)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT INTO Courses (CourseId, Name, Description, TeacherUserId, GradingStrategy)
            VALUES (@courseId, @name, @description, @teacherUserId, @gradingStrategy)";
        command.Parameters.AddWithValue("@courseId", course.CourseId);
        command.Parameters.AddWithValue("@name", course.Name);
        command.Parameters.AddWithValue("@description", course.Description);
        command.Parameters.AddWithValue("@teacherUserId", course.Teacher.UserId);
        command.Parameters.AddWithValue("@gradingStrategy", SerializeGradingStrategy(course.GradingStrategy));
        command.ExecuteNonQuery();
    }

    public void UpdateCourse(Course course)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"UPDATE Courses
            SET Name = @name,
                Description = @description,
                TeacherUserId = @teacherUserId,
                GradingStrategy = @gradingStrategy
            WHERE CourseId = @courseId";
        command.Parameters.AddWithValue("@courseId", course.CourseId);
        command.Parameters.AddWithValue("@name", course.Name);
        command.Parameters.AddWithValue("@description", course.Description);
        command.Parameters.AddWithValue("@teacherUserId", course.Teacher.UserId);
        command.Parameters.AddWithValue("@gradingStrategy", SerializeGradingStrategy(course.GradingStrategy));
        command.ExecuteNonQuery();
    }

    public void DeleteCourse(string courseId)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Courses WHERE CourseId = @courseId";
        command.Parameters.AddWithValue("@courseId", courseId);
        command.ExecuteNonQuery();
    }

    public void AddEnrollment(string courseId, string studentUserId)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT OR IGNORE INTO Enrollments (CourseId, StudentUserId)
            VALUES (@courseId, @studentUserId)";
        command.Parameters.AddWithValue("@courseId", courseId);
        command.Parameters.AddWithValue("@studentUserId", studentUserId);
        command.ExecuteNonQuery();
    }

    public void RemoveEnrollment(string courseId, string studentUserId)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            "DELETE FROM Grades WHERE CourseId = @courseId AND StudentUserId = @studentUserId";
        command.Parameters.AddWithValue("@courseId", courseId);
        command.Parameters.AddWithValue("@studentUserId", studentUserId);
        command.ExecuteNonQuery();

        using var deleteEnrollment = connection.CreateCommand();
        deleteEnrollment.CommandText =
            "DELETE FROM Enrollments WHERE CourseId = @courseId AND StudentUserId = @studentUserId";
        deleteEnrollment.Parameters.AddWithValue("@courseId", courseId);
        deleteEnrollment.Parameters.AddWithValue("@studentUserId", studentUserId);
        deleteEnrollment.ExecuteNonQuery();
    }

    public void AddGrade(string courseId, string studentUserId, Grade grade)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT INTO Grades (CourseId, StudentUserId, GradeValue, GradeWeight)
            VALUES (@courseId, @studentUserId, @gradeValue, @gradeWeight)";
        command.Parameters.AddWithValue("@courseId", courseId);
        command.Parameters.AddWithValue("@studentUserId", studentUserId);
        command.Parameters.AddWithValue("@gradeValue", grade.GradeValue);
        command.Parameters.AddWithValue("@gradeWeight", grade.GradeWeight);
        command.ExecuteNonQuery();
    }

    public void AddNotification(string studentUserId, string message)
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            @"INSERT INTO Notifications (StudentUserId, Message)
            VALUES (@studentUserId, @message)";
        command.Parameters.AddWithValue("@studentUserId", studentUserId);
        command.Parameters.AddWithValue("@message", message);
        command.ExecuteNonQuery();
    }

    private void Initialize()
    {
        using var connection = OpenConnection();
        using var command = connection.CreateCommand();
        command.CommandText =
            """
            CREATE TABLE IF NOT EXISTS Users (
                UserId TEXT PRIMARY KEY,
                Username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                Password TEXT NOT NULL,
                Email TEXT NOT NULL,
                Role TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Courses (
                CourseId TEXT PRIMARY KEY COLLATE NOCASE,
                Name TEXT NOT NULL,
                Description TEXT NOT NULL,
                TeacherUserId TEXT NOT NULL,
                GradingStrategy TEXT NOT NULL,
                FOREIGN KEY (TeacherUserId) REFERENCES Users(UserId) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS Enrollments (
                CourseId TEXT NOT NULL,
                StudentUserId TEXT NOT NULL,
                PRIMARY KEY (CourseId, StudentUserId),
                FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE,
                FOREIGN KEY (StudentUserId) REFERENCES Users(UserId) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Grades (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                CourseId TEXT NOT NULL,
                StudentUserId TEXT NOT NULL,
                GradeValue INTEGER NOT NULL,
                GradeWeight INTEGER NOT NULL,
                FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE,
                FOREIGN KEY (StudentUserId) REFERENCES Users(UserId) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Notifications (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                StudentUserId TEXT NOT NULL,
                Message TEXT NOT NULL,
                FOREIGN KEY (StudentUserId) REFERENCES Users(UserId) ON DELETE CASCADE
            );
            """;
        command.ExecuteNonQuery();
    }

    private SqliteConnection OpenConnection()
    {
        var connection = new SqliteConnection($"Data Source={_dbPath}");
        connection.Open();

        using var pragma = connection.CreateCommand();
        pragma.CommandText = "PRAGMA foreign_keys = ON;";
        pragma.ExecuteNonQuery();

        return connection;
    }

    private static User CreateUser(string username, string password, string email, string userId, string role)
    {
        return role.Trim().ToLowerInvariant() switch
        {
            "student" => new Student(username, password, email, userId),
            "teacher" => new Teacher(username, password, email, userId),
            "admin" => new Admin(username, password, email, userId),
            _ => throw new InvalidOperationException("Invalid role specified"),
        };
    }

    private static Course GetCourse(IReadOnlyDictionary<string, Course> courses, string courseId)
    {
        return courses.TryGetValue(courseId, out var course)
            ? course
            : throw new InvalidOperationException($"Course '{courseId}' was not found in the database.");
    }

    private static Student GetStudent(IReadOnlyDictionary<string, User> usersById, string userId)
    {
        return usersById.TryGetValue(userId, out var user) && user is Student student
            ? student
            : throw new InvalidOperationException($"Student '{userId}' was not found in the database.");
    }

    private static Teacher GetTeacher(IReadOnlyDictionary<string, User> usersById, string userId)
    {
        return usersById.TryGetValue(userId, out var user) && user is Teacher teacher
            ? teacher
            : throw new InvalidOperationException($"Teacher '{userId}' was not found in the database.");
    }

    private static string SerializeGradingStrategy(IGradingStrategy strategy)
    {
        return strategy switch
        {
            ArithmeticMeanGradingStrategy => nameof(ArithmeticMeanGradingStrategy),
            WeightedMeanGradingStrategy => nameof(WeightedMeanGradingStrategy),
            MedianGradingStrategy => nameof(MedianGradingStrategy),
            _ => nameof(ArithmeticMeanGradingStrategy),
        };
    }

    private static IGradingStrategy CreateGradingStrategy(string strategyName)
    {
        return strategyName switch
        {
            nameof(WeightedMeanGradingStrategy) => new WeightedMeanGradingStrategy(),
            nameof(MedianGradingStrategy) => new MedianGradingStrategy(),
            _ => new ArithmeticMeanGradingStrategy(),
        };
    }
}
