import sqlite3

def get_connection():
    """Crea y retorna una conexión a la base de datos en memoria."""
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    return conn
