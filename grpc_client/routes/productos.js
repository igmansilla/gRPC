const express = require("express");
const router = express.Router();
const { productoClient } = require("../grpcClient");

// Ruta para manejar la creación de productos
router.post("/createProducto", express.json(), (req, res) => {

  console.log(req.body)

  const producto = {
    id: parseInt(req.body.id) ?? 0, // Asignar 0 si id es null o undefined
    nombre: req.body.nombre ?? "", // Asignar cadena vacía si nombre es null o undefined
    codigo: req.body.codigo ?? "", // Asignar cadena vacía si codigo es null o undefined
    talle: req.body.talle ?? "", // Asignar cadena vacía si talle es null o undefined
    foto: req.body.foto ?? "", // Asignar cadena vacía si foto es null o undefined
    color: req.body.color ?? "", // Asignar cadena vacía si color es null o undefined
    tienda_ids: req.body.tienda_ids
    ? req.body?.tienda_ids?.map((id) => parseInt(id))
    : [], // Asignar array vacío si tienda_ids es null o undefined, o array con el ID si viene como un string sin comas
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

// Ruta para obtener un producto por código
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

// Ruta para actualizar un producto
router.put("/updateProducto/:id", express.json(), (req, res) => {
  const producto = {
    id: parseInt(req.params.id), // Obtener el ID desde la URL
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

// Ruta para eliminar un producto
router.delete("/deleteProducto/:id", (req, res) => {
console.log(req.params.id)

  const request = { id: parseInt(req.params.id) }; // Obtener el ID desde la URL

  productoClient.DeleteProducto(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    } else {
      return res.json({ message: "Producto eliminado", id: request.id });
    }
  });
});

// Ruta para listar todos los productos
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
