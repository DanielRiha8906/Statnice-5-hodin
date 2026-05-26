namespace CourseManagementSystem;

public sealed class CourseService
{
    public Dictionary<string, Course> Courses { get; } = new(StringComparer.OrdinalIgnoreCase);

    public void AddCourse(Course course)
    {
        if (Courses.ContainsKey(course.CourseId))
        {
            throw new InvalidOperationException("Course already exists");
        }

        Courses[course.CourseId] = course;
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
    }

    public Course? FindCourse(string courseId)
    {
        return Courses.TryGetValue(courseId, out var course) ? course : null;
    }

    public void AddStudentToCourse(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.EnrollStudent(student);
    }

    public void RemoveStudentFromCourse(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.RemoveStudent(student);
    }

    public void ChangeCourseDetails(
        string courseId,
        string? name = null,
        string? description = null,
        Teacher? teacher = null)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.Change(name, description, teacher);
    }

    public void AddGradeToStudent(string courseId, Student student, Grade grade)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        course.AddGrade(student, grade);
    }

    public double CalculateFinalGrade(string courseId, Student student)
    {
        var course = FindCourse(courseId) ?? throw new InvalidOperationException("Course does not exist");
        return course.CalculateFinalGrade(student);
    }
}
