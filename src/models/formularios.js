const mongoose = require("mongoose");
const { Schema } = mongoose;


const formularios = new Schema({
  Titulo: { type: String, require: true },
  FechaCreacion: { type: String, require: true },
  Usuario: { type: String, require: true },
  UltimaModificacion: { type: String, require: true },
  PaginasTotales: { type: Number, require: true },
  Estado : { type: String, default:"Activo" },
  Paginas : [{
    TituloPagina: { type: String, require: true },
    Pagina : { type: Number, require: true },
    Descripcion: { type: String, require: true },
    Inputs : [{
        Nombre : { type: String, require: true },
        Tipo : { type: String, require: true },
        Opcional : { type: String, require: true },
        Espacio : { type: String, require: true },
    }]
  }]
  
});

module.exports = mongoose.model("formularios", formularios);
