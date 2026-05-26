from typing import Optional

from models.grade import Grade
from models.user import Student, Teacher
from strategies import *


class Course:
    def __init__(
        self,
        course_id: str,
        name: str,
        description: str,
        teacher: Teacher,
        grading_strategy: Optional[GradingStrategy] = None,
    ):
        self.course_id = course_id
        self.name = name
        self.description = description
        self.teacher = teacher
        self.students: list[Student] = []
        if self not in teacher.taught_courses:
            teacher.taught_courses.append(self)
        self.grades: dict[str, list[Grade]] = {}
        self.grading_strategy = grading_strategy or ArithmeticMeanGradingStrategy()

    def __str__(self):
        return (
            f"Course ID: {self.course_id}, Name: {self.name}, "
            f"Teacher: {self.teacher.username}, "
            f"Enrolled Students: {[s.username for s in self.students]}"
        )

    def set_grading_strategy(self, strategy: GradingStrategy):
        self.grading_strategy = strategy

    def enroll_student(self, student: Student):
        if student not in self.students:
            self.students.append(student)
        if self not in student.enrolled_courses:
            student.enrolled_courses.append(self)

    def remove_student(self, student: Student):
        if student in self.students:
            self.students.remove(student)
        if self in student.enrolled_courses:
            student.enrolled_courses.remove(self)

    def notify_students(self, message: str):
        for student in self.students:
            student.update(message)

    def change(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        teacher: Optional[Teacher] = None,
    ):
        changes = []

        if name is not None:
            self.name = name
            changes.append(f"Course name changed to {name}")
        if description is not None:
            self.description = description
            changes.append(f"Course description updated to {description}")
        if teacher is not None and teacher != self.teacher:
            if self in self.teacher.taught_courses:
                self.teacher.taught_courses.remove(self)
            self.teacher = teacher
            if self not in teacher.taught_courses:
                teacher.taught_courses.append(self)
            changes.append(f"Course teacher changed to {teacher.username}")
        if changes:
            self.notify_students(" | ".join(changes))

    def add_grade(self, student: Student, grade: Grade):
        if student not in self.students:
            raise ValueError("Student is not enrolled in the course")
        if student.user_id not in self.grades:
            self.grades[student.user_id] = []
        self.grades[student.user_id].append(grade)

    def calculate_final_grade(self, student: Student) -> float:
        if student not in self.students:
            raise ValueError("Student is not enrolled in the course")

        if student.user_id not in self.grades:
            raise ValueError("No grades available for this student")
        return self.grading_strategy.calculate(self.grades[student.user_id])
