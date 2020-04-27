// requires
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Inicializar variables
var app = express();

// Body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
const appRoutes = require("./routes/app");
const usuarioRoutes = require("./routes/usuario");
const loginRoutes = require("./routes/login");
const hospitalRoutes = require("./routes/hospital");
const medicoRoutes = require("./routes/medico");
const busquedaRoutes = require("./routes/busqueda");
const uploadRoutes = require("./routes/upload");
const imagenesRoutes = require("./routes/imagenes");

// Conexión a la base de datos

mongoose.connection.openUri(
    "mongodb://localhost:27017/hospitalDB", {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, res) => {
        if (err) throw err;
        console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");
    }
);

// Server index config - para visualizar oimagenes en la web
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/imagen", imagenesRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log(
        "Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m",
        "online"
    );
});