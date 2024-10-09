import empty_pb2 as _empty_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Usuario(_message.Message):
    __slots__ = ("id", "nombreUsuario", "contrasena", "tienda_id", "nombre", "apellido", "habilitado")
    ID_FIELD_NUMBER: _ClassVar[int]
    NOMBREUSUARIO_FIELD_NUMBER: _ClassVar[int]
    CONTRASENA_FIELD_NUMBER: _ClassVar[int]
    TIENDA_ID_FIELD_NUMBER: _ClassVar[int]
    NOMBRE_FIELD_NUMBER: _ClassVar[int]
    APELLIDO_FIELD_NUMBER: _ClassVar[int]
    HABILITADO_FIELD_NUMBER: _ClassVar[int]
    id: int
    nombreUsuario: str
    contrasena: str
    tienda_id: str
    nombre: str
    apellido: str
    habilitado: bool
    def __init__(self, id: _Optional[int] = ..., nombreUsuario: _Optional[str] = ..., contrasena: _Optional[str] = ..., tienda_id: _Optional[str] = ..., nombre: _Optional[str] = ..., apellido: _Optional[str] = ..., habilitado: bool = ...) -> None: ...

class UsuarioList(_message.Message):
    __slots__ = ("usuarios",)
    USUARIOS_FIELD_NUMBER: _ClassVar[int]
    usuarios: _containers.RepeatedCompositeFieldContainer[Usuario]
    def __init__(self, usuarios: _Optional[_Iterable[_Union[Usuario, _Mapping]]] = ...) -> None: ...

class LoginRequest(_message.Message):
    __slots__ = ("nombreUsuario", "contrasena")
    NOMBREUSUARIO_FIELD_NUMBER: _ClassVar[int]
    CONTRASENA_FIELD_NUMBER: _ClassVar[int]
    nombreUsuario: str
    contrasena: str
    def __init__(self, nombreUsuario: _Optional[str] = ..., contrasena: _Optional[str] = ...) -> None: ...

class LoginResponse(_message.Message):
    __slots__ = ("success",)
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    success: bool
    def __init__(self, success: bool = ...) -> None: ...
