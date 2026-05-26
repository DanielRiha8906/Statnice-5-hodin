from models.user import Admin, Student, Teacher


class UserFactory:
    def create_user(self, username, password, email, user_id, role):
        role = role.lower()

        if role == "student":
            return Student(username, password, email, user_id)
        elif role == "teacher":
            return Teacher(username, password, email, user_id)
        elif role == "admin":
            return Admin(username, password, email, user_id)
        else:
            raise ValueError("Invalid role specified")
