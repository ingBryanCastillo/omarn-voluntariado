import pymysql
from pymysql.cursors import DictCursor

def get_connection():
    conn = pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="",
        database="omarn_voluntariado",
        cursorclass=DictCursor
    )
    with conn.cursor() as cur:
        cur.execute("SET time_zone = '-06:00'")  # 👈 Fuerza hora Guatemala
    return conn
