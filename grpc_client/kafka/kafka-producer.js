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

  // Enviar la orden de compra como mensaje al topic 'orden-de-compra'
  await producer.send({
    topic: 'orden-de-compra',
    messages: [
      { value: JSON.stringify(ordenDeCompra) },
    ],
  });

  console.log('Orden de compra enviada a orden-de-compra');

  // Cerrar el productor después de enviar el mensaje
  await producer.disconnect();
};

module.exports = { run };
