const express = require('express');
const router = express.Router();
const { run: kafkaProducerRun } = require('../kafka/kafka-producer');

// Definir la ruta para manejar las órdenes de compra
router.post('/orden-de-compra', async (req, res) => {
  const ordenDeCompra = req.body;  // Obtener los datos de la orden de compra del cuerpo de la solicitud

  try {
    // Enviar la orden de compra a Kafka usando el productor
    await kafkaProducerRun(ordenDeCompra);
    
    res.status(200).send('Orden de compra enviada a Kafka correctamente');
  } catch (error) {
    console.error('Error enviando la orden a Kafka:', error);
    res.status(500).send('Error al enviar la orden de compra');
  }
});

module.exports = router;
