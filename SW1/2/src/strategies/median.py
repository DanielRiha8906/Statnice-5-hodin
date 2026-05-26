from models.grade import Grade
from strategies.grading_strategy import GradingStrategy


class MedianGradingStrategy(GradingStrategy):
    def calculate(self, grades: list[Grade]) -> float:
        if not grades:
            return 0.0

        sorted_grades = sorted(grades, key=lambda g: g.grade_value)
        n = len(sorted_grades)

        if n % 2 == 1:
            return sorted_grades[n // 2].grade_value

        return (
            sorted_grades[n // 2 - 1].grade_value
            + sorted_grades[n // 2].grade_value
        ) / 2
