class User:
    def __init__(self, username, password, email, user_id):
        self.username = username
        self.password = password
        self.email = email
        self.user_id = user_id


class Student(User):
    def __init__(self, username, password, email, user_id):
        super().__init__(username, password, email, user_id)
        self.enrolled_courses = []
        self.notifications: list[str] = []

    @property
    def role(self):
        return "Student"

    def update(self, message):
        self.notifications.append(message)


class Teacher(User):
    def __init__(self, username, password, email, user_id):
        super().__init__(username, password, email, user_id)
        self.taught_courses = []

    @property
    def role(self):
        return "Teacher"


class Admin(User):
    def __init__(self, username, password, email, user_id):
        super().__init__(username, password, email, user_id)

    @property
    def role(self):
        return "Admin"
