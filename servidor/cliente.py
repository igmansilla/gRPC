import grpc
import helloworld_pb2
import helloworld_pb2_grpc

def run():
    # Establece una conexión con el servidor gRPC
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = helloworld_pb2_grpc.GreeterStub(channel)

        # Crea una solicitud
        request = helloworld_pb2.HelloRequest(name="Python Client!")

        # Llama al método del servicio
        response = stub.SayHello(request)

        print(f"Response: {response.message}")

if __name__ == '__main__':
    run()