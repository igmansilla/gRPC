const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-node-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const run = async (ordenDeCompra) => {
  await producer.connect();

  await producer.send({
    topic: "orden-de-compra",
    messages: [{ value: JSON.stringify(ordenDeCompra) }],
  });

  console.log("Orden de compra enviada a orden-de-compra");

  await producer.disconnect();
};

const runRecepcion = async (ordenId, despachoId) => {
  await producer.connect();

  await producer.send({
    topic: "recepcion",
    messages: [
      { value: JSON.stringify({ orden_id: ordenId, despacho_id: despachoId }) },
    ],
  });

  console.log("Orden recibida enviada a recepcion");

  await producer.disconnect();
};

module.exports = { run, runRecepcion };
