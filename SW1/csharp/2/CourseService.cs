namespace CourseManagementSystem;

public sealed class CourseService
{
    private readonly SQLiteSchoolRepository _repository;
    private readonly UserService _userService;

    public Dictionary<string, Course> Courses { get; } = new(StringComparer.OrdinalIgnoreCase);

    public CourseService(SQLiteSchoolRepository repository, UserService userService)
    {
        _repository = repository;
        _userService = userService;
        Courses = _repository.LoadCourses(_userService.Users);
    }

    public void AddCourse(Course course)
    {
        if (Courses.ContainsKey(course.CourseId))
        {
            throw new InvalidOperationException("Course already exists");
        }

        Courses[course.CourseId] = course;
        _repository.AddCourse(course);
    }

    public Course CreateCourse(
        string courseId,
        string name,
        string description,
        Teacher teacher,
        IGradingStrategy? gradingStrategy = null)
    {
        if (Courses.ContainsKey(courseId))
        {
            throw new InvalidOperationException("Course already exists");
        }

        var course = new Course(courseId, name, description, teacher, gradingStrategy);
        Courses[courseId] = course;
        _repository.AddCourse(course);
        return course;
    }

    public void RemoveCourse(string courseId)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.Teacher.TaughtCourses.Remove(course);

        foreach (var student in course.Students.ToList())
        {
            student.EnrolledCourses.Remove(course);
        }

        Courses.Remove(courseId);
        _repository.DeleteCourse(courseId);
    }

    public Course? FindCourse(string courseId)
    {
        return Courses.TryGetValue(courseId, out var course) ? course : null;
    }

    public void AddStudentToCourse(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.EnrollStudent(student);
        _repository.AddEnrollment(courseId, student.UserId);
    }

    public void RemoveStudentFromCourse(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.RemoveStudent(student);
        _repository.RemoveEnrollment(courseId, student.UserId);
    }

    public void ChangeCourseDetails(
        string courseId,
        string? name = null,
        string? description = null,
        Teacher? teacher = null)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        var changes = new List<string>();

        if (name is not null)
        {
            changes.Add($"Course name changed to {name}");
        }

        if (description is not null)
        {
            changes.Add($"Course description updated to {description}");
        }

        if (teacher is not null && teacher != course.Teacher)
        {
            changes.Add($"Course teacher changed to {teacher.Username}");
        }

        course.Change(name, description, teacher);
        _repository.UpdateCourse(course);

        if (changes.Count > 0)
        {
            var message = string.Join(" | ", changes);
            foreach (var student in course.Students)
            {
                _repository.AddNotification(student.UserId, message);
            }
        }
    }

    public void AddGradeToStudent(string courseId, Student student, Grade grade)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.AddGrade(student, grade);
        _repository.AddGrade(courseId, student.UserId, grade);
    }

    public void SetGradingStrategy(string courseId, IGradingStrategy strategy)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.SetGradingStrategy(strategy);
        _repository.UpdateCourse(course);
    }

    public double CalculateFinalGrade(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        return course.CalculateFinalGrade(student);
    }
}
