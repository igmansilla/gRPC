import producto_pb2
import producto_pb2_grpc

class ProductoService(producto_pb2_grpc.ProductoServiceServicer):
    def __init__(self, db):
        self.db = db

    def CreateProducto(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "INSERT INTO productos (nombre, codigo, talle, foto, color) VALUES (?, ?, ?, ?, ?)", 
            (request.nombre, request.codigo, request.talle, request.foto, request.color)
        )
        self.db.commit()
        return request

    def GetProducto(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM productos WHERE id=?", (request.id,))
        row = cursor.fetchone()
        if row:
            return producto_pb2.Producto(
                id=row[0], nombre=row[1], codigo=row[2], talle=row[3], foto=row[4], color=row[5]
            )
        else:
            return producto_pb2.Producto()

    def UpdateProducto(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "UPDATE productos SET nombre=?, codigo=?, talle=?, foto=?, color=? WHERE id=?", 
            (request.nombre, request.codigo, request.talle, request.foto, request.color, request.id)
        )
        self.db.commit()
        return request

    def DeleteProducto(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("DELETE FROM productos WHERE id=?", (request.id,))
        self.db.commit()
        return request

    def ListProductos(self, request, context):
        cursor = self.db.get_cursor()

        # Realiza la consulta para obtener los productos y sus tiendas relacionadas
        query = '''
        SELECT 
            p.id, p.nombre, p.codigo, p.talle, p.foto, p.color,
            GROUP_CONCAT(pt.tienda_id) as tienda_ids
        FROM productos p
        LEFT JOIN producto_tienda pt ON p.id = pt.producto_id
        GROUP BY p.id, p.nombre, p.codigo, p.talle, p.foto, p.color
        '''
        
        cursor.execute(query)
        rows = cursor.fetchall()

        productos = []
        for row in rows:
            # Convertir la cadena concatenada de tienda_ids a una lista
            tienda_ids = row[6].split(',') if row[6] else []

            producto = producto_pb2.Producto(
                id=row[0],
                nombre=row[1],
                codigo=row[2],
                talle=row[3],
                foto=row[4],
                color=row[5],
                tienda_ids=tienda_ids  # Añadir la lista de IDs de tiendas
            )
            productos.append(producto)

        # Devolver la lista de productos en el formato esperado
        return producto_pb2.ProductoList(productos=productos)
