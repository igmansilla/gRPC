const express = require("express");
const router = express.Router();
const { tiendaClient } = require("../grpcClient");


router.post(
  "/createTienda",
  express.json(), 
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
        return res.status(500).json({ message: "Error: " + error.message }); 
      }
      return res
        .status(200)
        .json({ message: "Tienda creada", tienda: response }); 
    });
  }
);


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


router.put(
  "/updateTienda/:codigo",
  express.json(), 
  (req, res) => {
    const tienda = {
      codigo: req.params.codigo, 
      direccion: req.body.direccion,
      ciudad: req.body.ciudad,
      provincia: req.body.provincia,
      habilitada: req.body.habilitada === "true",
      producto_ids: req.body.producto_ids || [], 
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


router.delete(
  "/deleteTienda/:codigo",
  (req, res) => {
    const codigo = req.params.codigo; 
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
