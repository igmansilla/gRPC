const express = require('express');
const path = require('path');
const indexRoutes = require('./routes/index');
const usuariosRoutes = require('./routes/usuarios');
const productoRoutes = require('./routes/productos');
const tiendaRoutes = require('./routes/tiendas');
const ordenDeCompraRoutes = require('./routes/ordenDeCompra'); 
const { run: runKafkaConsumer } = require('./kafka/kafka-consumer'); 

const app = express();
const port = 3000;

const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  if (req.session) {
    res.locals.isAuthenticated = req.session.isAuthenticated;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRoutes);
app.use('/', usuariosRoutes);
app.use('/', productoRoutes);
app.use('/', tiendaRoutes);
app.use('/', ordenDeCompraRoutes); 

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  runKafkaConsumer().catch(console.error); 
});

module.exports = app;
