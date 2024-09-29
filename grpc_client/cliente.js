const express = require('express');
const path = require('path');
const indexRoutes = require('./routes/index');
const usuariosRoutes = require('./routes/usuarios');
const productoRoutes = require('./routes/productos');
const tiendaRoutes = require('./routes/tiendas');
const ordenDeCompraRoutes = require('./routes/ordenDeCompra'); // Importar la nueva ruta

const app = express();
const port = 3000;

const session = require('express-session');

app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear datos de formularios

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware para pasar la variable global a todas las vistas
app.use((req, res, next) => {
  if (req.session) {
    res.locals.isAuthenticated = req.session.isAuthenticated;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
});

// Configuración para servir archivos estáticos y vistas
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Usar las rutas
app.use('/', indexRoutes);
app.use('/', usuariosRoutes);
app.use('/', productoRoutes);
app.use('/', tiendaRoutes);
app.use('/', ordenDeCompraRoutes); // Usar la nueva ruta

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
