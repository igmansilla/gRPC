const express = require("express");
const router = express.Router();
const { tiendaClient } = require("../grpcClient");

// Ruta para manejar la creación de tiendas
router.post(
  "/createTienda",
  express.json(), // Cambiar a express.json() para manejar JSON
  (req, res) => {
    const tienda = {
      codigo: req.body?.codigo ?? "",
      direccion: req.body?.direccion ?? "",
      ciudad: req.body?.ciudad ?? "",
      provincia: req.body?.provincia ?? "",
      habilitada: req.body?.habilitada === "true",
      producto_ids: req.body?.producto_ids
        ? req.body.producto_ids.map((id) => parseInt(id))
        : [],
    };

    tiendaClient.CreateTienda(tienda, (error, response) => {
      if (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error: " + error.message }); // Cambiar a JSON
      }
      return res
        .status(200)
        .json({ message: "Tienda creada", tienda: response }); // Cambiar a JSON
    });
  }
);

// Ruta para obtener una tienda por código
router.get("/getTienda/:codigo", (req, res) => {
  const request = { codigo: req.params.codigo };

  tiendaClient.GetTienda(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
        usuario: null,
        producto: null,
        tienda: null,
      });
    } else {
      res.render("index", {
        message: "Tienda obtenida",
        usuario: null,
        producto: null,
        tienda: response,
      });
    }
  });
});

// Ruta para actualizar una tienda
router.put(
  "/updateTienda/:codigo",
  express.json(), // Cambiar a express.json() para manejar JSON
  (req, res) => {
    const tienda = {
      codigo: req.params.codigo, // Obtener el código de los parámetros de la URL
      direccion: req.body.direccion,
      ciudad: req.body.ciudad,
      provincia: req.body.provincia,
      habilitada: req.body.habilitada === "true",
      producto_ids: req.body.producto_ids || [], // Asignar un array vacío si no se proporciona
    };

    tiendaClient.UpdateTienda(tienda, (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({
          message: "Error: " + error.message,
        });
      } else {
        res.json({
          message: "Tienda actualizada",
          tienda: response,
        });
      }
    });
  }
);

// Ruta para eliminar una tienda
router.delete(
  "/deleteTienda/:codigo",
  (req, res) => {
    const codigo = req.params.codigo; // Obtener el código de los parámetros de la URL
    const request = { codigo };

    tiendaClient.DeleteTienda(request, (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({
          message: "Error: " + error.message,
        });
      } else {
        res.json({
          message: "Tienda eliminada",
          codigo: request.codigo,
        });
      }
    });
  }
);


// Ruta para listar todas las tiendas
router.get("/listTiendas", (req, res) => {
  tiendaClient.ListTiendas({}, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    } else {
      res
        .status(200)
        .json({ message: "Tiendas obtenidas", tiendas: response.tiendas });
    }
  });
});

module.exports = router;
