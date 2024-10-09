const express = require("express");
const router = express.Router();
const {
  run: kafkaProducerRun,
  runRecepcion,
} = require("../kafka/kafka-producer");
const { ordenes, despachos } = require("../kafka/kafka-consumer"); 

router.post("/orden-de-compra", async (req, res) => {
  const ordenDeCompra = req.body; 

  try {
    await kafkaProducerRun(ordenDeCompra);

    res.status(200).json({
      ok: true,
      message: "Orden de compra enviada a Kafka correctamente",
    });
  } catch (error) {
    console.error("Error enviando la orden a Kafka:", error);

    res
      .status(500)
      .json({ ok: false, message: "Error al enviar la orden de compra" });
  }
});

router.get("/solicitudes", (req, res) => {
  res.status(200).json(ordenes);
});

router.get("/despachos", (req, res) => {
  res.status(200).json(despachos);
});

router.post("/orden-recibida", async (req, res) => {
  const { orden_id, despacho_id } = req.body; 

  try {
    await runRecepcion(orden_id, despacho_id);

    res.status(200).json({
      ok: true,
      message: "Orden marcada como recibida correctamente",
    });
  } catch (error) {
    console.error("Error al marcar la orden como recibida:", error);

    res
      .status(500)
      .json({ ok: false, message: "Error al marcar la orden como recibida" });
  }
});

module.exports = router;
