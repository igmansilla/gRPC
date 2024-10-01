const { Kafka } = require('kafkajs');

// Crear una instancia del cliente Kafka
const kafka = new Kafka({
  clientId: 'my-app', // Nombre del cliente
  brokers: ['localhost:9092'], // Dirección del broker Kafka
});

// Crear un consumer
const consumer = kafka.consumer({ groupId: 'orden-compra-group' });

// Almacenar las órdenes de compra recibidas
let ordenes = [];

// Función para iniciar el consumer
const run = async () => {
  // Conectar el consumer
  await consumer.connect();
  // Suscribirse al topic
  await consumer.subscribe({ topic: 'solicitudes', fromBeginning: true });

  // Manejar los mensajes recibidos
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Obtener el mensaje y parsear
      const ordenDeCompra = JSON.parse(message.value.toString());
      console.log('Orden de compra recibida:', ordenDeCompra);
      
      // Agregar la orden a la lista
      ordenes.push(ordenDeCompra);
      
      // Aquí puedes agregar lógica para guardar en base de datos o hacer más procesamiento
    },
  });
};

// Exportar la función run
module.exports = { run, ordenes };
