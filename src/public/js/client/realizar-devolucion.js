const d = document,
$Codigo = d.getElementById("Codigo"),
$Cantidad = d.getElementById("Cantidad"),
$insertarError = d.getElementById("insertarError"),
$bntAgregar = d.getElementById("bntAgregar"),
$btnGenerar = d.getElementById("btnGenerar"),
$tbody = d.getElementById("tbody");
let codigos 
let codigoExite = []
const solicitarCodigos = async (data) => {
    return await fetch(`/solciitar-codigos-generar-devolucion-cliente`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
        "Content-type": "application/json; charset=utf-8",
        },
    })
    .then((response) => {
        return response.json();
        })
    .then((response) => {
        codigos = response
    });
};
d.addEventListener("click", e=> {
    if(e.target == $bntAgregar){
        if($Codigo.value == 0 || !$Codigo.value || !$Cantidad.value || $Cantidad.value == 0 ){
            $insertarError.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                Debe introducir un código y una cantidad para poder agregar a la lista. Por favor, valide e intente de nuevo.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
            window.scrollTo(0,0)

        }else{
            let codigoExiteValidacion = codigoExite.find((data) => data == $Codigo.value)
            if(codigoExiteValidacion){
            $insertarError.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    El código ya se encuentra agregado a la lista. Por favor, valide e intente de nuevo.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                `
                window.scrollTo(0,0)

            }else{
                codigoExite.push($Codigo.value)
                let infoCodigo = codigos.find((data) => data == $Codigo.value)
                console.log(infoCodigo)
                let precioTotal = (+$Cantidad.value * +infoCodigo.PrecioUnidad).toFixed(2)  
                let tr = `
                    <tr>
                        <td class="text-center">${infoCodigo.Codigo}</td>
                        <td class="text-center">${infoCodigo.TipoProducto}</td>
                        <td class="text-center">${infoCodigo.Descripcion}</td>
                        <td class="text-center">${infoCodigo.PrecioUnidad}</td>
                        <td class="text-center">${$Cantidad.value}</td>
                        <td class="text-center">${precioTotal}</td>
                        <td class="text-center"><button class="btn btn-danger">-</button></td>
                    </tr>
                `
                $tbody.innerHTML += tr
            }

        }
    }
    if(e.target.textContent == "-"){
        let linea = e.target.parentElement.parentElement
        codigoExite = codigoExite.filter((data) => data != linea.children[0].textContent)
        $tbody.removeChild(linea)
    }
    if(e.target == $btnGenerar){
        if($tbody.children.length == 0){
            $insertarError.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                El código ya se encuentra agregado a la lista. Por favor, valide e intente de nuevo.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
            window.scrollTo(0,0)
        }else{
            let Productos = []
            let CantidadTotal = 0
            let PrecioTotal = 0
            for(i=0; i< $tbody.children.length; i++){
                CantidadTotal += 
                    let subdata ={
                    Codigo: $tbody.children[i].children[0].textContent,
                    TipoProducto: $tbody.children[i].children[1].textContent,
                    Descripcion: $tbody.children[i].children[2].textContent,
                    Cantidad: $tbody.children[i].children[4].textContent,
                    PrecioUnidad: $tbody.children[i].children[3].textContent,
                    PrecioTotal: $tbody.children[i].children[5].textContent,
                }
                Productos.push(subdata)
            }
                let data = {
                _id, 
                CantidadTotal,
                PrecioTotal,
                Productos,
                Estado: "Enviada" 
            }
        }
        
    }
})

solicitarCodigos()