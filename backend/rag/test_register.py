from rag.database import create_user

user_id = create_user(
    "Najam",
    "najam@gmail.com",
    "najam123"
)

print(user_id)