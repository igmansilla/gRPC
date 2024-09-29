import producto_tienda_pb2
import producto_tienda_pb2_grpc
from empty_pb2 import Empty

class ProductoTiendaService(producto_tienda_pb2_grpc.ProductoTiendaServiceServicer):
    def __init__(self, db):
        self.db = db

    def CreateProductoTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "INSERT INTO producto_tienda (producto_id, tienda_id, color, talle, cantidad) VALUES (?, ?, ?, ?, ?)",
            (request.producto_id, request.tienda_id, request.color, request.talle, request.cantidad)
        )
        self.db.commit()
        return request

    def GetProductoTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM producto_tienda WHERE id=?", (request.id,))
        row = cursor.fetchone()
        if row:
            return producto_tienda_pb2.ProductoTienda(
                id=row[0], producto_id=row[1], tienda_id=row[2], color=row[3], talle=row[4], cantidad=row[5]
            )
        else:
            return producto_tienda_pb2.ProductoTienda()

    def UpdateProductoTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "UPDATE producto_tienda SET producto_id=?, tienda_id=?, color=?, talle=?, cantidad=? WHERE id=?",
            (request.producto_id, request.tienda_id, request.color, request.talle, request.cantidad, request.id)
        )
        self.db.commit()
        return request

    def DeleteProductoTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("DELETE FROM producto_tienda WHERE id=?", (request.id,))
        self.db.commit()
        return request

    def ListProductoTiendas(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM producto_tienda")
        rows = cursor.fetchall()
        productos = [
            producto_tienda_pb2.ProductoTienda(
                id=row[0], producto_id=row[1], tienda_id=row[2], color=row[3], talle=row[4], cantidad=row[5]
            ) for row in rows
        ]
        return producto_tienda_pb2.ProductoTiendaList(productos=productos)
