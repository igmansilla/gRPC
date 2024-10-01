# services/orden_de_compra_service.py
from kafka_producer import KafkaProducer  # Importa el productor de Kafka

class OrdenDeCompraService:
    def __init__(self, db):
        self.db = db
        self.kafka_producer = KafkaProducer()  # Instancia del productor de Kafka

    def crear_orden_compra(self, tienda_id, estado, observaciones, items): 
        """
        Crea una nueva orden de compra y sus ítems asociados, y envía un mensaje a Kafka.
        """
        cursor = self.db.get_cursor()

        # Insertar la orden de compra
        cursor.execute(
            '''
            INSERT INTO ordenes_compra (tienda_id, fecha_solicitud, estado, observaciones)
            VALUES (?, datetime('now'), ?, ?)
            ''', 
            (tienda_id, estado, observaciones)
        )
        orden_compra_id = cursor.lastrowid

        # Insertar los ítems de la orden de compra
        for item in items:
            cursor.execute(
                '''
                INSERT INTO items_orden_compra (orden_compra_id, producto_id, color, talle, cantidad)
                VALUES (?, ?, ?, ?, ?)
                ''', 
                (orden_compra_id, item['producto_id'], item['color'], item['talle'], item['cantidad'])
            )

        # Realizar el commit de la transacción
        self.db.commit()

        # Enviar el mensaje a Kafka
        mensaje_kafka = {
            'orden_id': orden_compra_id,
            'tienda_id': tienda_id,
            'estado': estado,
            'observaciones': observaciones,
            'items': items
        }
        self.kafka_producer.send_message('solicitudes', mensaje_kafka)  # Enviar al tema 'solicitudes'

        return orden_compra_id

    def obtener_ordenes_compra(self):
        """
        Retorna todas las órdenes de compra.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM ordenes_compra')
        rows = cursor.fetchall()
        print("Registros de órdenes de compra:", rows)  # Imprime los registros recuperados
        if not rows:
            print("No se encontraron órdenes de compra.")

        # Convierte a un diccionario si es necesario
        columnas = [column[0] for column in cursor.description]
        return [dict(zip(columnas, row)) for row in rows]

    def obtener_items_por_orden(self, orden_compra_id):
        """
        Retorna todos los ítems asociados a una orden de compra.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM items_orden_compra WHERE orden_compra_id = ?', (orden_compra_id,))
        return cursor.fetchall()

    def obtener_articulo_por_id(self, articulo_id):
        """
        Retorna un artículo por su ID.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM productos WHERE id = ?', (articulo_id,))
        articulo = cursor.fetchone()
        
        # Convertir a un diccionario si el artículo existe
        if articulo:
            columnas = [column[0] for column in cursor.description]
            return dict(zip(columnas, articulo))
        return None  # Retorna None si el artículo no existe
