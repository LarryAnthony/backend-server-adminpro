const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
let rolesValidos = {
    values: ["ADMIN_ROLE", "USER_ROLE"],
    message: "{VALUE} no es un rol permitido",
};

let Schema = mongoose.Schema;
let usuarioSchema = new Schema({
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    email: {
        type: String,
        unique: true,
        required: [true, "El email es necesario"],
    },
    password: {
        type: String,
        unique: false,
        required: [true, "La contraseña es necesario"],
    },
    img: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: true,
        default: "USER_ROLE",
        emun: rolesValidos,
    },
});

usuarioSchema.plugin(uniqueValidator, { message: "{PATH} debe ser único" });

module.exports = mongoose.model("Usuario", usuarioSchema);