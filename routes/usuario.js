const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const mdAutenticacion = require("../middlewares/autenticacion");
const Usuario = require("../models/usuario");

// ==========================================
// Obtener todos los usuarios
// ==========================================

app.get("/", (req, res, next) => {
    Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error en Base de datos al cargar usuarios",
                errors: err,
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios,
        });
    });
});

// ==========================================
// Actualizar un usuario
// ==========================================

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    let body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el ID " + id + " no existe",
                errors: {
                    message: "No existe el usuario con ese id",
                },
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err,
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
            });
        });
    });
});

// ==========================================
// Crear un nuevo usuario
// ==========================================

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password),
        img: body.img,
        role: body.role,
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err,
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario,
        });
    });
});

// ==========================================
// Borras usuario por id
// ==========================================

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar usuario",
                errors: err,
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario no existe",
                errors: { message: "El usuario no existe" },
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado,
        });
    });
});

module.exports = app;