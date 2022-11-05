    const d = document,
    $btnAnterior = d.getElementById('btnAnterior'),
    $paginaActual = d.getElementById('paginaActual'),
    $btnSiguiente = d.getElementById('btnSiguiente'),
    $insertarPaginas = d.getElementById('insertarPaginas'),
    _idFormulario = $insertarPaginas.dataset._idformulario,
    _idSucursal = $insertarPaginas.dataset._idsucursal;
    
    let paginaActual = 1
    let files = []
    let ultimaPagina = false
    let paginaPago = true

    const solicitarPagina = (_id, pagina, tipo) => {
        fetch(`/api/solicitar-pagina/${_id}:${pagina}`)
        .then((data) =>{
            return data.json()
        }).then((data) =>{
            if(data.ok){
                ultimaPagina = data.ultimaPagina
                cargarPagina(data.Pagina, data.paginasTotales, tipo);
            }else{
                alert('Error')
            }
        })
    }

    solicitarPagina(_idFormulario, paginaActual, 'siguiente');

    const crearPaginaFinal = () =>{
                 let animacion = ""

        animacion = "animate__animated animate__slideInRight"

     
        let card= `
              <div class="card ${animacion}" style="width:75vw; margin-top: 80px; margin-left:12%; margin-right: 12%; border-radius: 30px !important; ">
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            <h2 class="text-center">DATOS REGISTRADOS CORRECTAMENTE</h2>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-sm-6">
                            <div class="row">
                                <div class="col-sm-2"></div>
                                <div class="col-sm-10 col-12">
                                    <img src="/images/final.jpg" alt="" width="450px" class="img-fluid" style="border-radius: 30px !important; " >
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6" style="margin-top: 50px;">
                            <div class="row">
                                <div class="col-sm-10 col-12 text-center">
                                    <h1>Muchas Gracias!</h1>
                                    <p class="h2">Hemos recibido toda la información del formulario</p> <br>
                                    <p class="h2">No dudes en llamarnos a través de nuestro servicio de atención al cliente via Whatsapp por el número (954) 540-5754</p>
                                </div>
                                <div class="col-sm-2"></div>
                                <div class="col-sm-12 mt-4">
                                    <a href="https://api.whatsapp.com/send?phone=19545405754" 
                                    target="_blank" class="btn btn-success btn-block" style="border-radius: 30px !important; font-size: 20px; font-weight: bold; "> <i class="fab fa-whatsapp"></i> Whatsapp</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="outside">
                    <div class="row">
                        <div class="col-12  col-sm-12">
                            <a class="btn btn-inmigracion w-100" id="btnSiguiente" style="border-radius: 30px !important;" href="https://inmigracioninteligente.com/">REGRESAR AL INICIO</a>
                        </div>
                    </div>
                </div>
            </div>
        `
        $insertarPaginas.firstElementChild.classList.remove("animate__slideInRight")
        $insertarPaginas.firstElementChild.classList.remove("animate__slideInLeft")
        $insertarPaginas.firstElementChild.classList.add('animate__animated', 'animate__bounceOutLeft')
        setTimeout(() => {
            $insertarPaginas.firstElementChild.remove()
            $insertarPaginas.innerHTML = card
         }, 800);

    }

    enviarDatos = (paypal) =>{
        //una vez se hayan enviado todos los datos cargamos ultima pagina
        let localStorage = window.localStorage
        let inputsEnviar = []
        for (i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if(key != '__paypal_storage__'){
                let value = localStorage.getItem(key);
                let valor = JSON.parse(value)

                let subdata = {
                    Campo: key,
                    Valor: valor.valor,
                }
                inputsEnviar.push(subdata)
            }
        }
        let dataEnvio = {
            _idFormulario: _idFormulario,
            inputs: inputsEnviar,
            _idFranquicia: _idSucursal,
            paypal,
            files: files
        }


        fetch('/api/insertar-formulario', {
            method: 'POST',
            body: JSON.stringify(dataEnvio),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((data) =>{
            return data.json()
        }).then((data) =>{
            if(data.ok){
                //borrar localstorage 
                localStorage.clear();

                crearPaginaFinal()    
            }else{
                alert('Error')
            }
        })

    
    }

    crearPaginaPago = () =>{
         let animacion = ""

        animacion = "animate__animated animate__slideInRight"

     
        let card= `
            <div class="card ${animacion}" style=" margin-top: 100px; margin-left:50px; margin-right: 50px; border-radius: 30px !important; ">
                <div class="card-body">
                   <div class="row">
                        <div class="col-12">
                            <h3 class="text-center">PAGO</h3>
                        </div>
                        <div class="col-12" id="insertarBtnPaypal">        

                        </div>        
                   </div>
                </div>
                <div class="outside">
                    <div class="row">
                        <div class="col-6 col-sm-6">
                            <button class="btn btn-secondary w-100" id="btnAnterior" style="border-radius: 30px !important; font-size:14px">REGRESAR</button>
                        </div>
                        <div class="col-6  col-sm-6">
                            <button class="btn btn-inmigracion w-100" id="btnSiguiente" style="border-radius: 30px !important; font-size:14px" disabled >SIGUIENTE</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        $insertarPaginas.firstElementChild.classList.remove("animate__slideInRight")
        $insertarPaginas.firstElementChild.classList.remove("animate__slideInLeft")
        $insertarPaginas.firstElementChild.classList.add('animate__animated', 'animate__bounceOutLeft')
        setTimeout(() => {
            $insertarPaginas.firstElementChild.remove()
            $insertarPaginas.innerHTML = card
           
           paypal.Button.render({
            env:'sandbox',
            style: {
                label:'checkout', // checkout | credit | pay | buynow | generic
                size:'responsive',
                shape:'pill',
                color:'gold',
                layout:'vertical'

            },
            client : {
                sandbox: 'ATKsk8NJ-o_5BUwmsj35ReonKBjeqxgTn4ufWqNwM_06lNjzPt_DBQFMRIHAPurCyFcjWUPzGsMqlc4J',
                production: ''
            },
            funding:{
                allowed:[],
                disallowed:[]
            },
            payment: function(data, actions){
                return actions.payment.create({
                    transactions: [{
                        amount: {
                            total: '0.01',
                            currency: 'USD'
                        }
                    }]
                })
            },
            onAuthorize: function(data, actions){
                return actions.payment.execute().then(function(){
                    enviarDatos(data)              
                })
            },
            onCancel: function(data, actions){
               alert('Ocurrio un error con el pago')
            },
        }, '#insertarBtnPaypal')
        }, 800);



    }

    const cargarPagina = (pagina, paginasTotales, tipo) =>{
        let disabled = "disabled"
        if(pagina.Pagina > 1){
            disabled = ""
        }
        let inputs = ""

        for(i=0; i< pagina.Inputs.length; i++){
            let campo = pagina.Inputs[i]
            let col = ""
            let input= ""
            if(campo.Espacio == "1 Columna"){
                col = "col-12 col-sm-12"
            }else if(campo.Espacio == "2 Columnas"){
                col = "col-12 col-sm-6"
            }else if(campo.Espacio == "3 Columnas"){
                col = "col-12 col-sm-4"
            }else if(campo.Espacio == "4 Columnas"){
                col = "col-12 col-sm-3"
            }
            let Opcional = "true"
            if(campo.Opcional == "Si"){
                Opcional = "false"
            }

            if(campo.Tipo == "checkbox"){
                let registro = localStorage.getItem(campo._id)
                if(registro == null){
                    registro = {
                        valor: "",
                    }
                }else{
                    registro = JSON.parse(registro)
                    if(registro.valor === true){
                        registro.valor = "checked"
                    }else{
                        registro.valor = ""
                    }
                }

                input = `
                    <div class="${col}">
                        <div class="mb-4 border shadow p-3 mb-5 bg-white rounded">
                            <div class="form-check ">
                                <input class="form-check-input big-checkbox shadow-inputs inputForm" ${registro.valor} type="checkbox" name="${campo._id}" value="" required="${Opcional}" id="${campo._id}" >
                                <label class="form-check-label ml-3" for="${campo._id}">
                                    ${campo.Nombre}
                                </label>
                            </div>
                        </div>
                    </div>
                `
            }
            else if(campo.Tipo == "file"){
                input = `
                    <div class="${col}">
                        <div class="mb-4">
                            <label for="${campo._id}">${campo.Nombre}</label>
                            <input type="file" class="form-control shadow-inputs inputForm" name="${campo._id}" id="${campo._id}" required="${Opcional}"  multiple="multiple">
                        </div>
                    </div>
                `
            }
            else if(campo.Tipo == "textarea"){
                let registro = localStorage.getItem(campo._id)
                if(registro == null){
                    registro = {
                        valor: "",
                    }
                }else{
                    registro = JSON.parse(registro)
                }
                input = `
                    <div class="${col}">
                        <div class="mb-4">
                            <label for="${campo._id}">${campo.Nombre}</label>
                            <textarea class="form-control shadow-inputs inputForm" name="${campo._id}" name="${campo._id}" required="${Opcional}" cols="30" rows="10" placeholder="${campo.Nombre}:">${registro.valor}</textarea>
                        </div>
                    </div>
                `
            }
            else{
                let registro = localStorage.getItem(campo._id)
                if(registro == null){
                    registro = {
                        valor: "",
                    }
                }else{
                    registro = JSON.parse(registro)
                }
                input = `
                    <div class="${col}">
                        <div class="mb-4">
                            <label for="${campo._id}">${campo.Nombre}</label>
                            <input type="${campo.Tipo}" required="${Opcional}" value="${registro.valor}" class="form-control shadow-inputs inputForm" id="${campo._id}" name="${campo._id}" placeholder="${campo.Nombre}:">
                        </div>
                    </div>
                `
            }

            inputs += input

        }

        let animacion = ""

        if(tipo == "siguiente"){
            animacion = "animate__animated animate__slideInRight"
        }else{
            animacion = "animate__animated animate__slideInLeft"
        }

        let card= `
            <div class="card ${animacion}" style=" margin-top: 100px; margin-left:50px; margin-right: 50px; border-radius: 30px !important; ">
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 text-right m-0">
                            <p style="font-size: 14px;">Página <strong id="paginaActual">${pagina.Pagina}</strong> de ${paginasTotales}</p>
                        </div>
                        <div class="col-12 col-sm-12 text-center">
                            <h2><strong id="tituloPagina">${pagina.TituloPagina}</strong></h2>
                        </div>
                        <div class="col-12 col-sm-12 text-center">
                            <h4>${pagina.Descripcion}</h4>
                        </div>
                        <div class="col-12 col-sm-12">
                            <div class="row ml-3 mr-3">
                                ${inputs}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="outside">
                    <div class="row">
                        <div class="col-6 col-sm-6">
                            <button class="btn btn-secondary w-100" id="btnAnterior" style="border-radius: 30px !important; font-size:14px" ${disabled}>REGRESAR</button>
                        </div>
                        <div class="col-6  col-sm-6">
                            <button class="btn btn-inmigracion w-100" id="btnSiguiente" style="border-radius: 30px !important; font-size:14px" >SIGUIENTE</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        if(tipo == "siguiente"){
            $insertarPaginas.firstElementChild.classList.remove("animate__slideInRight")
            $insertarPaginas.firstElementChild.classList.remove("animate__slideInLeft")
            $insertarPaginas.firstElementChild.classList.add('animate__animated', 'animate__bounceOutLeft')
        }else{
            $insertarPaginas.firstElementChild.classList.remove("animate__slideInRight")
            $insertarPaginas.firstElementChild.classList.remove("animate__slideInLeft")
            $insertarPaginas.firstElementChild.classList.add('animate__animated', 'animate__bounceOutRight')
        }
        setTimeout(() => {
            $insertarPaginas.firstElementChild.remove()
            $insertarPaginas.innerHTML = card
        }, 800);
    }

    d.addEventListener('click', e=>{
        if(e.target.matches('#btnSiguiente')){
            let inputs = document.querySelectorAll('input')
            let textareas = document.querySelectorAll('textarea');
            let selects = document.querySelectorAll('select');
            let checkbox = document.querySelectorAll('checkbox');
            let file = document.querySelectorAll('file');
            let seguir = true
            let unoCheked = 0
            for(i=0; i< inputs.length; i++){
                if(inputs[i].type !== "checkbox" && inputs[i].type !== "file"){
                    if(inputs[i].getAttribute('required') == 'true'){
                        if(inputs[i].value == ''){
                            inputs[i].classList.add('shadow-inputs-danger');
                            seguir= false;
                            
                        }else{
                            inputs[i].classList.remove('shadow-inputs-danger');
                        }
                    }
                } 
                if(inputs[i].type == "checkbox"){
                    if(inputs[i].getAttribute('required') == 'true'){
                        if(!inputs[i].checked){
                            inputs[i].classList.add('shadow-inputs-danger');
                            seguir= false;
                            
                        }else{
                            unoCheked++
                            inputs[i].classList.remove('shadow-inputs-danger');
                        }
                    }
                }
                if(inputs[i].type == "file"){
                    if(inputs[i].getAttribute('required') == 'true'){
                        if(inputs[i].files.length == 0){
                            inputs[i].classList.add('shadow-inputs-danger');
                            seguir= false;
                            
                        }else{
                            inputs[i].classList.remove('shadow-inputs-danger');
                        }
                    }
                }
            }
            if(unoCheked > 0){
                seguir = true
            }

            for(i=0; i< textareas.length; i++){
                if(textareas[i].getAttribute('required') == 'true'){
                    if(textareas[i].value == ''){
                        textareas[i].classList.add('shadow-inputs-danger');
                        seguir= false;
                        textareas[i].focus();
                    }else{
                        textareas[i].classList.remove('shadow-inputs-danger');
                    }
                }
            }
            for(i=0; i< selects.length; i++){
                if(selects[i].getAttribute('required') == 'true'){
                    if(selects[i].value == ''){
                        selects[i].classList.add('shadow-inputs-danger');
                        seguir= false;
                        selects[i].focus();
                    }else{
                        selects[i].classList.remove('shadow-inputs-danger');
                    }
                }
            }
            if(seguir){
                if(!ultimaPagina){
                    paginaActual = +paginaActual + 1;
                    solicitarPagina(_idFormulario, paginaActual, "siguiente")
                }else{
                    paginaActual = +paginaActual + 1;
                    crearPaginaPago()
                    
                }
            }
        }
        if(e.target.matches('#btnAnterior')){
            paginaActual = +paginaActual - 1;
            solicitarPagina(_idFormulario, paginaActual, "regresar")
        }
    })


    d.addEventListener('change', e=>{
        if(e.target.classList.contains('inputForm')){
            if(e.target.type != "file"){
                let data = {
                    key: e.target.id,
                    valor: e.target.value || e.target.checked, 
                    pagina: paginaActual,
                    _idFormulario: _idFormulario,
                }
                localStorage.setItem(e.target.id, JSON.stringify(data));
            }else{
                files = files.filter(file => file.key != e.target.id)
                let valores = []
                for(i=0; i< e.target.files.length; i++){
                    let reader = new FileReader();
                    reader.readAsDataURL(e.target.files[i]);
                    reader.onload = function () {
                        valores.push(reader.result)
                        if(valores.length == e.target.files.length){
                            let data = {
                                key: e.target.id,
                                valor: valores, 
                                pagina: paginaActual,
                                _idFormulario: _idFormulario,
                            }
                            files.push(data)
                        }
                    };
                }
            }

        }
    })