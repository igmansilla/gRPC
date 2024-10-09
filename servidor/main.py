from db.connection import get_connection
from db.schema import create_tables
from db.seed import insert_test_data

class InMemoryDatabase:
    def __init__(self):
        self.conn = get_connection()  
        create_tables(self.conn)  
        insert_test_data(self.conn)  

    def get_cursor(self):
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()
        
    def get_productos(self):
        cursor = self.get_cursor()

        cursor.execute("SELECT id, nombre, codigo, cantidad_stock_proveedor FROM productos")

        productos = cursor.fetchall()

        productos_list = [
            {"id": row[0], "nombre": row[1], "codigo": row[2], "cantidad_stock_proveedor": row[3]}
            for row in productos
        ]

        cursor.close()

        return productos_list   

if __name__ == '__main__':
    db = InMemoryDatabase()
    print("Base de datos creada y poblada con datos de prueba.")
