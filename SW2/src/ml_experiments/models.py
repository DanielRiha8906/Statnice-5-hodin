"""Doménové modely používané aplikací.

V tomto souboru držíme jednoduché datové třídy, které reprezentují objekty
z našeho problému. Datové třídy pomáhají oddělit aplikační logiku od GUI i od
SQL dotazů, protože si mezi vrstvami nepředáváme anonymní slovníky, ale jasně
pojmenované typy.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Experiment:
    """Reprezentuje experiment neboli řešenou úlohu.

    Atributy:
        id: Primární klíč v databázi. Před uložením může být `None`.
        name: Krátký název experimentu.
        description: Textový popis cíle nebo kontextu experimentu.
    """

    name: str
    description: str
    id: int | None = None


@dataclass(slots=True)
class ModelParameter:
    """Reprezentuje jeden konfigurační parametr modelu.

    Parametry ukládáme jako dvojici `název -> hodnota`. Je to flexibilnější než
    mít pro každý algoritmus vlastní tabulku, protože Random Forest i SVC mají
    jiné parametry.
    """

    name: str
    value: str


@dataclass(slots=True)
class MLModel:
    """Reprezentuje model strojového učení bez vazby na konkrétní experiment.

    Jeden model může být nadefinovaný samostatně a teprve následně přiřazený do
    experimentu spolu s výsledkem. Takové oddělení odpovídá zadání a zároveň je
    i návrhově čisté: definice modelu není totéž co jeho výsledek v experimentu.
    """

    model_type: str
    name: str
    description: str
    parameters: list[ModelParameter] = field(default_factory=list)
    id: int | None = None


@dataclass(slots=True)
class ExperimentResult:
    """Spojuje experiment, model a naměřený výsledek.

    Tato třída odpovídá relační vazbě „model byl použit v experimentu a dosáhl
    výsledku X“. Výsledek je podle zadání uložen jako jediné číselné skóre.
    """

    experiment_id: int
    model_id: int
    result_value: float
    id: int | None = None


@dataclass(slots=True)
class ResultView:
    """Pohledová datová třída pro zobrazení výsledků v GUI.

    Třída obsahuje už „spojená“ data z více tabulek, aby měla tabulka v GUI
    všechny potřebné údaje pohromadě.
    """

    assignment_id: int
    experiment_id: int
    experiment_name: str
    model_id: int
    model_name: str
    model_type: str
    model_description: str
    result_value: float
    parameters_text: str

