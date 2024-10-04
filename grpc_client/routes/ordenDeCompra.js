const express = require("express");
const router = express.Router();
const {
  run: kafkaProducerRun,
  runRecepcion,
} = require("../kafka/kafka-producer");
const { ordenes, despachos } = require("../kafka/kafka-consumer"); // Importar la lista de órdenes

// Definir la ruta para manejar las órdenes de compra
router.post("/orden-de-compra", async (req, res) => {
  const ordenDeCompra = req.body; // Obtener los datos de la orden de compra del cuerpo de la solicitud

  try {
    // Enviar la orden de compra a Kafka usando el productor
    await kafkaProducerRun(ordenDeCompra);

    // Respuesta JSON de éxito
    res.status(200).json({
      ok: true,
      message: "Orden de compra enviada a Kafka correctamente",
    });
  } catch (error) {
    console.error("Error enviando la orden a Kafka:", error);

    // Respuesta JSON de error
    res
      .status(500)
      .json({ ok: false, message: "Error al enviar la orden de compra" });
  }
});

// Ruta para obtener las órdenes de compra recibidas
router.get("/solicitudes", (req, res) => {
  res.status(200).json(ordenes);
});

// Ruta para obtener los despachos recibidos
router.get("/despachos", (req, res) => {
  res.status(200).json(despachos);
});

// Ruta para marcar una orden como recibida
router.post("/orden-recibida", async (req, res) => {
  const { orden_id, despacho_id } = req.body; // Obtener los datos de la orden recibida del cuerpo de la solicitud

  try {
    // Enviar el evento a Kafka
    await runRecepcion(orden_id, despacho_id);

    // Respuesta JSON de éxito
    res.status(200).json({
      ok: true,
      message: "Orden marcada como recibida correctamente",
    });
  } catch (error) {
    console.error("Error al marcar la orden como recibida:", error);

    // Respuesta JSON de error
    res
      .status(500)
      .json({ ok: false, message: "Error al marcar la orden como recibida" });
  }
});

module.exports = router;
