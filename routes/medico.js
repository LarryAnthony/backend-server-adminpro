const express = require("express");
const app = express();
const mdAutenticacion = require("../middlewares/autenticacion");
const Medico = require("../models/medico");

// ==========================================
// Obtener todos los médicos
// ==========================================

app.get("/", (req, res, next) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .populate("hospital")
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "No se puede obtener los medicos",
                    err: {
                        mensaje: "No se puede obtener los medicos",
                    },
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medico: medicos,
                });
            });
        });
});

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
    });
    medico.save((err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al crear médico",
                errors: {
                    mensaje: "Error al crear médico",
                },
            });
        }
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoDB,
        });
    });
});

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al actualizar médico",
                errors: {
                    mensaje: "Error al actualizar médico",
                },
            });
        }
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.img = body.img;
        medicoDB.usuario = req.usuario._id;
        medicoDB.hospital = body.hospital;

        medicoDB.save((err, medicoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err,
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoDB,
            });
        });
    });
});

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar médico",
                errors: err,
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El médico no existe",
                errors: { message: "El médico no existe" },
            });
        }
        res.status(201).json({
            ok: true,
            usuario: medicoBorrado,
        });
    });
});

module.exports = app;