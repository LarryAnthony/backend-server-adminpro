const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;
const Usuario = require("../models/usuario");

// Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// ===============================
// Login con google
// ===============================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        img: payload.picture,
        email: payload.email,
        google: true,
    };
}
verify().catch(console.error);

app.post("/google", async(req, res) => {
    let token = req.body.token;

    let googleUser = await verify(token).catch((e) => {
        res.status(403).json({
            ok: false,
            mensaje: "Token no válido",
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuarios",
                errors: err,
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su autenticación normal",
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                });
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                });
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                });
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: "Está correcto",
    //     googleUser: googleUser,
    // });
});

// ===============================
// Login normal
// ===============================

app.post("/", (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuarios",
                errors: err,
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                errors: err,
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
                errors: err,
            });
        }

        // Crear token
        usuarioDB.password = ":)";
        let token = jwt.sign({ usuario: usuarioDB }, SEED, {
            expiresIn: 14400,
        });
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
        });
    });
});

module.exports = app;