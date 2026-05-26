import unittest

from service.User_service import UserService


class UserServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = UserService()

    def test_register_and_login_user(self):
        user = self.service.register_user(
            "student1",
            "secret",
            "student1@example.com",
            "student",
        )

        self.assertEqual(user.username, "student1")
        self.assertEqual(self.service.login_user("student1", "secret"), user)

    def test_find_users_by_role(self):
        self.service.register_user("student1", "pw", "s1@example.com", "student")
        self.service.register_user("teacher1", "pw", "t1@example.com", "teacher")

        students = self.service.find_users_by_role("student")

        self.assertEqual(len(students), 1)
        self.assertEqual(students[0].role, "Student")


if __name__ == "__main__":
    unittest.main()
