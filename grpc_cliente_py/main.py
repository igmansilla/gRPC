from db.connection import get_connection
from db.schema import create_tables
from db.seed import insert_test_data

class InMemoryDatabase:
    def __init__(self):
        self.conn = get_connection()  # Crear la conexión
        create_tables(self.conn)  # Crear tablas
        insert_test_data(self.conn)  # Insertar datos de prueba

    def get_cursor(self):
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()

if __name__ == '__main__':
    db = InMemoryDatabase()
    print("Base de datos creada y poblada con datos de prueba.")
