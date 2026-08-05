import psycopg2
import bcrypt

conn = psycopg2.connect(
        host="localhost",
        database="JajjaAi",
        user="postgres",
        password="123",
        port="5432"
    )
cursor = conn.cursor()
def get_users():
    cursor.execute("SELECT * FROM userss")
    return cursor.fetchall()
def create_user(u_name, email, password):

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    query = """
    INSERT INTO userss (u_name, email, password)
    VALUES (%s, %s, %s)
    RETURNING u_id
    """

    cursor.execute(
        query,
        (u_name, email, hashed_password)
    )

    user_id = cursor.fetchone()[0]

    conn.commit()

    return user_id

def get_user_by_email(email):
    query = """
    SELECT u_id, u_name, email, password
    FROM userss
    WHERE email = %s
    """

    cursor.execute(query, (email,))
    return cursor.fetchone()
def verify_user(email, password):
    user = get_user_by_email(email)

    if user is None:
        return None

    stored_password = user[3]

    if bcrypt.checkpw(
        password.encode("utf-8"),
        stored_password.encode("utf-8")
    ):
        return user

    return None