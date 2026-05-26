from service.User_service import UserService
from service.course_service import CourseService
from models.grade import Grade
from strategies import *
from interactive import ConsoleApp


def print_section(title: str):
    print("\n" + "=" * 50)
    print(title)
    print("=" * 50)


if __name__ == "__main__":
    app = ConsoleApp()
    app.run()
