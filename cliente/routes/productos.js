const express = require("express");
const router = express.Router();
const { productoClient } = require("../grpcClient");
const { novedades } = require("../kafka/kafka-consumer");

router.post("/createProducto", express.json(), (req, res) => {

  console.log(req.body)

  const producto = {
    id: parseInt(req.body.id) ?? 0, 
    nombre: req.body.nombre ?? "", 
    codigo: req.body.codigo ?? "", 
    talle: req.body.talle ?? "", 
    foto: req.body.foto ?? "", 
    color: req.body.color ?? "", 
    tienda_ids: req.body.tienda_ids
    ? req.body?.tienda_ids?.map((id) => parseInt(id))
    : [], 
  };
  
  productoClient.CreateProducto(producto, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    } else {
      return res
        .status(201)
        .json({ message: "Producto creado", producto: response });
    }
  });
});


router.get("/getProducto/:codigo", (req, res) => {
  const request = { codigo: req.params.codigo };

  productoClient.GetProducto(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    } else {
      return res.json({ message: "Producto obtenido", producto: response });
    }
  });
});

router.get("/novedades", (req, res) => {
  res.status(200).json(novedades);
});



router.put("/updateProducto/:id", express.json(), (req, res) => {
  const producto = {
    id: parseInt(req.params.id), 
    nombre: req.body.nombre,
    codigo: req.body.codigo,
    talle: req.body.talle,
    foto: req.body.foto,
    color: req.body.color,
    tienda_ids: req.body.tienda_ids.map((id) => parseInt(id)),
  };

  productoClient.UpdateProducto(producto, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    } else {
      return res.json({ message: "Producto actualizado", producto: response });
    }
  });
});


router.delete("/deleteProducto/:id", (req, res) => {
console.log(req.params.id)

  const request = { id: parseInt(req.params.id) }; 

  productoClient.DeleteProducto(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    } else {
      return res.json({ message: "Producto eliminado", id: request.id });
    }
  });
});


router.get("/listProductos", (req, res) => {
  productoClient.ListProductos({}, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener los productos" });
    } else {
      return res.json({ productos: response.productos });
    }
  });
});

module.exports = router;
