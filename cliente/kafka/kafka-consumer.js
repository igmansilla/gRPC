const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'], 
});

const consumer = kafka.consumer({ groupId: 'orden-compra-group' });

let ordenes = [];
let despachos = [];
let novedades = [];

const run = async () => {
  await consumer.connect();
  
  await consumer.subscribe({ topic: 'solicitudes', fromBeginning: true });
  await consumer.subscribe({ topic: 'despacho', fromBeginning: true });
  await consumer.subscribe({ topic: 'novedades', fromBeginning: true }); 

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const mensaje = JSON.parse(message.value.toString());
      
      if (topic === 'solicitudes') {
        console.log('Orden de compra recibida:', mensaje);
        ordenes.push(mensaje);

      } else if (topic === 'despacho') {
        console.log('Despacho recibido:', mensaje);
        despachos.push(mensaje); 
        
      } else if (topic === 'novedades') {
        console.log('Novedad recibida:', mensaje);
        novedades.push(mensaje);
        
      }
    },
  });
};

module.exports = { run, ordenes, despachos, novedades };
