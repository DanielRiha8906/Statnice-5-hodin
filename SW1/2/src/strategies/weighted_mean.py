from models.grade import Grade
from strategies.grading_strategy import GradingStrategy


class WeightedMeanGradingStrategy(GradingStrategy):
    def calculate(self, grades: list[Grade]) -> float:
        if not grades:
            return 0.0
        total_weight = sum(grade.grade_weight for grade in grades)
        if total_weight == 0:
            return 0.0
        return sum(
            grade.grade_value * grade.grade_weight for grade in grades
        ) / total_weight
