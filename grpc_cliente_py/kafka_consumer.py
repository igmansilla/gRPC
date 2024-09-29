import json
from confluent_kafka import Consumer, KafkaError, KafkaException

class KafkaConsumer:
    def __init__(self, topic):
        self.topic = topic
        self.consumer_config = {
            'bootstrap.servers': 'localhost:9092',  # Dirección de tu cluster de Kafka
            'group.id': 'grupo-consumidores',
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(self.consumer_config)
        self.consumer.subscribe([self.topic])

    def start_consuming(self):
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)  # Poll con timeout de 1 segundo
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        print(f"End of partition reached {msg.topic()}/{msg.partition()} at offset {msg.offset()}")
                    elif msg.error():
                        raise KafkaException(msg.error())
                else:
                    # Decodifica el mensaje y muéstralo en la consola
                    try:
                        data = json.loads(msg.value().decode('utf-8'))
                        print(f"Mensaje recibido: {data}")
                    except json.JSONDecodeError as e:
                        print(f"Error al decodificar el mensaje: {e} | Mensaje: {msg.value().decode('utf-8')}")

        except KeyboardInterrupt:
            pass
        finally:
            self.consumer.close()

if __name__ == '__main__':
    topic = 'example-topic'  # Cambia esto al nombre de tu topic
    kafka_consumer = KafkaConsumer(topic)
    kafka_consumer.start_consuming()
