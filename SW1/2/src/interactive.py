from service.User_service import UserService
from service.course_service import CourseService
from models.grade import Grade
from strategies import *


class ConsoleApp:
    def __init__(self):
        self.user_service = UserService()
        self.course_service = CourseService()
        self.current_user = None

    def run(self):
        print("Welcome to the Course Management System!")
        while True:
            print("\nPlease select an option:")
            print("1. Register")
            print("2. Login")
            print("3. Exit")
            choice = input("Enter your choice: ")
            if choice == "1":
                try:
                    self.current_user = self.user_service.register_user(
                        input("Username: "),
                        input("Password: "),
                        input("Email: "),
                        input("Role (student/teacher/admin): "),
                    )
                    self.router()
                except ValueError as e:
                    print(e)
            elif choice == "2":
                try:
                    self.current_user = self.user_service.login_user(
                        input("Username: "),
                        input("Password: "),
                    )
                    self.router()
                except ValueError as e:
                    print(e)
            elif choice == "3":
                print("Goodbye!")
                break
            else:
                print("Invalid choice, please try again.")

    def router(self):
        if self.current_user is None:
            return
        elif self.current_user.role == "Student":
            self.student_menu()
        elif self.current_user.role == "Teacher":
            self.teacher_menu()
        elif self.current_user.role == "Admin":
            self.admin_menu()

    def student_menu(self):
        while True:
            print("\nStudent Menu:")
            print("1. Show my courses")
            print("2. Show available courses")
            print("3. Show my notifications")
            print("4. Enroll in a course")
            print("5. Show my grades")
            print("6. Logout")
            choice = input("Enter your choice: ")
            if choice == "1":
                for course in self.current_user.enrolled_courses:
                    print(f"{course.course_id}: {course.name}")

            elif choice == "2":
                for course in self.course_service.courses.values():
                    print(
                        f"{course.course_id}: {course.name} "
                        f"(Teacher: {course.teacher.username})"
                    )

            elif choice == "3":
                print(
                    f"Notifications for {self.current_user.username}: "
                    f"{self.current_user.notifications}"
                )

            elif choice == "4":
                course_id = input("Course Id to enroll:")
                try:
                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")
                    if course in self.current_user.enrolled_courses:
                        raise ValueError("You are already enrolled in this course")
                    self.course_service.add_student_to_course(
                        course_id,
                        self.current_user,
                    )
                    print(f"Enrolled in course {course_id} successfully.")
                except ValueError as e:
                    print(e)

            elif choice == "5":
                for course in self.current_user.enrolled_courses:
                    try:
                        final_grade = course.calculate_final_grade(self.current_user)
                        print(
                            f"{course.course_id}: {course.name} "
                            f"- Final Grade: {final_grade:.2f}"
                        )
                    except ValueError as e:
                        print(f"{course.course_id}: {course.name} - {e}")

            elif choice == "6":
                self.current_user = None
                break
            else:
                print("Invalid choice, please try again.")

    def teacher_menu(self):
        while True:
            print("\nTeacher Menu:")
            print("1. Show my courses")
            print("2. Create a new course")
            print("3. Change course details")
            print("4. Add student to course")
            print("5. Add grade to student")
            print("6. Change grading strategy")
            print("7. Logout")

            choice = input("Enter your choice: ")

            if choice == "1":
                if not self.current_user.taught_courses:
                    print("You do not teach any courses yet.")
                else:
                    for course in self.current_user.taught_courses:
                        print(f"{course.course_id}: {course.name}")

            elif choice == "2":
                try:
                    course_id = input("Course ID: ")
                    name = input("Course Name: ")
                    description = input("Course Description: ")

                    self.course_service.create_course(
                        course_id,
                        name,
                        description,
                        self.current_user,
                    )

                    print(f"Course {course_id} created successfully.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "3":
                try:
                    course_id = input("Course ID to change: ")

                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")

                    if course.teacher != self.current_user:
                        raise ValueError("You can only change your own courses")

                    name = input("New Course Name (leave blank to keep unchanged): ")
                    description = input(
                        "New Course Description (leave blank to keep unchanged): "
                    )

                    self.course_service.change_course_details(
                        course_id,
                        name if name else None,
                        description if description else None,
                    )

                    print(f"Course {course_id} details updated successfully.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "4":
                try:
                    course_id = input("Course ID: ")

                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")

                    if course.teacher != self.current_user:
                        raise ValueError("You can only add students to your own courses")

                    student_username = input("Student Username: ")
                    student = self.user_service.find_user(student_username)

                    if student is None:
                        raise ValueError("Student does not exist")

                    if student.role != "Student":
                        raise ValueError("Selected user is not a student")

                    self.course_service.add_student_to_course(course_id, student)

                    print(f"Student {student_username} added to course {course_id}.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "5":
                try:
                    course_id = input("Course ID: ")

                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")

                    if course.teacher != self.current_user:
                        raise ValueError(
                            "You can only grade students in your own courses"
                        )

                    student_username = input("Student Username: ")
                    student = self.user_service.find_user(student_username)

                    if student is None:
                        raise ValueError("Student does not exist")

                    if student.role != "Student":
                        raise ValueError("Selected user is not a student")

                    grade_value = int(input("Grade Value: "))
                    grade_weight = int(input("Grade Weight: "))

                    grade = Grade(grade_value, grade_weight)

                    self.course_service.add_grade_to_student(course_id, student, grade)

                    print(
                        f"Grade added for student {student_username} in "
                        f"course {course_id}."
                    )

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "6":
                try:
                    course_id = input("Course ID: ")

                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")

                    if course.teacher != self.current_user:
                        raise ValueError(
                            "You can only change grading strategy for your own courses"
                        )

                    print("Select grading strategy:")
                    print("1. Arithmetic Mean")
                    print("2. Weighted Mean")
                    print("3. Median")

                    strategy_choice = input("Enter your choice: ")

                    if strategy_choice == "1":
                        course.set_grading_strategy(ArithmeticMeanGradingStrategy())
                    elif strategy_choice == "2":
                        course.set_grading_strategy(WeightedMeanGradingStrategy())
                    elif strategy_choice == "3":
                        course.set_grading_strategy(MedianGradingStrategy())
                    else:
                        raise ValueError("Invalid grading strategy choice")

                    print(
                        f"Grading strategy for course {course_id} "
                        f"updated successfully."
                    )

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "7":
                self.current_user = None
                break

            else:
                print("Invalid choice, please try again.")

    def admin_menu(self):
        while True:
            print("\nAdmin Menu:")
            print("1. Show all courses")
            print("2. Create course")
            print("3. Change course details")
            print("4. Delete course")
            print("5. Show users by role")
            print("6. Add student to course")
            print("7. Add grade to student")
            print("8. Logout")

            choice = input("Enter your choice: ")

            if choice == "1":
                if not self.course_service.courses:
                    print("No courses available.")
                else:
                    for course in self.course_service.courses.values():
                        print(course)

            elif choice == "2":
                try:
                    course_id = input("Course ID: ")
                    name = input("Course Name: ")
                    description = input("Course Description: ")
                    teacher_username = input("Teacher Username: ")

                    teacher = self.user_service.find_user(teacher_username)

                    if teacher is None:
                        raise ValueError("Teacher does not exist")

                    if teacher.role != "Teacher":
                        raise ValueError("Selected user is not a teacher")

                    self.course_service.create_course(
                        course_id,
                        name,
                        description,
                        teacher,
                    )

                    print(f"Course {course_id} created successfully.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "3":
                try:
                    course_id = input("Course ID to change: ")

                    course = self.course_service.find_course(course_id)
                    if course is None:
                        raise ValueError("Course does not exist")

                    name = input("New Course Name (leave blank to keep unchanged): ")
                    description = input(
                        "New Course Description (leave blank to keep unchanged): "
                    )
                    teacher_username = input(
                        "New Teacher Username (leave blank to keep unchanged): "
                    )

                    teacher = None

                    if teacher_username:
                        teacher = self.user_service.find_user(teacher_username)

                        if teacher is None:
                            raise ValueError("Teacher does not exist")

                        if teacher.role != "Teacher":
                            raise ValueError("Selected user is not a teacher")

                    self.course_service.change_course_details(
                        course_id,
                        name if name else None,
                        description if description else None,
                        teacher,
                    )

                    print(f"Course {course_id} details updated successfully.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "4":
                try:
                    course_id = input("Course ID to delete: ")

                    self.course_service.remove_course(course_id)

                    print(f"Course {course_id} deleted successfully.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "5":
                role = input("Role to search (student/teacher/admin): ")
                users = self.user_service.find_users_by_role(role)

                if not users:
                    print("No users found for this role.")
                else:
                    for user in users:
                        print(
                            f"ID: {user.user_id}, "
                            f"Username: {user.username}, "
                            f"Email: {user.email}, "
                            f"Role: {user.role}"
                        )

            elif choice == "6":
                try:
                    course_id = input("Course ID: ")
                    student_username = input("Student Username: ")

                    student = self.user_service.find_user(student_username)

                    if student is None:
                        raise ValueError("Student does not exist")

                    if student.role != "Student":
                        raise ValueError("Selected user is not a student")

                    self.course_service.add_student_to_course(course_id, student)

                    print(f"Student {student_username} added to course {course_id}.")

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "7":
                try:
                    course_id = input("Course ID: ")
                    student_username = input("Student Username: ")

                    student = self.user_service.find_user(student_username)

                    if student is None:
                        raise ValueError("Student does not exist")

                    if student.role != "Student":
                        raise ValueError("Selected user is not a student")

                    grade_value = int(input("Grade Value: "))
                    grade_weight = int(input("Grade Weight: "))

                    grade = Grade(grade_value, grade_weight)

                    self.course_service.add_grade_to_student(course_id, student, grade)

                    print(
                        f"Grade added for student {student_username} in "
                        f"course {course_id}."
                    )

                except ValueError as e:
                    print(f"Error: {e}")

            elif choice == "8":
                self.current_user = None
                break

            else:
                print("Invalid choice, please try again.")
