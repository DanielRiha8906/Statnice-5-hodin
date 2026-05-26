from models.grade import Grade
from strategies.grading_strategy import GradingStrategy


class ArithmeticMeanGradingStrategy(GradingStrategy):
    def calculate(self, grades: list[Grade]) -> float:
        if not grades:
            return 0.0
        count = len(grades)
        total = sum(grade.grade_value for grade in grades)
        return total / count
