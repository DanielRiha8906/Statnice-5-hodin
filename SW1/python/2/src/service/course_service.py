from models.courses import Course


class CourseService:
    def __init__(self):
        self.courses: dict[str, Course] = {}

    def add_course(self, course: Course):
        if course.course_id in self.courses:
            raise ValueError("Course already exists")
        self.courses[course.course_id] = course

    def create_course(
        self,
        course_id: str,
        name: str,
        description: str,
        teacher,
        grading_strategy=None,
    ) -> Course:
        if course_id in self.courses:
            raise ValueError("Course already exists")
        course = Course(course_id, name, description, teacher, grading_strategy)
        self.courses[course_id] = course
        return course

    def remove_course(self, course_id: str):
        if course_id not in self.courses:
            raise ValueError("Course does not exist")

        course = self.courses[course_id]

        if course in course.teacher.taught_courses:
            course.teacher.taught_courses.remove(course)

        for student in list(course.students):
            if course in student.enrolled_courses:
                student.enrolled_courses.remove(course)

        del self.courses[course_id]

    def find_course(self, course_id: str) -> Course | None:
        return self.courses.get(course_id, None)

    def add_student_to_course(self, course_id: str, student):
        course = self.find_course(course_id)
        if course is None:
            raise ValueError("Course does not exist")
        course.enroll_student(student)

    def remove_student_from_course(self, course_id: str, student):
        course = self.find_course(course_id)
        if course is None:
            raise ValueError("Course does not exist")
        course.remove_student(student)

    def change_course_details(
        self,
        course_id: str,
        name: str | None = None,
        description: str | None = None,
        teacher=None,
    ):
        course = self.find_course(course_id)
        if course is None:
            raise ValueError("Course does not exist")
        course.change(name, description, teacher)

    def add_grade_to_student(self, course_id: str, student, grade):
        course = self.find_course(course_id)
        if course is None:
            raise ValueError("Course does not exist")
        course.add_grade(student, grade)

    def calculate_final_grade(self, course_id: str, student) -> float:
        course = self.find_course(course_id)
        if course is None:
            raise ValueError("Course does not exist")
        return course.calculate_final_grade(student)
