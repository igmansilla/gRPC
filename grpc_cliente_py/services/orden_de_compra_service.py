class OrdenDeCompraService:
    def __init__(self, db):
        self.db = db

    def crear_orden_compra(self, tienda_id, estado, observaciones, items):
        """
        Crea una nueva orden de compra y sus ítems asociados.
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

        self.db.commit()
        print(f"Orden de compra creada con ID: {orden_compra_id}")
        return orden_compra_id

    def obtener_ordenes_compra(self):
        """
        Retorna todas las órdenes de compra.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM ordenes_compra')
        return cursor.fetchall()

    def obtener_items_por_orden(self, orden_compra_id):
        """
        Retorna todos los ítems asociados a una orden de compra.
        """
        cursor = self.db.get_cursor()
        cursor.execute('SELECT * FROM items_orden_compra WHERE orden_compra_id = ?', (orden_compra_id,))
        return cursor.fetchall()
