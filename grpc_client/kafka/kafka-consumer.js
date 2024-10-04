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
let despachos = []; // Arreglo para almacenar los despachos recibidos

// Función para iniciar el consumer
const run = async () => {
  // Conectar el consumer
  await consumer.connect();
  
  // Suscribirse a los topics
  await consumer.subscribe({ topic: 'solicitudes', fromBeginning: true });
  await consumer.subscribe({ topic: 'despacho', fromBeginning: true }); // Suscripción al topic "despacho"

  // Manejar los mensajes recibidos
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Obtener el mensaje y parsear
      const mensaje = JSON.parse(message.value.toString());
      
      if (topic === 'solicitudes') {
        console.log('Orden de compra recibida:', mensaje);
        
        // Agregar la orden a la lista
        ordenes.push(mensaje);
        
        // Aquí puedes agregar lógica para guardar en base de datos o hacer más procesamiento
      } else if (topic === 'despacho') {
        console.log('Despacho recibido:', mensaje);
        
        // Agregar el despacho a la lista
        despachos.push(mensaje);
        
        // Aquí puedes agregar lógica para manejar despachos, como guardar en base de datos
      }
    },
  });
};

// Exportar la función run
module.exports = { run, ordenes, despachos };
