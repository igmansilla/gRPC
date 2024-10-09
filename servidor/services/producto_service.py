import producto_pb2
import producto_pb2_grpc
from kafka_producer import KafkaProducer

class ProductoService(producto_pb2_grpc.ProductoServiceServicer):
    def __init__(self, db):
        self.db = db
        self.kafka_producer = KafkaProducer()

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
            tienda_ids = row[6].split(',') if row[6] else []

            producto = producto_pb2.Producto(
                id=row[0],
                nombre=row[1],
                codigo=row[2],
                talle=row[3],
                foto=row[4],
                color=row[5],
                tienda_ids=tienda_ids  
            )
            productos.append(producto)

        return producto_pb2.ProductoList(productos=productos)
    
    def crear_producto(self, nombre, codigo, talle, foto, color, cantidad_stock):
        """
        Crea un nuevo producto en la base de datos y envía un mensaje a Kafka.
        """
        cursor = self.db.get_cursor()

        producto_id = self.insertar_producto(cursor, nombre, codigo, talle, foto, color, cantidad_stock)

        self.enviar_mensaje_kafka(producto_id, codigo, talle, color, foto)

        self.db.commit()

        return producto_id

    def insertar_producto(self, cursor, nombre, codigo, talle, foto, color, cantidad_stock):
        """Inserta un nuevo producto en la base de datos y devuelve su ID."""
        cursor.execute(
            '''
            INSERT INTO productos (nombre, codigo, talle, foto, color, cantidad_stock_proveedor)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', 
            (nombre, codigo, talle, foto, color, cantidad_stock)
        )
        return cursor.lastrowid

    def enviar_mensaje_kafka(self, producto_id, codigo, talle, color, foto):
        """Envía un mensaje a Kafka con la información del nuevo producto."""
        mensaje_kafka = {
            'producto_id': producto_id,
            'codigo': codigo,
            'talle': talle,
            'color': color,
            'foto': foto
        }
        self.kafka_producer.send_message("/novedades", mensaje_kafka)  
