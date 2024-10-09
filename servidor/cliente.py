import grpc
import helloworld_pb2
import helloworld_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = helloworld_pb2_grpc.GreeterStub(channel)

        request = helloworld_pb2.HelloRequest(name="Python Client!")

        response = stub.SayHello(request)

        print(f"Response: {response.message}")

if __name__ == '__main__':
    run()