import threading
import grpc
from concurrent import futures
from flask import Flask, jsonify, render_template  
import producto_pb2_grpc
import tienda_pb2_grpc
import usuario_pb2_grpc
import producto_tienda_pb2_grpc
from main import InMemoryDatabase  
from services.usuario_service import UsuarioService
from services.producto_service import ProductoService
from services.producto_tienda_service import ProductoTiendaService
from services.tienda_service import TiendaService
from kafka_consumer import KafkaConsumer  
from endpoints import create_orden_de_compra_blueprint, create_producto_blueprint  

db = InMemoryDatabase()

def serve_grpc():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    usuario_pb2_grpc.add_UsuarioServiceServicer_to_server(UsuarioService(db), server)
    producto_pb2_grpc.add_ProductoServiceServicer_to_server(ProductoService(db), server)
    tienda_pb2_grpc.add_TiendaServiceServicer_to_server(TiendaService(db), server)
    producto_tienda_pb2_grpc.add_ProductoTiendaServiceServicer_to_server(ProductoTiendaService(db), server)

    server.add_insecure_port('[::]:50051')

    server.start()
    print("Servidor gRPC corriendo en el puerto 50051...")

    kafka_consumer = KafkaConsumer('orden-de-compra', db) 
    kafka_thread = threading.Thread(target=kafka_consumer.start_consuming)
    kafka_thread.start()

    kafka_recepcion_consumer = KafkaConsumer('recepcion', db) 
    kafka_recepcion_thread = threading.Thread(target=kafka_recepcion_consumer.start_consuming)
    kafka_recepcion_thread.start()

    server.wait_for_termination()

app = Flask(__name__)

orden_de_compra_blueprint = create_orden_de_compra_blueprint(db)  
app.register_blueprint(orden_de_compra_blueprint)

producto_blueprint = create_producto_blueprint(db)
app.register_blueprint(producto_blueprint)

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "Servidor corriendo", "grpc_port": 50051})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')  

def serve():
    grpc_thread = threading.Thread(target=serve_grpc)
    grpc_thread.start()

    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    serve()
