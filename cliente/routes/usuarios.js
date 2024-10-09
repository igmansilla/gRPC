const express = require("express");
const router = express.Router();
const { usuarioClient } = require("../grpcClient");


const checkAuthentication = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    res.redirect("/index"); 
  } else {
    next(); 
  }
};


router.post(
  "/createUsuario",
  express.urlencoded({ extended: true }),
  checkAuthentication, 
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
        res.redirect("/home"); 
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
      req.session.isAuthenticated = true; 
      req.session.save(() => {
        
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


router.get("/home", (req, res) => {
  console.log("Usuario autenticado:", req.session.isAuthenticated);
  if (req.session.isAuthenticated) {
    res.render("home"); 
  } else {
    res.redirect("index"); 
  }
});


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


router.put(
  "/updateUsuario/:id",
  express.json(),
  checkAuthentication,
  (req, res) => {
    const usuario = {
      id: parseInt(req.params.id), 
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


router.delete("/deleteUsuario/:id", checkAuthentication, (req, res) => {
  const request = { id: parseInt(req.params.id) }; 

  usuarioClient.DeleteUsuario(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error: " + error.message });
    }
    return res.json({ message: "Usuario eliminado", id: request.id });
  });
});


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
      usuarios: response.usuarios || [], 
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.isAuthenticated = false; 
  res.render("index"); 
});

module.exports = router;
