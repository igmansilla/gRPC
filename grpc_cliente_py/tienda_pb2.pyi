import empty_pb2 as _empty_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Tienda(_message.Message):
    __slots__ = ("codigo", "direccion", "ciudad", "provincia", "habilitada", "producto_ids")
    CODIGO_FIELD_NUMBER: _ClassVar[int]
    DIRECCION_FIELD_NUMBER: _ClassVar[int]
    CIUDAD_FIELD_NUMBER: _ClassVar[int]
    PROVINCIA_FIELD_NUMBER: _ClassVar[int]
    HABILITADA_FIELD_NUMBER: _ClassVar[int]
    PRODUCTO_IDS_FIELD_NUMBER: _ClassVar[int]
    codigo: str
    direccion: str
    ciudad: str
    provincia: str
    habilitada: bool
    producto_ids: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, codigo: _Optional[str] = ..., direccion: _Optional[str] = ..., ciudad: _Optional[str] = ..., provincia: _Optional[str] = ..., habilitada: bool = ..., producto_ids: _Optional[_Iterable[int]] = ...) -> None: ...

class TiendaList(_message.Message):
    __slots__ = ("tiendas",)
    TIENDAS_FIELD_NUMBER: _ClassVar[int]
    tiendas: _containers.RepeatedCompositeFieldContainer[Tienda]
    def __init__(self, tiendas: _Optional[_Iterable[_Union[Tienda, _Mapping]]] = ...) -> None: ...
