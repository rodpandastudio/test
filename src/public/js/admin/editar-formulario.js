    const d = document,
    $Titulo = d.getElementById('Titulo'),
    $TituloPagina = d.getElementById('TituloPagina'),
    $Pagina = d.getElementById('Pagina'),
    $Descripcion = d.getElementById('Descripcion'),
    $Nombre = d.getElementById('Nombre'),
    $Tipo = d.getElementById('Tipo'),
    $Opcional = d.getElementById('Opcional'),
    $Espacio = d.getElementById('Espacio'),
    $btnAgregar = d.getElementById('btnAgregar'),
    $btnRegistrar = d.getElementById('btnRegistrar'),
    $btnCrearPagina = d.getElementById('btnCrearPagina'),
    $TituloSeccion = d.getElementById('TituloSeccion'),
    $btnEliminar = d.getElementById('btnEliminarFormulario'),
    $insertarPaginas = d.getElementById('insertarPaginas'),
    $tbody = d.getElementById("tbody");

    let campos = []
    let camposCrear = []

    const crearPagina = (dataEnvio) =>{
        fetch ('/api/crear-pagina',{
            method: 'POST',
            body: JSON.stringify(dataEnvio),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((data) =>{
            return data.json()
        })
        .then((data) =>{
            if(data.ok){
                Swal.fire({
                    icon: 'success',
                    title: 'Página creada',
                    showConfirmButton: false,
                    timer: 1500
                })
                setTimeout(() => {
                    location.reload()
                }, 1500);
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo crear la página',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
    }

    $btnEliminar.onclick = () =>{
        Swal.fire({
            title: '¿Estas seguro de eliminar este formulario?',
            text: "No podras revertir esta accion",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/api/eliminar-formulario/${$btnEliminar.getAttribute('data-_idformulario')}`
            }
        })
    }

    $btnAgregar.onclick = () =>{
        if($Nombre.value == '' || $Tipo.value == 0 || $Opcional.value == 0 || $Espacio.value == 0 || $Pagina.value == '' || $Pagina.value <= 0){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Todos los campos son obligatorios',
            })
            return
        }
        let validacion = camposCrear.find((data) => data.Nombre == $Nombre.value)
        if(validacion){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'El nombre del campo ya existe',
            })
        }else{
            let subdata = {
                Nombre : $Nombre.value,
                Tipo : $Tipo.value,
                Opcional : $Opcional.value,
                Espacio : $Espacio.value
            }
            camposCrear.push(subdata)
            let tr = `
                <tr>
                    <td>${$Nombre.value}</td>
                    <td>${$Tipo.value}</td>
                    <td>${$Opcional.value}</td>
                    <td>${$Espacio.value}</td>
                    <td><button class="btn btn-danger">Eliminar campo</button></td>
                </tr>
            `;

            $Nombre.value = ''
            $Tipo.value = 0
            $Opcional.value = 0
            $Espacio.value = 0

            $tbody.insertAdjacentHTML('beforeend', tr)
        }
    }



    let _idFocus = null

    d.addEventListener('click', e=>{
          if(e.target.textContent == "Eliminar campo"){
            e.preventDefault();
            let linea = e.target.parentElement.parentElement
            $tbody.removeChild(linea)            
            campos = campos.filter((data) => data.Nombre != linea.children[0].textContent)
        }
        if(e.target.textContent == "Editar"){
            let idFormulario = e.target.dataset.idformulario;
            let idPagina = e.target.dataset.idpagina;
            fetch(`/api/formulario-pagina/${idFormulario}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idPagina
                })
            })
            .then((data) =>{
                return data.json()
            })
            .then((data) =>{
                if(data.ok){
                    $TituloPagina.value = data.pagina.TituloPagina;
                    $Pagina.value = data.pagina.Pagina;
                    $Descripcion.value = data.pagina.Descripcion;
                    $btnCrearPagina.textContent = "Editar página";
                    $tbody.innerHTML = "";
                    for(i=0; i< data.pagina.Inputs.length; i++){
                        let tr = d.createElement('tr');
                        tr.innerHTML = `
                            <td>${data.pagina.Inputs[i].Nombre}</td>
                            <td>${data.pagina.Inputs[i].Tipo}</td>
                            <td>${data.pagina.Inputs[i].Opcional}</td>
                            <td>${data.pagina.Inputs[i].Espacio}</td>
                            <td><button class="btn btn-danger" data-id="${data.pagina.Inputs[i]._id}">Eliminar campo</button></td>
                        `;
                        $tbody.appendChild(tr);
                    }
                    window.scrollTo(0, 0);

                    _idFocus = idPagina;
                }
            })
        }
        if(e.target.textContent == "Eliminar"){
            Swal.fire({
                title: '¿Está seguro de eliminar esta página?',
                text: "No podrá revertir esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, eliminar'
            }).then((result) => {
                if (result.isConfirmed) {
                    let idFormulario = e.target.dataset.idformulario;
                    let idPagina = e.target.dataset.idpagina;
                    fetch(`/api/eliminar-pagina/${idFormulario}`,{
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            idPagina
                        })
                    })
                    .then((data) =>{
                        return data.json()
                    }).then((data) =>{
                        if(data.ok){
                            Swal.fire(
                                'Página eliminada',
                                'La página fue eliminada correctamente',
                                'success'
                            ).
                            then(()=>{
                                location.reload();
                            })
                        }else{
                            Swal.fire(
                                'Error',
                                'Ha ocurrido un error. Comunicate con soporte',
                                'error'
                            )
                        }
                    })
                }
            })
        }
        if(e.target == $btnCrearPagina){
            fetch(`/api/solicitar-formulario/${$TituloSeccion.dataset._id}`)
            .then((data) =>{
                return data.json()
            })
            .then((data) =>{
                if($TituloPagina.value == ''){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'El titulo de la página es obligatorio',
                    })
                    return
                }
                if($tbody.children.length == 0){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Debe agregar al menos un campo a la lista',
                    })
                    return
                }

                let validacionPagina = data.formulario.Paginas.find((data) => data.Pagina == $Pagina.value)
                let campos = $tbody.children;
                let Inputs = [];
                if(validacionPagina){
                        Swal.fire({
                            icon: "warning",
                            title: "La pagina ya existe. ¿Desea reemplazarla?",
                            showDenyButton: true,
                            confirmButtonText: `Si`,
                            denyButtonText: `No`,
                        }).then((result) => {
                            if(result.isConfirmed){
                                let data = {
                                    TituloPagina: $TituloPagina.value,
                                    Descripcion: $Descripcion.value,
                                    Campos: campos
                                }
                                for(i=0; i< campos.length; i++){
                                    let subdataInputs = {
                                        Nombre: campos[i].children[0].textContent,
                                        Tipo: campos[i].children[1].textContent,
                                        Opcional: campos[i].children[2].textContent,
                                        Espacio: campos[i].children[3].textContent
                                    }
                                    Inputs.push(subdataInputs)
                                }
                                let dataEnvio = {
                                    TituloPagina: $TituloPagina.value,
                                    Descripcion: $Descripcion.value,
                                    _idFormulario : $TituloSeccion.dataset._id,
                                    Pagina: $Pagina.value,
                                    Inputs,
                                }
                                crearPagina(dataEnvio)
                            }
                        })
                    }
                else{
                    let cols = ""

                    for(i=0; i< camposCrear.length; i++){
                        let col = ""
                        let subdataInputs = {
                            Nombre: camposCrear[i].Nombre,
                            Tipo: camposCrear[i].Tipo,
                            Opcional: camposCrear[i].Opcional,
                            Espacio: camposCrear[i].Espacio
                        }
                        Inputs.push(subdataInputs)
                    }

                    let dataEnvio = {
                        TituloPagina: $TituloPagina.value,
                        Descripcion: $Descripcion.value,
                        _idFormulario : $TituloSeccion.dataset._id,
                        Pagina: $Pagina.value,
                        Inputs,
                    }

                    crearPagina(dataEnvio)

                }
            })
        }
    })

