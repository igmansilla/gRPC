import threading
import grpc
from concurrent import futures
from flask import Flask, jsonify, render_template  # Añade render_template
import producto_pb2_grpc
import tienda_pb2_grpc
import usuario_pb2_grpc
import producto_tienda_pb2_grpc
from main import InMemoryDatabase  # Importa la base de datos en memoria
from services.usuario_service import UsuarioService
from services.producto_service import ProductoService
from services.producto_tienda_service import ProductoTiendaService
from services.tienda_service import TiendaService
from kafka_consumer import KafkaConsumer  # Importa el consumidor de Kafka
from endpoints import create_orden_de_compra_blueprint  # Importa la función que crea el blueprint

# Inicializa la base de datos en memoria
db = InMemoryDatabase()

# Configuración del servidor gRPC
def serve_grpc():
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

    # Inicia el consumidor de Kafka en un hilo separado, pasando la base de datos al consumidor
    kafka_consumer = KafkaConsumer('orden-de-compra', db)  # Pasa la base de datos
    kafka_thread = threading.Thread(target=kafka_consumer.start_consuming)
    kafka_thread.start()

    # Mantiene el servidor gRPC corriendo indefinidamente
    server.wait_for_termination()

# Inicializa la aplicación Flask para la interfaz básica
app = Flask(__name__)

# Registra el blueprint de las órdenes de compra con la base de datos
orden_de_compra_blueprint = create_orden_de_compra_blueprint(db)  # Pasar la base de datos aquí
app.register_blueprint(orden_de_compra_blueprint)


# Ruta para verificar el estado del servidor
@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "Servidor corriendo", "grpc_port": 50051})

# Ruta para la página de bienvenida
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')  # Sirve el archivo index.html

# Función principal para ejecutar ambos servidores (gRPC y Flask)
def serve():
    # Iniciar el servidor gRPC en un hilo separado
    grpc_thread = threading.Thread(target=serve_grpc)
    grpc_thread.start()

    # Ejecutar la aplicación Flask en el puerto 5000 para la interfaz básica
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    serve()
