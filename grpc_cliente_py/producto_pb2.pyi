import empty_pb2 as _empty_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Producto(_message.Message):
    __slots__ = ("id", "nombre", "codigo", "talle", "foto", "color", "tienda_ids")
    ID_FIELD_NUMBER: _ClassVar[int]
    NOMBRE_FIELD_NUMBER: _ClassVar[int]
    CODIGO_FIELD_NUMBER: _ClassVar[int]
    TALLE_FIELD_NUMBER: _ClassVar[int]
    FOTO_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    TIENDA_IDS_FIELD_NUMBER: _ClassVar[int]
    id: int
    nombre: str
    codigo: str
    talle: str
    foto: str
    color: str
    tienda_ids: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, id: _Optional[int] = ..., nombre: _Optional[str] = ..., codigo: _Optional[str] = ..., talle: _Optional[str] = ..., foto: _Optional[str] = ..., color: _Optional[str] = ..., tienda_ids: _Optional[_Iterable[str]] = ...) -> None: ...

class ProductoList(_message.Message):
    __slots__ = ("productos",)
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    productos: _containers.RepeatedCompositeFieldContainer[Producto]
    def __init__(self, productos: _Optional[_Iterable[_Union[Producto, _Mapping]]] = ...) -> None: ...
