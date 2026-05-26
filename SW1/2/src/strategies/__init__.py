from .grading_strategy import GradingStrategy
from .arithmetic_mean import ArithmeticMeanGradingStrategy
from .weighted_mean import WeightedMeanGradingStrategy
from .median import MedianGradingStrategy

__all__ = [
    "GradingStrategy",
    "ArithmeticMeanGradingStrategy",
    "WeightedMeanGradingStrategy",
    "MedianGradingStrategy",
]
