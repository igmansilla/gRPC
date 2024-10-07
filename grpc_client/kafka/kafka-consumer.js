const { Kafka } = require('kafkajs');

// Crear una instancia del cliente Kafka
const kafka = new Kafka({
  clientId: 'my-app', // Nombre del cliente
  brokers: ['localhost:9092'], // Dirección del broker Kafka
});

// Crear un consumer
const consumer = kafka.consumer({ groupId: 'orden-compra-group' });

// Almacenar las órdenes de compra, despachos y novedades recibidos
let ordenes = [];
let despachos = [];
let novedades = []; // Arreglo para almacenar las novedades recibidas

// Función para iniciar el consumer
const run = async () => {
  // Conectar el consumer
  await consumer.connect();
  
  // Suscribirse a los topics
  await consumer.subscribe({ topic: 'solicitudes', fromBeginning: true });
  await consumer.subscribe({ topic: 'despacho', fromBeginning: true });
  await consumer.subscribe({ topic: 'novedades', fromBeginning: true }); // Suscripción al topic "novedades"

  // Manejar los mensajes recibidos
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Obtener el mensaje y parsearlo
      const mensaje = JSON.parse(message.value.toString());
      
      if (topic === 'solicitudes') {
        console.log('Orden de compra recibida:', mensaje);
        ordenes.push(mensaje); // Agregar la orden a la lista
        
        // Aquí puedes agregar lógica para guardar en base de datos o más procesamiento
      } else if (topic === 'despacho') {
        console.log('Despacho recibido:', mensaje);
        despachos.push(mensaje); // Agregar el despacho a la lista
        
        // Aquí puedes agregar lógica para manejar los despachos
      } else if (topic === 'novedades') {
        console.log('Novedad recibida:', mensaje);
        novedades.push(mensaje); // Agregar la novedad a la lista
        
        // Aquí puedes agregar lógica adicional para las novedades
      }
    },
  });
};

// Exportar la función run y las listas
module.exports = { run, ordenes, despachos, novedades };
