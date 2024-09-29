from concurrent import futures
import grpc
import producto_pb2_grpc
import tienda_pb2_grpc
import usuario_pb2_grpc
import producto_tienda_pb2_grpc
from main import InMemoryDatabase  # Importa la clase de base de datos
from services.usuario_service import UsuarioService
from services.producto_service import ProductoService
from services.producto_tienda_service import ProductoTiendaService
from services.tienda_service import TiendaService
from kafka_consumer import KafkaConsumer  # Importa el consumidor de Kafka
import threading

# Función para procesar los datos de la orden de compra recibida desde Kafka
def process_order(order_data):
    # Ejemplo: Log de los datos de la orden de compra
    print(f"Procesando orden de compra: {order_data}")
    # Aquí puedes insertar la lógica para interactuar con tu base de datos o servicios

# Configuración del servidor gRPC
def serve():
    db = InMemoryDatabase()  # Inicializa la base de datos en memoria con datos de prueba
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    # Añade la implementación del servicio al servidor
    usuario_pb2_grpc.add_UsuarioServiceServicer_to_server(UsuarioService(db), server)
    producto_pb2_grpc.add_ProductoServiceServicer_to_server(ProductoService(db), server)
    tienda_pb2_grpc.add_TiendaServiceServicer_to_server(TiendaService(db), server)
    producto_tienda_pb2_grpc.add_ProductoTiendaServiceServicer_to_server(ProductoTiendaService(db), server)

    # Escucha en el puerto 50051
    server.add_insecure_port('[::]:50051')

    # Inicia el servidor gRPC
    server.start()
    
    print("Servidor gRPC corriendo en el puerto 50051...")

    # Inicia el consumidor de Kafka en un hilo separado
    kafka_consumer = KafkaConsumer('example-topic')  # Cambia al nombre de tu topic
    kafka_thread = threading.Thread(target=kafka_consumer.start_consuming)
    kafka_thread.start()

    # Mantiene el servidor corriendo indefinidamente
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
