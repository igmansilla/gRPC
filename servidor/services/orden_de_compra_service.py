from kafka_producer import KafkaProducer  
from datetime import datetime, timedelta

class OrdenDeCompraService:
    def __init__(self, db):
        self.db = db
        self.kafka_producer = KafkaProducer()  

    def crear_orden_compra(self, tienda_id, estado, observaciones, items): 
        """
        Crea una nueva orden de compra y sus ítems asociados, y envía un mensaje a Kafka.
        Actualiza el stock de productos si la orden es aceptada.
        En caso de que no haya stock suficiente, la orden queda ACEPTADA, 
        pero se informa sobre los artículos faltantes.
        """
        cursor = self.db.get_cursor()
        
        errores, faltantes_stock = self.validar_items(cursor, items)
        
        estado, observaciones = self.generar_estado_observaciones(errores, faltantes_stock)
        print("Estado y observaciones generadas:", estado, observaciones)
        
        orden_compra_id = self.insertar_orden_compra(cursor, tienda_id, estado, observaciones)
        
        if not errores:
            self.insertar_items_orden_compra(cursor, orden_compra_id, items)

            if not faltantes_stock:
                self.actualizar_stock(cursor, items)
                orden_despacho_id = self.generar_orden_despacho(cursor, tienda_id, orden_compra_id)
                self.enviar_mensaje_despacho(tienda_id, orden_despacho_id, orden_compra_id)

        self.db.commit()

        self.enviar_mensaje_kafka(tienda_id, orden_compra_id, estado, observaciones, items)

        return orden_compra_id



    def validar_items(self, cursor, items):
        """Valida los ítems y devuelve errores y artículos faltantes de stock."""
        errores = []
        faltantes_stock = [] 
        productos_agrupados = {}

        for item in items:
            print(f"===> Procesando ítem: {item}")
            producto_id = item['producto_id']
            
            if item['cantidad'] < 1:
                error_msg = f"Artículo {producto_id}: cantidad mal informada."
                errores.append(error_msg)
                print(f"Error de cantidad: {error_msg}")
            
            if producto_id in productos_agrupados:
                productos_agrupados[producto_id]['cantidad'] += item['cantidad']
            else:
                productos_agrupados[producto_id] = {
                    'producto_id': producto_id,
                    'cantidad': item['cantidad']
                }

        print(f"Productos agrupados: {productos_agrupados}")
        
        for producto_id, datos in productos_agrupados.items():
            print(f"===> Validando stock del producto {producto_id} con cantidad total solicitada: {datos['cantidad']}")
            
            cursor.execute("SELECT cantidad_stock_proveedor FROM productos WHERE codigo = ?", (producto_id,))
            stock = cursor.fetchone()

            print(f"Stock disponible para producto {producto_id}: {stock}")

            if not stock:
                error_msg = f"Artículo {producto_id}: no existe en el inventario."
                errores.append(error_msg)
                print(f"Error de inventario: {error_msg}")
            else:
                if datos['cantidad'] > stock[0]:
                    faltante_stock = {
                        'producto_id': producto_id,
                        'cantidad_solicitada': datos['cantidad'],
                        'cantidad_disponible': stock[0]
                    }
                    faltantes_stock.append(faltante_stock)
                    print(f"Stock insuficiente para {producto_id}: {faltante_stock}")

        print(f"Errores detectados: {errores}")
        print(f"Faltantes de stock: {faltantes_stock}")
        
        return errores, faltantes_stock




    def generar_estado_observaciones(self, errores, faltantes_stock):
        """Genera el estado y las observaciones de la orden."""
        estado = 'ACEPTADA'
        if errores:
            observaciones = '; '.join(errores)
            estado = 'RECHAZADA'
        elif faltantes_stock:
            observaciones = "Artículos faltantes: " + '; '.join([
                f"{falta['producto_id']}: solicitado {falta['cantidad_solicitada']}, disponible {falta['cantidad_disponible']}"
                for falta in faltantes_stock
            ])
            estado = 'PAUSADA'
        else:
            observaciones = ""

        return estado, observaciones


    def insertar_orden_compra(self, cursor, tienda_id, estado, observaciones):
        """Inserta la orden de compra en la base de datos y devuelve su ID."""
        cursor.execute(
            '''
            INSERT INTO ordenes_compra (tienda_id, fecha_solicitud, estado, observaciones)
            VALUES (?, datetime('now'), ?, ?)
            ''', 
            (tienda_id, estado, observaciones)
        )
        return cursor.lastrowid


    def insertar_items_orden_compra(self, cursor, orden_compra_id, items):
        """Inserta los ítems de la orden de compra en la base de datos."""
        for item in items:
            if item['cantidad'] > 0: 
                cursor.execute(
                    '''
                    INSERT INTO items_orden_compra (orden_compra_id, producto_id, color, talle, cantidad)
                    VALUES (?, ?, ?, ?, ?)
                    ''', 
                    (orden_compra_id, item['producto_id'], item['color'], item['talle'], item['cantidad'])
                )




    def actualizar_stock(self, cursor, items):
        """Actualiza el stock de productos en la base de datos."""
        for item in items:
            cursor.execute(
                '''
                UPDATE productos 
                SET cantidad_stock_proveedor = cantidad_stock_proveedor - ? 
                WHERE codigo = ?
                ''',
                (item['cantidad'], item['producto_id'])
            )


    def enviar_mensaje_kafka(self, tienda_id, orden_compra_id, estado, observaciones, items):
        """Envía un mensaje a Kafka con la información de la orden de compra."""
        mensaje_kafka = {
            'orden_id': orden_compra_id,
            'tienda_id': tienda_id,
            'estado': 'ACEPTADA' if estado == 'PAUSADA' else estado,
            'observaciones': observaciones,
            'items': items
        }
        self.kafka_producer.send_message(f"solicitudes", mensaje_kafka) 


    def obtener_ordenes_compra(self):
        """
        Retorna todas las órdenes de compra.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM ordenes_compra')
        rows = cursor.fetchall()
        print("Registros de órdenes de compra:", rows)  
        if not rows:
            print("No se encontraron órdenes de compra.")

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
        
        if articulo:
            columnas = [column[0] for column in cursor.description]
            return dict(zip(columnas, articulo))
        return None  
    def generar_orden_despacho(self, cursor, tienda_id, orden_compra_id):
        """Genera una nueva orden de despacho y devuelve su ID."""
        cursor.execute(
            '''
            INSERT INTO ordenes_despacho (orden_compra_id, fecha_estimacion_envio, estado)
            VALUES (?, datetime('now', '+7 days'), 'PENDIENTE')  -- Estado inicial 'PENDIENTE'
            ''',
            (orden_compra_id,)
        )
        return cursor.lastrowid

    def enviar_mensaje_despacho(self, tienda_id, orden_despacho_id, orden_compra_id):
        """Envía un mensaje al topic de despacho con la información relevante."""
        fecha_estimacion_envio = datetime.now() + timedelta(days=7)
        
        mensaje_despacho = {
            'orden_despacho_id': orden_despacho_id,
            'orden_compra_id': orden_compra_id,
            'fecha_estimacion_envio': fecha_estimacion_envio.isoformat()  
        }
        
        self.kafka_producer.send_message(f"despacho", mensaje_despacho)  
    def marcar_orden_recibida(self, orden_id, despacho_id):
        """
        Marca una orden como recibida en la base de datos.
        """
        cursor = self.db.get_cursor()
        
        cursor.execute("SELECT estado FROM ordenes_compra WHERE id = ?", (orden_id,))
        resultado = cursor.fetchone()

        if resultado is None:
            print(f"Orden {orden_id} no existe en la base de datos.")
            return False

        estado = resultado[0] 

        if estado != 'ACEPTADA':
            print(f"Orden {orden_id} no puede ser marcada como recibida porque no está en estado ACEPTADA. Está en {estado}")
            return False

        cursor.execute(
            '''
            UPDATE ordenes_compra 
            SET fecha_recepcion = datetime('now') 
            WHERE id = ?
            ''',
            (orden_id,)
        )

        self.db.commit()

        print(f"Orden {orden_id} marcada como recibida con despacho {despacho_id}.")

        return True
