import json
from confluent_kafka import Consumer, KafkaError, KafkaException
from services.orden_de_compra_service import OrdenDeCompraService  # Importa el servicio de órdenes de compra

class KafkaConsumer:
    def __init__(self, topic, db):
        self.topic = topic
        self.consumer_config = {
            'bootstrap.servers': 'localhost:9092',  # Dirección de tu cluster de Kafka
            'group.id': 'grupo-consumidores',
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(self.consumer_config)
        self.consumer.subscribe([self.topic])
        self.orden_compra_service = OrdenDeCompraService(db)  # Instancia el servicio de órdenes de compra con la base de datos

    def start_consuming(self):
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)  # Poll con timeout de 1 segundo
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        print(f"End of partition reached {msg.topic()}/{msg.partition()} at offset {msg.offset()}")
                    else:
                        raise KafkaException(msg.error())
                else:
                    # Decodifica el mensaje y procesa los datos
                    try:
                        data = json.loads(msg.value().decode('utf-8'))
                        print(f"Mensaje recibido: {data}")
                        
                        # Procesar el mensaje usando el servicio de órdenes de compra
                        self.process_message(data)
                    
                    except json.JSONDecodeError as e:
                        print(f"Error al decodificar el mensaje: {e} | Mensaje: {msg.value().decode('utf-8')}")

        except KeyboardInterrupt:
            pass
        finally:
            self.consumer.close()

    def process_message(self, message):
        """
        Procesa los mensajes recibidos de Kafka y crea una orden de compra.
        """
        try:
            # Extracción de campos del mensaje Kafka (asegúrate de que el formato del mensaje sea correcto)
            tienda_id = message['tienda_id']
            estado = message['estado']
            observaciones = message.get('observaciones', None)
            items = message['items']

            # Llama al servicio de orden de compra para crear la orden y guardar los ítems
            orden_id = self.orden_compra_service.crear_orden_compra(
                tienda_id=tienda_id,
                estado=estado,
                observaciones=observaciones,
                items=items
            )

            print(f"Orden de compra creada con ID: {orden_id}")

        except KeyError as e:
            print(f"Error: Campo faltante en el mensaje: {e}")
        except Exception as e:
            print(f"Error al procesar el mensaje: {e}")


if __name__ == '__main__':
    topic = 'orden-de-compra'  # Cambia esto al nombre de tu topic
    kafka_consumer = KafkaConsumer(topic)
    kafka_consumer.start_consuming()
