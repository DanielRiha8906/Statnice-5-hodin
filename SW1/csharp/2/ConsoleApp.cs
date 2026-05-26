namespace CourseManagementSystem;

public sealed class ConsoleApp
{
    private readonly UserService _userService = new();
    private readonly CourseService _courseService = new();
    private User? _currentUser;

    public void Run()
    {
        Console.WriteLine("Welcome to the Course Management System!");

        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("Please select an option:");
            Console.WriteLine("1. Register");
            Console.WriteLine("2. Login");
            Console.WriteLine("3. Exit");

            switch (Read("Enter your choice: "))
            {
                case "1":
                    TryAction(() =>
                    {
                        _currentUser = _userService.RegisterUser(
                            Read("Username: "),
                            Read("Password: "),
                            Read("Email: "),
                            Read("Role (student/teacher/admin): ")
                        );
                        Router();
                    });
                    break;
                case "2":
                    TryAction(() =>
                    {
                        _currentUser = _userService.LoginUser(
                            Read("Username: "),
                            Read("Password: ")
                        );
                        Router();
                    });
                    break;
                case "3":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void Router()
    {
        switch (_currentUser)
        {
            case Student:
                StudentMenu();
                break;
            case Teacher:
                TeacherMenu();
                break;
            case Admin:
                AdminMenu();
                break;
        }
    }

    private void StudentMenu()
    {
        var student = (Student)_currentUser!;

        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("Student Menu:");
            Console.WriteLine("1. Show my courses");
            Console.WriteLine("2. Show available courses");
            Console.WriteLine("3. Show my notifications");
            Console.WriteLine("4. Enroll in a course");
            Console.WriteLine("5. Show my grades");
            Console.WriteLine("6. Logout");

            switch (Read("Enter your choice: "))
            {
                case "1":
                    foreach (var course in student.EnrolledCourses)
                    {
                        Console.WriteLine($"{course.CourseId}: {course.Name}");
                    }
                    break;
                case "2":
                    foreach (var course in _courseService.Courses.Values)
                    {
                        Console.WriteLine($"{course.CourseId}: {course.Name} (Teacher: {course.Teacher.Username})");
                    }
                    break;
                case "3":
                    Console.WriteLine($"Notifications for {student.Username}: [{string.Join(", ", student.Notifications)}]");
                    break;
                case "4":
                    TryAction(() =>
                    {
                        var courseId = Read("Course Id to enroll: ");
                        var course = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        if (student.EnrolledCourses.Contains(course))
                        {
                            throw new InvalidOperationException("You are already enrolled in this course");
                        }

                        _courseService.AddStudentToCourse(courseId, student);
                        Console.WriteLine($"Enrolled in course {courseId} successfully.");
                    });
                    break;
                case "5":
                    foreach (var course in student.EnrolledCourses)
                    {
                        try
                        {
                            var finalGrade = course.CalculateFinalGrade(student);
                            Console.WriteLine($"{course.CourseId}: {course.Name} - Final Grade: {finalGrade:F2}");
                        }
                        catch (InvalidOperationException ex)
                        {
                            Console.WriteLine($"{course.CourseId}: {course.Name} - {ex.Message}");
                        }
                    }
                    break;
                case "6":
                    _currentUser = null;
                    return;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void TeacherMenu()
    {
        var teacher = (Teacher)_currentUser!;

        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("Teacher Menu:");
            Console.WriteLine("1. Show my courses");
            Console.WriteLine("2. Create a new course");
            Console.WriteLine("3. Change course details");
            Console.WriteLine("4. Add student to course");
            Console.WriteLine("5. Add grade to student");
            Console.WriteLine("6. Change grading strategy");
            Console.WriteLine("7. Logout");

            switch (Read("Enter your choice: "))
            {
                case "1":
                    if (teacher.TaughtCourses.Count == 0)
                    {
                        Console.WriteLine("You do not teach any courses yet.");
                    }
                    else
                    {
                        foreach (var course in teacher.TaughtCourses)
                        {
                            Console.WriteLine($"{course.CourseId}: {course.Name}");
                        }
                    }
                    break;
                case "2":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var name = Read("Course Name: ");
                        var description = Read("Course Description: ");

                        _courseService.CreateCourse(courseId, name, description, teacher);
                        Console.WriteLine($"Course {courseId} created successfully.");
                    });
                    break;
                case "3":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID to change: ");
                        var course = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        if (course.Teacher != teacher)
                        {
                            throw new InvalidOperationException("You can only change your own courses");
                        }

                        var name = Read("New Course Name (leave blank to keep unchanged): ");
                        var description = Read("New Course Description (leave blank to keep unchanged): ");

                        _courseService.ChangeCourseDetails(
                            courseId,
                            string.IsNullOrWhiteSpace(name) ? null : name,
                            string.IsNullOrWhiteSpace(description) ? null : description
                        );

                        Console.WriteLine($"Course {courseId} details updated successfully.");
                    });
                    break;
                case "4":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var course = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        if (course.Teacher != teacher)
                        {
                            throw new InvalidOperationException("You can only add students to your own courses");
                        }

                        var studentUsername = Read("Student Username: ");
                        var student = _userService.FindUser(studentUsername) as Student
                            ?? throw new InvalidOperationException("Student does not exist");

                        _courseService.AddStudentToCourse(courseId, student);
                        Console.WriteLine($"Student {studentUsername} added to course {courseId}.");
                    });
                    break;
                case "5":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var course = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        if (course.Teacher != teacher)
                        {
                            throw new InvalidOperationException("You can only grade students in your own courses");
                        }

                        var studentUsername = Read("Student Username: ");
                        var student = _userService.FindUser(studentUsername) as Student
                            ?? throw new InvalidOperationException("Student does not exist");

                        var grade = new Grade(
                            int.Parse(Read("Grade Value: ")),
                            int.Parse(Read("Grade Weight: "))
                        );

                        _courseService.AddGradeToStudent(courseId, student, grade);
                        Console.WriteLine($"Grade added for student {studentUsername} in course {courseId}.");
                    });
                    break;
                case "6":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var course = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        if (course.Teacher != teacher)
                        {
                            throw new InvalidOperationException("You can only change grading strategy for your own courses");
                        }

                        Console.WriteLine("Select grading strategy:");
                        Console.WriteLine("1. Arithmetic Mean");
                        Console.WriteLine("2. Weighted Mean");
                        Console.WriteLine("3. Median");

                        course.SetGradingStrategy(Read("Enter your choice: ") switch
                        {
                            "1" => new ArithmeticMeanGradingStrategy(),
                            "2" => new WeightedMeanGradingStrategy(),
                            "3" => new MedianGradingStrategy(),
                            _ => throw new InvalidOperationException("Invalid grading strategy choice"),
                        });

                        Console.WriteLine($"Grading strategy for course {courseId} updated successfully.");
                    });
                    break;
                case "7":
                    _currentUser = null;
                    return;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void AdminMenu()
    {
        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("Admin Menu:");
            Console.WriteLine("1. Show all courses");
            Console.WriteLine("2. Create course");
            Console.WriteLine("3. Change course details");
            Console.WriteLine("4. Delete course");
            Console.WriteLine("5. Show users by role");
            Console.WriteLine("6. Add student to course");
            Console.WriteLine("7. Add grade to student");
            Console.WriteLine("8. Logout");

            switch (Read("Enter your choice: "))
            {
                case "1":
                    if (_courseService.Courses.Count == 0)
                    {
                        Console.WriteLine("No courses available.");
                    }
                    else
                    {
                        foreach (var course in _courseService.Courses.Values)
                        {
                            Console.WriteLine(course);
                        }
                    }
                    break;
                case "2":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var name = Read("Course Name: ");
                        var description = Read("Course Description: ");
                        var teacherUsername = Read("Teacher Username: ");

                        var teacher = _userService.FindUser(teacherUsername) as Teacher
                            ?? throw new InvalidOperationException("Teacher does not exist");

                        _courseService.CreateCourse(courseId, name, description, teacher);
                        Console.WriteLine($"Course {courseId} created successfully.");
                    });
                    break;
                case "3":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID to change: ");
                        _ = _courseService.FindCourse(courseId)
                            ?? throw new InvalidOperationException("Course does not exist");

                        var name = Read("New Course Name (leave blank to keep unchanged): ");
                        var description = Read("New Course Description (leave blank to keep unchanged): ");
                        var teacherUsername = Read("New Teacher Username (leave blank to keep unchanged): ");

                        Teacher? teacher = null;
                        if (!string.IsNullOrWhiteSpace(teacherUsername))
                        {
                            teacher = _userService.FindUser(teacherUsername) as Teacher
                                ?? throw new InvalidOperationException("Teacher does not exist");
                        }

                        _courseService.ChangeCourseDetails(
                            courseId,
                            string.IsNullOrWhiteSpace(name) ? null : name,
                            string.IsNullOrWhiteSpace(description) ? null : description,
                            teacher
                        );

                        Console.WriteLine($"Course {courseId} details updated successfully.");
                    });
                    break;
                case "4":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID to delete: ");
                        _courseService.RemoveCourse(courseId);
                        Console.WriteLine($"Course {courseId} deleted successfully.");
                    });
                    break;
                case "5":
                    var role = Read("Role to search (student/teacher/admin): ");
                    var users = _userService.FindUsersByRole(role);
                    if (users.Count == 0)
                    {
                        Console.WriteLine("No users found for this role.");
                    }
                    else
                    {
                        foreach (var user in users)
                        {
                            Console.WriteLine($"ID: {user.UserId}, Username: {user.Username}, Email: {user.Email}, Role: {user.Role}");
                        }
                    }
                    break;
                case "6":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var studentUsername = Read("Student Username: ");
                        var student = _userService.FindUser(studentUsername) as Student
                            ?? throw new InvalidOperationException("Student does not exist");

                        _courseService.AddStudentToCourse(courseId, student);
                        Console.WriteLine($"Student {studentUsername} added to course {courseId}.");
                    });
                    break;
                case "7":
                    TryAction(() =>
                    {
                        var courseId = Read("Course ID: ");
                        var studentUsername = Read("Student Username: ");
                        var student = _userService.FindUser(studentUsername) as Student
                            ?? throw new InvalidOperationException("Student does not exist");

                        var grade = new Grade(
                            int.Parse(Read("Grade Value: ")),
                            int.Parse(Read("Grade Weight: "))
                        );

                        _courseService.AddGradeToStudent(courseId, student, grade);
                        Console.WriteLine($"Grade added for student {studentUsername} in course {courseId}.");
                    });
                    break;
                case "8":
                    _currentUser = null;
                    return;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private static string Read(string prompt)
    {
        Console.Write(prompt);
        return Console.ReadLine()?.Trim() ?? string.Empty;
    }

    private static void TryAction(Action action)
    {
        try
        {
            action();
        }
        catch (Exception ex) when (ex is InvalidOperationException or FormatException)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
