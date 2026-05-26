from abc import ABC, abstractmethod

from models.grade import Grade


class GradingStrategy(ABC):
    @abstractmethod
    def calculate(self, grades: list[Grade]) -> float:
        pass
