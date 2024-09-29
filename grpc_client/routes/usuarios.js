const express = require("express");
const router = express.Router();
const { usuarioClient } = require("../grpcClient");

// Middleware para comprobar la autenticación
const checkAuthentication = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    res.redirect("/index"); // Redirige a la pantalla de login si no está autenticado
  } else {
    next(); // Continúa con el procesamiento de la ruta
  }
};

// Ruta para manejar la creación de usuarios
router.post(
  "/createUsuario",
  express.urlencoded({ extended: true }),
  checkAuthentication, // Asegúrate de que el usuario esté autenticado
  (req, res) => {
    const usuario = {
      id: parseInt(req.body.id),
      nombreUsuario: req.body.nombreUsuario,
      contrasena: req.body.contrasena,
      tienda_id: req.body.tienda_id,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      habilitado: req.body.habilitado === "true",
    };

    usuarioClient.CreateUsuario(usuario, (error, response) => {
      if (error) {
        console.error("Error:", error);
        res.render("index", {
          message: "Error: " + error.message,
          usuario: null,
          producto: null,
          tienda: null,
        });
      } else {
        res.redirect("/home"); // Redirige a la página de inicio después de crear un usuario
      }
    });
  }
);

router.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  const { nombreUsuario, contrasena } = req.body;

  const usuarioRequest = {
    nombreUsuario,
    contrasena,
  };

  usuarioClient.GetUsuario(usuarioRequest, (error, response) => {
    if (error) {
      console.error("Error:", error);
      res.render("index", {
        message: "Error: " + error.message,
      });
    } else if (
      response &&
      response.nombreUsuario === nombreUsuario &&
      response.contrasena === contrasena
    ) {
      console.log("Login exitoso");
      req.session.isAuthenticated = true; // Establece la autenticación en true
      req.session.save(() => {
        // Asegura que la sesión se guarda antes de redirigir
        res.redirect("/home");
      });
    } else {
      console.log("Usuario o contraseña incorrectos");
      res.render("index", {
        message: "Usuario o contraseña incorrectos",
      });
    }
  });
});

// Ruta para la página de inicio
router.get("/home", (req, res) => {
  console.log("Usuario autenticado:", req.session.isAuthenticated);
  if (req.session.isAuthenticated) {
    res.render("home"); // Muestra la vista de inicio si está autenticado
  } else {
    res.redirect("index"); // Redirige al login si no está autenticado
  }
});

// Ruta para obtener un usuario por ID
router.get("/getUsuario/:id", checkAuthentication, (req, res) => {
  const request = { id: parseInt(req.params.id) };

  usuarioClient.GetUsuario(request, (error, response) => {
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
        message: "Usuario obtenido",
        usuario: response,
        producto: null,
        tienda: null,
      });
    }
  });
});

// Ruta para actualizar un usuario
router.put(
  "/updateUsuario/:id",
  express.json(),
  checkAuthentication,
  (req, res) => {
    const usuario = {
      id: parseInt(req.params.id), // Obtener el ID desde la URL
      nombreUsuario: req.body.nombreUsuario ?? "",
      contrasena: req.body.contrasena ?? "",
      tienda_id: req.body.tienda_id ?? 0,
      nombre: req.body.nombre ?? "",
      apellido: req.body.apellido ?? "",
      habilitado: req.body.habilitado === "true",
    };

    usuarioClient.UpdateUsuario(usuario, (error, response) => {
      if (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error: " + error.message });
      }
      return res.json({ message: "Usuario actualizado", usuario: response });
    });
  }
);

// Ruta para eliminar un usuario
router.delete("/deleteUsuario/:id", checkAuthentication, (req, res) => {
  const request = { id: parseInt(req.params.id) }; // Obtener el ID desde la URL

  usuarioClient.DeleteUsuario(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    }
    return res.json({ message: "Usuario eliminado", id: request.id });
  });
});

// Ruta para listar todos los usuarios
router.get("/listUsuarios", checkAuthentication, (req, res) => {
  usuarioClient.ListUsuarios({}, (error, response) => {
    if (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({
        message: "Error al obtener usuarios: " + error.message,
        usuarios: [],
      });
    }

    res.json({
      message: "Usuarios obtenidos",
      usuarios: response.usuarios || [], // Asegúrate de que sea un array
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.isAuthenticated = false; // Desactiva la autenticación
  res.render("index"); // Redirige al login
});

module.exports = router;
