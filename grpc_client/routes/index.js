const express = require('express');
const router = express.Router();
const { greeterClient } = require('../grpcClient');

// Ruta para mostrar el formulario
router.get('/', (req, res) => {
  res.render('index', { message: '', usuario: null, producto: null, tienda: null });
});

// Ruta para manejar el formulario y llamar al cliente gRPC para SayHello
router.post('/send', express.urlencoded({ extended: true }), (req, res) => {
  const name = req.body.name;

  greeterClient.SayHello({ name }, (error, response) => {
    if (error) {
      console.error('Error:', error);
      res.render('index', { message: 'Error: ' + error.message, usuario: null, producto: null, tienda: null });
    } else {
      res.render('index', { message: response.message, usuario: null, producto: null, tienda: null });
    }
  });
});

module.exports = router;
