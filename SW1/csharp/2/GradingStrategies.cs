namespace CourseManagementSystem;

public interface IGradingStrategy
{
    double Calculate(IReadOnlyList<Grade> grades);
}

public sealed class ArithmeticMeanGradingStrategy : IGradingStrategy
{
    public double Calculate(IReadOnlyList<Grade> grades)
    {
        return grades.Count == 0 ? 0.0 : grades.Average(grade => grade.GradeValue);
    }
}

public sealed class WeightedMeanGradingStrategy : IGradingStrategy
{
    public double Calculate(IReadOnlyList<Grade> grades)
    {
        if (grades.Count == 0)
        {
            return 0.0;
        }

        var totalWeight = grades.Sum(grade => grade.GradeWeight);
        if (totalWeight == 0)
        {
            return 0.0;
        }

        return grades.Sum(grade => grade.GradeValue * grade.GradeWeight) / (double)totalWeight;
    }
}

public sealed class MedianGradingStrategy : IGradingStrategy
{
    public double Calculate(IReadOnlyList<Grade> grades)
    {
        if (grades.Count == 0)
        {
            return 0.0;
        }

        var sorted = grades.OrderBy(grade => grade.GradeValue).ToList();
        var count = sorted.Count;
        return count % 2 == 1
            ? sorted[count / 2].GradeValue
            : (sorted[(count / 2) - 1].GradeValue + sorted[count / 2].GradeValue) / 2.0;
    }
}
