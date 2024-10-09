const express = require('express');
const router = express.Router();
const { greeterClient } = require('../grpcClient');

router.get('/', (req, res) => {
  res.render('index', { message: '', usuario: null, producto: null, tienda: null });
});

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
