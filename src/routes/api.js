const router = require('express').Router()
const path = require("path");
const passport = require('passport');
const usersDB = require('../models/users')
const formulariosDB = require('../models/formularios')
const resultadosDB = require('../models/resultados')
const franquiciaDB = require('../models/franquicia')
const { isAuthenticated } = require("../helpers/auth");
const fs = require('fs');
const moment = require('moment');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


router.post('/api/registrar-formulario', async (req, res, next) =>{
    try {
        let {Titulo, Paginas } = req.body
        let validacionFormulario = await formulariosDB.findOne({Titulo: Titulo})
        if(validacionFormulario){
            await formulariosDB.findOneAndUpdate({Titulo: Titulo}, {Paginas: Paginas})
        }else{
            let FechaCreacion = moment().format('DD/MM/YYYY')
            let Usuario = `${req.user.Nombres} ${req.user.Apellidos}`
            let formulario = new formulariosDB({ 
                Titulo, 
                FechaCreacion,
                Usuario,
                PaginasTotales: Paginas.length,
                Paginas
            }) 
            await formulario.save()
        }
        let data = {
            ok: true
        }
        res.send(JSON.stringify(data))
    }catch(err){
        console.log(err) 
        let data = {
            ok: false
        }

        res.send(JSOB.stringify(data))
    }
})


router.post('/api/formulario-pagina/:id', async (req, res, next) =>{
    try{
        let {idPagina} = req.body
        let formulario = await formulariosDB.findById(req.params.id)
        let pagina = formulario.Paginas.find((data) => data._id == idPagina)
        let data = {
            ok: true,
            pagina
        }
        res.send(JSON.stringify(data))
    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})

router.get('/api/solicitar-formulario/:id', async (req, res, next) =>{
    try {   
        console.log(req.params.id)
        let formulario = await formulariosDB.findById(req.params.id)
        let data = {
            ok: true,
            formulario
        }
        res.send(JSON.stringify(data))

    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})


router.delete('/api/eliminar-pagina/:id', async (req, res, next) =>{
    try {
        let {idPagina} = req.body
        console.log(idPagina)
        let formulario = await formulariosDB.findById(req.params.id)
        let pagina = formulario.Paginas.find((data) => data._id == idPagina)
        let index = formulario.Paginas.indexOf(pagina)
        formulario.Paginas.splice(index, 1)
        formulario.Paginas.forEach((data, i) =>{
            if(i == index){
                data.Pagina = data.Pagina - 1
            }
            if(i > index){
                data.Pagina = data.Pagina - 1
            }
        })
        formulario.PaginasTotales = formulario.Paginas.length
        await formulario.save()
        let data = {
            ok: true
        }
        res.send(JSON.stringify(data))
        
    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})


router.post('/api/crear-pagina', async (req, res, next) =>{
    try {
        let { TituloPagina, Descripcion, _idFormulario, Pagina, Inputs} = req.body

        console.log(req.body)

        let formulario = await formulariosDB.findById(_idFormulario)
        let pagina = {
            TituloPagina,
            Descripcion,
            Pagina,
            Inputs
        }
        let Paginas = formulario.Paginas
        let existe = false
        Paginas = Paginas.map((data) =>{
            if(data.Pagina == pagina.Pagina){
                data = pagina
                existe = true
             }
            return data
        })

        if(!existe){
            Paginas.push(pagina)
        }

        Paginas = Paginas.sort((a, b) => a.Pagina - b.Pagina)
        formulario.Paginas = Paginas
        formulario.PaginasTotales = formulario.Paginas.length
        await formulario.save()
        let data = {
            ok: true
        }
        res.send(JSON.stringify(data))

    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})

router.get('/api/solicitar-pagina/:id', async (req, res, next) =>{
    try {
        let _idFormulario = req.params.id.split(':')[0]
        let pagina = req.params.id.split(':')[1]
        let formulario = await formulariosDB.findById(_idFormulario)
        let Pagina = formulario.Paginas.find((data) => data.Pagina == pagina)
        let ultimaPagina = false
        if(formulario.PaginasTotales == pagina){
            ultimaPagina = true
        }
        let data = {
            ok: true,
            Pagina, 
            paginasTotales : formulario.PaginasTotales,
            ultimaPagina
        }

        res.send(JSON.stringify(data))

    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})


router.post('/api/insertar-formulario', async (req, res, next) =>{
    try {
        let {files, inputs, _idFormulario, _idFranquicia, paypal} = req.body
        let franquicia = {
            _id: "Principal",
            Nombre: "Principal"
        }
        if(_idFranquicia){
            franquicia = await franquiciaDB.findById(_idFranquicia).select('Nombre').lean()
        }
        let formulario = await formulariosDB.findById(_idFormulario).lean()
        let inputsFormulario = []
        let inputsFile = []
        for(i=0; i< formulario.Paginas.length; i++){
            let pagina = formulario.Paginas[i]
            for(j=0; j<pagina.Inputs.length; j++){
                let input = pagina.Inputs[j]
                if(input.Tipo == 'file'){
                    input.Pagina = pagina.Pagina
                    input.TituloPagina = pagina.TituloPagina
                    inputsFile.push(input)
                }else{
                    input.Pagina = pagina.Pagina
                    input.TituloPagina = pagina.TituloPagina
                    inputsFormulario.push(input)
                }
            }
        }
        
        //guardar archivos
        for(i=0; i<files.length; i++){
            let file = files[i]
            for(j=0; j < file.valor.length; j++){
                let valor = file.valor[j]
                let formato = ""
                if(valor.includes('data:image/jpeg;base64,')){
                    formato = 'jpeg'
                } else{
                    formato = 'png'
                }
                let base64Data = valor.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                let nombre = Date.now() + Math.random().toString(36).substring(7) + '.' + formato
                let ruta = path.join(__dirname, `../public/uploads/${nombre}`)
                fs.writeFileSync(ruta, base64Data,  {encoding: 'base64'});
                file.valor[j] = `/uploads/${nombre}`
                file.nombre = nombre
            }
        }

        inputsFile = inputsFile.map((data) =>{
            let file = files.find((file) => file.key == data._id)
            if(file){
                data.valor = file.valor
                data.Campo = file.key
            }
            return data
        })

        inputs = inputs.map((data) =>{
            let input = inputsFormulario.find((data2) => data2._id == data.Campo)
            data.Tipo = input.Tipo
            data.Opcional = input.Opcional
            data.Nombre = input.Nombre
            data.Pagina = input.Pagina
            data.TituloPagina = input.TituloPagina
            return data
        }) 
        let fecha = moment().format('DD/MM/YYYY')
        let hora = moment().format('HH:mm:ss')
        let Timestamp = moment().format("YYYYMMDDHHmmss");
        let resultados = new resultadosDB({
            Titulo: formulario.Titulo,
            Fecha: `${fecha} ${hora}`,
            _idFormulario: _idFormulario,
            Franquicia: franquicia.Nombre,
            _idFranquicia: franquicia._id,
            TimeStamp: Timestamp,
            Inputs: inputs,
            paypal,
            InputsFile: inputsFile
        })

        await resultados.save()

        let data = {
            ok: true
        }

        res.send(JSON.stringify(data))

    }catch(err){
        console.log(err)
        let data = {
            ok: false
        }

        res.send(JSON.stringify(data))
    }
})

router.post('/api/registrar-nueva-franquicia', async (req, res, next) =>{
    let {Responsable, Nombre, PaginaWeb} = req.body
    let franquicia = new franquiciaDB({
        Responsable,
        Nombre,
        PaginaWeb
    })

    await franquicia.save()
    req.flash('success', 'Franquicia registrada correctamente')
    res.redirect('/registrar-franquicia')


})

router.get('/api/solicitar-formularios', async (req, res, next) =>{
    let formularios = await formulariosDB.find().select('Titulo').lean()
    let data = {
        ok: true,
        formularios
    }
    res.send(JSON.stringify(data))
})

router.post('/api/actualizar-usuario/:id', async (req, res, next) =>{
    try {
    let { Nombres, Apellidos, Cedula, email, emailConfirm, password, passwordConfirm } = req.body
    let usuario = await usersDB.findById(req.params.id)
    let errors = []
    if (!Nombres || Nombres == "" || Nombres == 0) {
        errors.push({ text: 'El campo "Nombres" no puede estar vacío.' })
    }
    if (!Apellidos || Apellidos == "" || Apellidos == 0) {
        errors.push({ text: 'El campo "Apellidos" no puede estar vacío.' })
    }
    if (!Cedula || Cedula == "" || Cedula == 0) {
        errors.push({ text: 'El campo "Cedula" no puede estar vacío.' })
    }
    if (!email || email == "" || email == 0) {
        errors.push({ text: 'El campo "Correo electronico" no puede estar vacío.' })
    }
    if (!emailConfirm || emailConfirm == "" || emailConfirm == 0) {
        errors.push({ text: 'El campo "Confirmar correo electronico" no puede estar vacío.' })
    }
    if (!password || password == "" || password == 0) {
        errors.push({ text: 'El campo "Contraseña" no puede estar vacío.' })
    }
    if (password.length < 7) {
        errors.push({ text: 'La contraseña debe incluir minimo 7 caracteres.' })
    }
    if (!passwordConfirm || passwordConfirm == "" || passwordConfirm == 0) {
        errors.push({ text: 'El campo "Confirmar contraseña" no puede estar vacío.' })
    }
    if (email != emailConfirm) {
        errors.push({ text: 'Los correos ingresados no coinciden.' })
    }
    if (password != passwordConfirm) {
        errors.push({ text: 'Las contraseñas ingresadas no coinciden.' })
    }
    if (errors.length > 0) {
        res.render('admin/registro/usuarios', {usuario})

    } else {
        if(usuario.password != password){
            let passwordEncrypt = new usersDB()
            password = await passwordEncrypt.encryptPassword(password)
        }
        await usersDB.findByIdAndUpdate(req.params.id, { Nombres, Apellidos, Cedula, email, password })

        req.flash("success", "Usuario actualizado correctamente.")
        res.redirect(`/editar-usuario/${req.params.id}`)
    }
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.post('/api/editar-franquicia/:id', async (req, res, next) =>{
    try {
        await franquiciaDB.findByIdAndUpdate(req.params.id,{
            Responsable: req.body.Responsable,
            Nombre: req.body.Nombre,
            PaginaWeb: req.body.PaginaWeb
        })

        req.flash('success', 'Franquicia actualizada correctamente')
        res.redirect(`/editar-franquicia/${req.params.id}`)

    }catch(err){    
        console.log(err)
        next(err)
    }
})

router.get('/api/eliminar-usuario/:id', async (req, res, next) =>{
    await usersDB.findByIdAndDelete(req.params.id)
    req.flash('success', 'Usuario eliminado correctamente')
    res.redirect('/usuarios')
})


router.get('/api/eliminar-franquicia/:id', async (req, res, next) =>{
    await franquiciaDB.findByIdAndDelete(req.params.id)
    req.flash('success', 'Franquicia eliminada correctamente')
    res.redirect('/franquicias')
})


router.get('/api/eliminar-formulario/:id', async (req, res, next) =>{
    await formulariosDB.findByIdAndDelete(req.params.id)
    req.flash('success', 'Formulario eliminado correctamente')
    res.redirect('/formularios')
})

router.get('/api/descargar-imagen/uploads/:id', async (req, res, next) =>{
    try {   

        let ruta = path.join(__dirname, `../public/uploads/${req.params.id}`)

        download(ruta, 'uploads', function(err){
            if(err){
                console.log(err)
            }
        })


    }catch(err){
        console.log(err)
    }
})

router.get('/api/resultados-pendientes', async (req, res, next) =>{
    try{
        let resultados = await resultadosDB.find({Estado: 'Pendiente'}).countDocuments()
        res.send(JSON.stringify(resultados))
    }catch(err){    
        console.log(err)
    }
})


router.get('/api/solicitar-info-paypal/:id', async (req, res, next) =>{
    try {
        let resultado = await resultadosDB.findById(req.params.id)

        res.send(JSON.stringify(resultado.paypal))

    }catch(err){
        console.log(err)
    }
})


router.put('/api/cambiar-estado-resultados/:id', async (req, res, next) =>{
    try{
        let {estado} = req.body

        await resultadosDB.findByIdAndUpdate(req.params.id, {Estado: estado})
        
        let data = {
            ok: true,
        }

        res.send(JSON.stringify(data))

    }catch(err){
        console.log(err)
    }
})


module.exports = router