const express = require("express");
const app = express();
const mdAutenticacion = require("../middlewares/autenticacion");
const Hospital = require("../models/hospital");

// ==========================================
// Obtener todos los usuarios
// ==========================================

app.get("/", (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "No se puede obtener los hospitales",
                    err: {
                        mensaje: "No se puede obtener los hospitales",
                    },
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospital: hospitales,
                });
            });
        });
});

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
    });
    hospital.save((err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: {
                    mensaje: "Error al crear hospital",
                },
            });
        }
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalDB,
        });
    });
});

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar hospital",
                errors: {
                    mensaje: "Error al actualizar hospital",
                },
            });
        }
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        hospitalDB.nombre = body.nombre;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err,
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalDB,
            });
        });
    });
});

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar hospital",
                errors: err,
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital no existe",
                errors: { message: "El hospital no existe" },
            });
        }
        res.status(201).json({
            ok: true,
            usuario: hospitalBorrado,
        });
    });
});

module.exports = app;