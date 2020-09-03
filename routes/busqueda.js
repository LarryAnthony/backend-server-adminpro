const express = require("express");

const app = express();

const Hospital = require("../models/hospital");
const Medico = require("../models/medico");
const Usuario = require("../models/usuario");

// ===============================
// Búsqueda por colección
// ===============================
app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {
    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, "i");
    let promesa;

    switch (tabla) {
        case "usuarios":
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case "medicos":
            promesa = buscarMedicos(busqueda, regex);
            break;
        case "hospitales":
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "Los tipos de búsqueda solo son: usuarios, medicos y hospitales",
                error: { message: "Tipo de tabla / colección no válida" },
            });
    }
    promesa.then((data) => {
        res.status(200).json({
            ok: true,
            [tabla]: data,
        });
    });
});

// ===============================
// Búsqueda general
// ===============================
app.get("/todo/:busqueda", (req, res, next) => {
    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex),
    ]).then((respuestas) => {
        res.status(200).json({
            ok: true,
            Hospitales: respuestas[0],
            Médicos: respuestas[1],
            Usuarios: respuestas[2],
        });
    });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales", err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .populate("hospital", "nombre")
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos", err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, "nombre email role")
            .or([{ usuario: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar usuarios", err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;