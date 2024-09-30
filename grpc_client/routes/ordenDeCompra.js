const express = require('express');
const router = express.Router();
const { run: kafkaProducerRun } = require('../kafka/kafka-producer');
const { ordenes } = require('../kafka/kafka-consumer'); // Importar la lista de órdenes

// Definir la ruta para manejar las órdenes de compra
router.post('/orden-de-compra', async (req, res) => {
  const ordenDeCompra = req.body;  // Obtener los datos de la orden de compra del cuerpo de la solicitud

  try {
    // Enviar la orden de compra a Kafka usando el productor
    await kafkaProducerRun(ordenDeCompra);
    
    // Respuesta JSON de éxito
    res.status(200).json({ ok: true, message: 'Orden de compra enviada a Kafka correctamente' });
  } catch (error) {
    console.error('Error enviando la orden a Kafka:', error);

    // Respuesta JSON de error
    res.status(500).json({ ok: false, message: 'Error al enviar la orden de compra' });
  }
});

// Ruta para obtener las órdenes de compra recibidas
router.get('/ordenes-de-compra', (req, res) => {
  res.status(200).json(ordenes);
});

module.exports = router;
