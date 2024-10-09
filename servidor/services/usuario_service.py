import usuario_pb2
import usuario_pb2_grpc

class UsuarioService(usuario_pb2_grpc.UsuarioServiceServicer):
    def __init__(self, db):
        self.db = db

    def CreateUsuario(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "INSERT INTO usuarios (nombre_usuario, contrasena, tienda_id, nombre, apellido, habilitado) VALUES (?, ?, ?, ?, ?, ?)", 
            (request.nombre_usuario, request.contrasena, request.tienda_id, request.nombre, request.apellido, request.habilitado)
        )
        self.db.commit()
        return request
    
    def GetUsuario(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM usuarios WHERE nombre_usuario=? AND contrasena=?", 
                    (request.nombreUsuario, request.contrasena))
        row = cursor.fetchone()
        
        if row:
            usuario = usuario_pb2.Usuario(
                id=row[0], nombreUsuario=row[1], contrasena=row[2], tienda_id=row[3],
                nombre=row[4], apellido=row[5], habilitado=row[6]
            )
            return usuario
        else:
            return usuario_pb2.Usuario()
        
    def UpdateUsuario(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute(
            "UPDATE usuarios SET nombre_usuario=?, contrasena=?, tienda_id=?, nombre=?, apellido=?, habilitado=? WHERE id=?", 
            (request.nombreUsuario, request.contrasena, request.tienda_id, request.nombre, request.apellido, request.habilitado, request.id)
        )
        self.db.commit()
        return request

    def DeleteUsuario(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("DELETE FROM usuarios WHERE id=?", (request.id,))
        self.db.commit()
        return request

    def ListUsuarios(self, request, context):
        cursor = self.db.get_cursor()
        cursor.execute("SELECT * FROM usuarios")
        rows = cursor.fetchall()
        usuarios = [
            usuario_pb2.Usuario(
                id=row[0], nombreUsuario=row[1], contrasena=row[2], tienda_id=row[3],
                nombre=row[4], apellido=row[5], habilitado=row[6]
            ) for row in rows
        ]
        return usuario_pb2.UsuarioList(usuarios=usuarios)


