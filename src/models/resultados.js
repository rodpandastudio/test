const mongoose = require("mongoose");
const { Schema } = mongoose;

const resultados = new Schema({
  Titulo: { type: String, require: true },
  Fecha: { type: String, require: true },
  _idFormulario : { type: String, require: true },
  Franquicia: { type: String, require: true },
  _idFranquicia: { type: String, require: true },
  TimeStamp : { type: String, require: true },
  Estado: { type: String, default:"Pendiente" },
  OrdenActualizado : { type: Boolean, default: false },
  paypal: [{
    button_version: { type: String },
    intent: { type: String },
    orderID: { type: String },
    payerID: { type: String },
    paymentID: { type: String },
    paymentToken: { type: String },
    returnUrl: { type: String },
  }],
  InputsFile: [{
    Nombre : { type: String, require: true },
    Campo : { type: String, require: true },
    Tipo : { type: String, require: true },
    Opcional : { type: String, require: true },
    Pagina : { type: Number, require: true },
    TituloPagina : { type: String, require: true },
    valor : { type: Array, require: true },
  }],
    Inputs: [{
        Campo : { type: String, require: true },
        Valor : { type: String, require: true },
        Tipo : { type: String, require: true },
        Opcional : { type: String, require: true },
        Nombre : { type: String, require: true },
        Orden : { type: String},
        Pagina : { type: Number, require: true },
        TituloPagina : { type: String, require: true },
    }]
});

module.exports = mongoose.model("resultados", resultados);
