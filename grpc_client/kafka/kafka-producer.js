const { Kafka } = require('kafkajs');

// Configura el cliente Kafka
const kafka = new Kafka({
  clientId: 'my-node-app',
  brokers: ['localhost:9092'] // Cambia si tu servidor Kafka está en otra dirección
});

// Crea un productor
const producer = kafka.producer();

const run = async (ordenDeCompra) => {
  // Conectar al productor
  await producer.connect();

  // Enviar la orden de compra como mensaje al topic 'example-topic'
  await producer.send({
    topic: 'example-topic',
    messages: [
      { value: JSON.stringify(ordenDeCompra) },
    ],
  });

  console.log('Orden de compra enviada a example-topic');

  // Cerrar el productor después de enviar el mensaje
  await producer.disconnect();
};

module.exports = { run };
