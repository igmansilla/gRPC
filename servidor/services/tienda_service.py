import tienda_pb2
import tienda_pb2_grpc

class TiendaService(tienda_pb2_grpc.TiendaServiceServicer):
    def __init__(self, db):
        self.db = db

    def CreateTienda(self, request, context):
        cursor = self.db.get_cursor()
        
        cursor.execute(
            """
            INSERT INTO tiendas (codigo, direccion, ciudad, provincia, habilitada) 
            VALUES (?, ?, ?, ?, ?)
            """, 
            (request.codigo, request.direccion, request.ciudad, request.provincia, request.habilitada)
        )
        
        for producto_id in request.producto_ids:
            cursor.execute(
                """
                INSERT INTO tienda_productos (tienda_codigo, producto_id)
                VALUES (?, ?)
                """, 
                (request.codigo, producto_id)
            )
        
        self.db.commit()
        
        return request
    
    def GetTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM tiendas WHERE codigo=?", (request.codigo,))
        row = cursor.fetchone()
        if row:
            return tienda_pb2.Tienda(
                codigo=row[0],          
                direccion=row[1],       
                ciudad=row[2],         
                provincia=row[3],       
                habilitada=row[4],     
                producto_ids=row[5:]    
            )
        else:
            return tienda_pb2.Tienda()

    def UpdateTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "UPDATE tiendas SET direccion=?, ciudad=?, provincia=?, habilitada=? WHERE codigo=?", 
            (request.direccion, request.ciudad, request.provincia, request.habilitada, request.codigo) 
        )
        self.db.commit()
        return request

    def DeleteTienda(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("DELETE FROM tiendas WHERE codigo=?", (request.codigo,))  
        self.db.commit()
        return request


    def ListTiendas(self, request, context):
        cursor = self.db.get_cursor()

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

        return tienda_pb2.TiendaList(tiendas=tiendas)
