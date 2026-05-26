import unittest

from models.grade import Grade
from service.User_service import UserService
from service.course_service import CourseService
from strategies.weighted_mean import WeightedMeanGradingStrategy


class CourseServiceTest(unittest.TestCase):
    def setUp(self):
        self.user_service = UserService()
        self.course_service = CourseService()
        self.teacher = self.user_service.register_user(
            "teacher1",
            "pw",
            "teacher@example.com",
            "teacher",
        )
        self.student = self.user_service.register_user(
            "student1",
            "pw",
            "student@example.com",
            "student",
        )

    def test_create_course_and_enroll_student(self):
        course = self.course_service.create_course(
            "ALG",
            "Algorithms",
            "Algorithm basics",
            self.teacher,
        )

        self.course_service.add_student_to_course("ALG", self.student)

        self.assertEqual(course.teacher.username, "teacher1")
        self.assertIn(self.student, course.students)
        self.assertIn(course, self.student.enrolled_courses)

    def test_calculate_weighted_grade(self):
        course = self.course_service.create_course(
            "DB",
            "Databases",
            "SQL course",
            self.teacher,
            WeightedMeanGradingStrategy(),
        )
        self.course_service.add_student_to_course("DB", self.student)
        self.course_service.add_grade_to_student("DB", self.student, Grade(1, 2))
        self.course_service.add_grade_to_student("DB", self.student, Grade(3, 1))

        result = self.course_service.calculate_final_grade("DB", self.student)

        self.assertAlmostEqual(result, 5 / 3)


if __name__ == "__main__":
    unittest.main()
