from confluent_kafka import Producer, KafkaException
import json

class KafkaProducer:
    def __init__(self):
        self.producer_config = {
            'bootstrap.servers': 'localhost:9092', 
        }
        self.producer = Producer(self.producer_config)

    def send_message(self, topic, message):
        """
        Envía un mensaje al tópico especificado.
        """
        try:
            self.producer.produce(topic, value=json.dumps(message).encode('utf-8'))
            self.producer.flush()  
            print(f"Mensaje enviado al tema '{topic}': {message}")
        except KafkaException as e:
            print(f"Error al enviar mensaje: {e}")
