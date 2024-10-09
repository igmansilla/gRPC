const express = require("express");
const router = express.Router();
const { productoTiendaClient } = require("../grpcClient");

router.post(
  "/createProductoTienda",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const productoTienda = {
      id: parseInt(req.body.id),
      producto_id: parseInt(req.body.producto_id),
      tienda_id: req.body.tienda_id,
      color: req.body.color,
      talle: req.body.talle,
      cantidad: parseInt(req.body.cantidad),
    };

    productoTiendaClient.CreateProductoTienda(productoTienda, (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.render("index", {
          message: "Error: " + error.message,
          productoTienda: null,
        });
      } else {
        res.render("index", {
          message: "ProductoTienda creado: " + response.id,
          productoTienda: response,
        });
      }
    });
  }
);

router.get("/getProductoTienda/:id", (req, res) => {
  const request = { id: parseInt(req.params.id) };

  productoTiendaClient.GetProductoTienda(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
        productoTienda: null,
      });
    } else {
      res.render("index", {
        message: "ProductoTienda obtenido",
        productoTienda: response,
      });
    }
  });
});

router.post("/updateProductoTienda", express.urlencoded({ extended: true }), (req, res) => {
  const productoTienda = {
    id: parseInt(req.body.id),
    producto_id: parseInt(req.body.producto_id),
    tienda_id: req.body.tienda_id,
    color: req.body.color,
    talle: req.body.talle,
    cantidad: parseInt(req.body.cantidad),
  };

  productoTiendaClient.UpdateProductoTienda(productoTienda, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
        productoTienda: null,
      });
    } else {
      res.render("index", {
        message: "ProductoTienda actualizado: " + response.id,
        productoTienda: response,
      });
    }
  });
});

router.post("/deleteProductoTienda", express.urlencoded({ extended: true }), (req, res) => {
  const request = { id: parseInt(req.body.id) };

  productoTiendaClient.DeleteProductoTienda(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
        productoTienda: null,
      });
    } else {
      res.render("index", {
        message: "ProductoTienda eliminado: " + request.id,
        productoTienda: null,
      });
    }
  });
});

router.get("/listProductoTiendas", (req, res) => {
  productoTiendaClient.ListProductoTiendas({}, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
        productoTiendas: null,
      });
    } else {
      res.render("index", {
        message: "ProductoTiendas obtenidos",
        productoTiendas: response.productos,
      });
    }
  });
});

module.exports = router;
