namespace CourseManagementSystem;

public sealed class Course
{
    public Course(
        string courseId,
        string name,
        string description,
        Teacher teacher,
        IGradingStrategy? gradingStrategy = null)
    {
        CourseId = courseId;
        Name = name;
        Description = description;
        Teacher = teacher;
        GradingStrategy = gradingStrategy ?? new ArithmeticMeanGradingStrategy();

        if (!teacher.TaughtCourses.Contains(this))
        {
            teacher.TaughtCourses.Add(this);
        }
    }

    public string CourseId { get; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public Teacher Teacher { get; private set; }
    public List<Student> Students { get; } = new();
    public Dictionary<string, List<Grade>> Grades { get; } = new();
    public IGradingStrategy GradingStrategy { get; private set; }

    public override string ToString()
    {
        var students = string.Join(", ", Students.Select(student => student.Username));
        return $"Course ID: {CourseId}, Name: {Name}, Teacher: {Teacher.Username}, Enrolled Students: [{students}]";
    }

    public void SetGradingStrategy(IGradingStrategy strategy)
    {
        GradingStrategy = strategy;
    }

    public void EnrollStudent(Student student)
    {
        if (!Students.Contains(student))
        {
            Students.Add(student);
        }

        if (!student.EnrolledCourses.Contains(this))
        {
            student.EnrolledCourses.Add(this);
        }
    }

    public void RemoveStudent(Student student)
    {
        Students.Remove(student);
        student.EnrolledCourses.Remove(this);
    }

    public void NotifyStudents(string message)
    {
        foreach (var student in Students)
        {
            student.Update(message);
        }
    }

    public void Change(string? name = null, string? description = null, Teacher? teacher = null)
    {
        var changes = new List<string>();

        if (name is not null)
        {
            Name = name;
            changes.Add($"Course name changed to {name}");
        }

        if (description is not null)
        {
            Description = description;
            changes.Add($"Course description updated to {description}");
        }

        if (teacher is not null && teacher != Teacher)
        {
            Teacher.TaughtCourses.Remove(this);
            Teacher = teacher;
            if (!teacher.TaughtCourses.Contains(this))
            {
                teacher.TaughtCourses.Add(this);
            }

            changes.Add($"Course teacher changed to {teacher.Username}");
        }

        if (changes.Count > 0)
        {
            NotifyStudents(string.Join(" | ", changes));
        }
    }

    public void AddGrade(Student student, Grade grade)
    {
        if (!Students.Contains(student))
        {
            throw new InvalidOperationException("Student is not enrolled in the course");
        }

        if (!Grades.ContainsKey(student.UserId))
        {
            Grades[student.UserId] = new List<Grade>();
        }

        Grades[student.UserId].Add(grade);
    }

    public double CalculateFinalGrade(Student student)
    {
        if (!Students.Contains(student))
        {
            throw new InvalidOperationException("Student is not enrolled in the course");
        }

        if (!Grades.TryGetValue(student.UserId, out var grades))
        {
            throw new InvalidOperationException("No grades available for this student");
        }

        return GradingStrategy.Calculate(grades);
    }
}
