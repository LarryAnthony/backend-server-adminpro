const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.get("/:tipo/:img", (req, res, next) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImage = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        const pathNoImage = path.resolve(__dirname, "../assets/no-image.png");
        res.sendFile(pathNoImage);
    }
});

module.exports = app;