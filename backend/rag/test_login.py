from rag.database import verify_user

user = verify_user(
    "najam@gmail.com",
    "najam123"
)

print(user)