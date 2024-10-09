import tienda_pb2
import tienda_pb2_grpc

class TiendaService(tienda_pb2_grpc.TiendaServiceServicer):
    def __init__(self, db):
        self.db = db

    def CreateTienda(self, request, context):
        cursor = self.db.get_cursor()
        
        # Primero inserta los datos de la tienda en la tabla 'tiendas'
        cursor.execute(
            """
            INSERT INTO tiendas (codigo, direccion, ciudad, provincia, habilitada) 
            VALUES (?, ?, ?, ?, ?)
            """, 
            (request.codigo, request.direccion, request.ciudad, request.provincia, request.habilitada)
        )
        
        # Luego inserta las relaciones de producto_ids en la tabla 'tienda_productos' 
        for producto_id in request.producto_ids:
            cursor.execute(
                """
                INSERT INTO tienda_productos (tienda_codigo, producto_id)
                VALUES (?, ?)
                """, 
                (request.codigo, producto_id)
            )
        
        # Confirma las transacciones
        self.db.commit()
        
        # Retorna el mismo request como respuesta
        return request
    
    def GetTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM tiendas WHERE codigo=?", (request.codigo,))  # Cambiar 'id' por 'codigo'
        row = cursor.fetchone()
        if row:
            return tienda_pb2.Tienda(
                codigo=row[0],          # Asignar 'codigo'
                direccion=row[1],       # Asignar 'direccion'
                ciudad=row[2],          # Asignar 'ciudad'
                provincia=row[3],       # Asignar 'provincia'
                habilitada=row[4],      # Asignar 'habilitada'
                producto_ids=row[5:]    # Asignar 'producto_ids' (asumiendo que los IDs están en columnas sucesivas)
            )
        else:
            return tienda_pb2.Tienda()

    def UpdateTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "UPDATE tiendas SET direccion=?, ciudad=?, provincia=?, habilitada=? WHERE codigo=?", 
            (request.direccion, request.ciudad, request.provincia, request.habilitada, request.codigo)  # Cambiar 'id' por 'codigo'
        )
        self.db.commit()
        return request

    def DeleteTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("DELETE FROM tiendas WHERE codigo=?", (request.codigo,))  # Cambiar 'id' por 'codigo'
        self.db.commit()
        return request


    def ListTiendas(self, request, context):
        cursor = self.db.get_cursor()

        # Realiza la consulta para obtener las tiendas y sus productos relacionados
        query = '''
        SELECT 
            t.codigo, t.direccion, t.ciudad, t.provincia, t.habilitada, 
            GROUP_CONCAT(pt.producto_id) as producto_ids
        FROM tiendas t
        LEFT JOIN producto_tienda pt ON t.codigo = pt.tienda_id
        GROUP BY t.codigo, t.direccion, t.ciudad, t.provincia, t.habilitada
        '''
        cursor.execute(query)
        rows = cursor.fetchall()

        tiendas = []
        for row in rows:
            # Convertir la cadena concatenada de producto_ids a una lista de enteros
            producto_ids = [int(pid) for pid in row[5].split(',')] if row[5] else []

            tienda = tienda_pb2.Tienda(
                codigo=row[0],
                direccion=row[1],
                ciudad=row[2],
                provincia=row[3],
                habilitada=row[4],
                producto_ids=producto_ids
            )
            tiendas.append(tienda)

        # Devolver la lista de tiendas en el formato esperado
        return tienda_pb2.TiendaList(tiendas=tiendas)
