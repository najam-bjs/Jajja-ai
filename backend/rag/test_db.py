from rag.database import get_users

userss = get_users()

for user in userss:
    print(user)