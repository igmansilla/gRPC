import empty_pb2 as _empty_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ProductoTienda(_message.Message):
    __slots__ = ("id", "producto_id", "tienda_id", "color", "talle", "cantidad")
    ID_FIELD_NUMBER: _ClassVar[int]
    PRODUCTO_ID_FIELD_NUMBER: _ClassVar[int]
    TIENDA_ID_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    TALLE_FIELD_NUMBER: _ClassVar[int]
    CANTIDAD_FIELD_NUMBER: _ClassVar[int]
    id: int
    producto_id: int
    tienda_id: str
    color: str
    talle: str
    cantidad: int
    def __init__(self, id: _Optional[int] = ..., producto_id: _Optional[int] = ..., tienda_id: _Optional[str] = ..., color: _Optional[str] = ..., talle: _Optional[str] = ..., cantidad: _Optional[int] = ...) -> None: ...

class ProductoTiendaList(_message.Message):
    __slots__ = ("productos",)
    PRODUCTOS_FIELD_NUMBER: _ClassVar[int]
    productos: _containers.RepeatedCompositeFieldContainer[ProductoTienda]
    def __init__(self, productos: _Optional[_Iterable[_Union[ProductoTienda, _Mapping]]] = ...) -> None: ...
