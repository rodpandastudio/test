const mongoose = require("mongoose");
const { Schema } = mongoose;


const franquicias = new Schema({
  Nombre: { type: String, require: true },
  Responsable: { type: String, require: true },
  PaginaWeb: { type: String, require: true },
});

module.exports = mongoose.model("franquicias", franquicias);
