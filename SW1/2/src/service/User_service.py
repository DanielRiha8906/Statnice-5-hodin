from UserManager.user_factory import UserFactory
from models.user import User


class UserService:
    def __init__(self):
        self.user_factory = UserFactory()
        self.users: dict[str, User] = {}
        self.next_user_id = 0

    def register_user(self, username, password, email, role) -> User:
        if username in self.users:
            raise ValueError("Username already exists")
        self.next_user_id += 1
        user_id = str(self.next_user_id)
        self.users[username] = self.user_factory.create_user(
            username,
            password,
            email,
            user_id,
            role,
        )
        return self.users[username]

    def login_user(self, username, password) -> User:
        if username not in self.users:
            raise ValueError("User does not exist")
        if self.users[username].password != password:
            raise ValueError("Incorrect password")
        return self.users[username]

    def find_user(self, username) -> User | None:
        return self.users.get(username, None)

    def delete_user(self, username) -> bool:
        if username in self.users:
            del self.users[username]
            return True
        else:
            raise ValueError("User does not exist")

    def find_users_by_role(self, role) -> list[User]:
        return [
            user
            for user in self.users.values()
            if user.role.lower() == role.lower()
        ]
