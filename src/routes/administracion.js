const router = require("express").Router();
const path = require("path");
const passport = require('passport');
const usersDB = require('../models/users')
const formulariosDB = require('../models/formularios')
const franquiciaDB = require('../models/franquicia')
const resultadosDB = require('../models/resultados')
const { isAuthenticated } = require("../helpers/auth");


router.get('/', async(req, res) => {
    res.redirect("/iniciar-sesion")
})

router.get('/home', isAuthenticated, async(req, res) => {

    res.render('admin/inicio')
})

router.get('/iniciar-sesion', async(req, res) => {
    res.render('login/sign-in', {
        layout: "sign-in"
    })
})

router.post("/sign-in", passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true
}));

router.get('/registro-usuarios', isAuthenticated,async(req, res) => {
    res.render('login/register', {
        layout: "sign-in"
    })
})

router.get('/log-out', (req, res) => {
    req.logOut();
    res.redirect('/iniciar-sesion')
})

router.get('/registrar-usuarios', isAuthenticated, (req, res) => {
    res.render('admin/registro/usuarios')
})

router.post('/registrar-nuevo-usuario', isAuthenticated, async(req, res) => {
    let { Nombres, Apellidos, Cedula, email, emailConfirm, password, passwordConfirm } = req.body
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
        res.render('admin/registro/usuarios', {
            Nombres,
            Apellidos,
            Cedula,
            email,
            emailConfirm,
            password,
            passwordConfirm,
            errors
        })

    } else {
        email = email.toLowerCase()
        let nuevoUsuario = new usersDB({
            Nombres,
            Apellidos,
            Cedula,
            email,
            password,
        })
        nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
        nuevoUsuario.save()
        req.flash("success", "Usuario registrado correctamente.")
        res.redirect("/registrar-usuarios")
    }
})

router.get('/registrar-formulario', isAuthenticated, async (req, res) =>{
    try{
        res.render('admin/registro/formulario')
    }catch(err){
        console.log(err)
        next(err)
    }
} )


router.get('/formularios', isAuthenticated,async (req, res, next) =>{
    try {
        const formularios = await formulariosDB.find().lean()
        res.render('admin/formularios/directorio', {formularios})
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.get('/editar-formulario/:id', isAuthenticated,async (req, res, next) =>{
    try {
        let formulario = await formulariosDB.findById(req.params.id).lean()

        formulario = {
            Titulo: formulario.Titulo,
            FechaCreacion: formulario.FechaCreacion,
            Usuario: formulario.Usuario,
            UltimaModificacion: formulario.UltimaModificacion,
            PaginasTotales: formulario.PaginasTotales,
            Estado: formulario.Estado,
            _id: formulario._id,
            Paginas: formulario.Paginas.map((data2) =>{
                return {
                    TituloPagina: data2.TituloPagina,
                    Pagina: data2.Pagina,
                    Descripcion: data2.Descripcion,
                    _id: data2._id,
                    _idFormulario : formulario._id,
                    Inputs: data2.Inputs.map((data3) =>{
                        let opcional = "required"
                        let checkbox = false
                        let file = false
                        let textarea = false
                        let normal = false
                        if(data3.Tipo == "checkbox"){
                            checkbox = true
                        } else if(data3.Tipo == "file"){
                            file = true
                        }else if(data3.Tipo == "textarea"){
                            textarea = true
                        }else{
                            normal = true
                        }

                        if(data3.Opcional == "Si"){
                            opcional = ""
                        }

                        if(data3.Espacio == "1 Columna"){
                            data3.Espacio = "col-sm-12"
                        }else if(data3.Espacio == "2 Columnas"){
                            data3.Espacio = "col-sm-6"
                        }else if(data3.Espacio == "3 Columnas"){
                            data3.Espacio = "col-sm-4"
                        }else if(data3.Espacio == "4 Columnas"){
                            data3.Espacio = "col-sm-3"
                        }
                        let dataReturn = {
                            Nombre: data3.Nombre,
                            Tipo: data3.Tipo,
                            Opcional: opcional,
                            Espacio: data3.Espacio,
                            checkbox: checkbox,
                            file: file,
                            textarea: textarea,
                            normal: normal,
                        }

                        return dataReturn
                    }),
                }
            }),
        }

        res.render('admin/formularios/editar', {formulario})

    }catch(err){
        console.log(err)
        next(err)
    }
})


router.get('/demo-formulario/:id', async (req, res, next) =>{
    try {
        let formulario = {
            _id : req.params.id,
        }
        let Validacionformulario = await formulariosDB.findById(formulario._id).lean()
        if(!Validacionformulario){
            throw new Error("No se encontro el formulario")
        }

        res.render('admin/formularios/demo', {layout: false, formulario})
    }catch(err){
        res.render('404', {layout: false})
    }
})


router.get('/registrar-franquicia', isAuthenticated,async (req, res, next) =>{
    try {
        res.render('admin/registro/franquicia')
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.get('/franquicias', isAuthenticated, async (req, res, next) =>{
    try {
        const franquicias = await franquiciaDB.find().lean()
        res.render('admin/franquicias/directorio', {franquicias})
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.get('/formulario-externo/:id', async (req, res, next) =>{
    try {
        let formulario = {
            _id : req.params.id.split(":")[0],
        }
        let validacion = await formulariosDB.findById(formulario._id).lean()
        let sucursal = req.params.id.split(":")[1]
        let franquicia = await franquiciaDB.findById(sucursal).lean()
        if(!validacion || !franquicia){
            throw new Error("No se encontro el formulario")
        } 
        res.render('admin/formularios/formulario-externo',{
            layout: false,
            formulario,
            sucursal
        })
       

    }catch(err){
        res.render('404', {layout: false})
    }
})

router.get('/usuarios', async (req, res, next) =>{
    try {
        let usuarios = await usersDB.find().lean()
        res.render('admin/usuarios/directorio', {usuarios})
    }catch(err){
        console.log(err)
    }
})

router.get('/editar-usuario/:id', async (req, res, next) => {
    try {
        let usuario = await usersDB.findById(req.params.id).lean()
        res.render('admin/usuarios/editar', {usuario})
    }catch(err){
        console.log(err)
    }
})


router.get('/editar-franquicia/:id', async (req, res, next) =>{
    try {
        let franquicia = await franquiciaDB.findById(req.params.id).lean()

        res.render('admin/franquicias/editar', {franquicia})

    }catch(err){
        console.log(err)
    }
})

router.get('/resultados', async (req, res, next) =>{
    try {
        let resultados = await resultadosDB.find().lean()
        res.render('admin/resultados/directorio', {resultados})
    }catch(err){
        console.log(err)
        next(err)
    }
})


router.get('/ver-informacion-resultados/:id', async (req, res, next) =>{
    try {
        let resultado = await resultadosDB.findById(req.params.id).lean()
        let formulario = await formulariosDB.findById(resultado._idFormulario).lean()
        let inputsFormulario = []
        formulario.Paginas.map((data) =>{
            inputsFormulario = [...inputsFormulario, ...data.Inputs]
        })
        let orden = 1
        if(resultado.OrdenActualizado == false){
            for(i=0; i< inputsFormulario.length; i++){
                let input = inputsFormulario[i]
                resultado.Inputs.map((data) =>{
                    if(data.Campo == input._id){
                        data.Orden = orden
                        orden++
                    }
                })
            }
            let OrdenActualizado = true
            await resultadosDB.findByIdAndUpdate(resultado._id,{
                OrdenActualizado,
                Inputs: resultado.Inputs
            })
        }

        resultado.Inputs = resultado.Inputs.map((data, index) =>{
            if(data.Valor == "true"){
                data.Valor = "Si"
            }
            if(data.Valor == "false"){
                data.Valor = "Si"
            }
            return data
        })

        resultado.Inputs.sort((a, b) => {
            return b.Orden - a.Orden
        })


        res.render('admin/resultados/ver', {resultado})
    }catch(err){
        console.log(err)
        next(err)
    }
})
module.exports = router