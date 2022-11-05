
    const d = document;

    d.addEventListener('click', e => {
        if(e.target.matches('.btnPaypal')){
            e.preventDefault();
            const id = e.target.dataset.id;
            fetch(`/api/solicitar-info-paypal/${id}`)
            .then((data) =>{
                return data.json()
            })
            .then((data) =>{
                let html = ``
                let ul = ""
                if(data.length > 0){
                    data.forEach((item) =>{
                        li1 = `<li><strong>Order ID: </strong>${item.orderID}</li>`
                        li2 = `<li><strong>Payer ID: </strong>${item.payerID}</li>`
                        li3 = `<li><strong>Payment ID: </strong>${item.paymentID}</li>`

                        ul = `<ul>${li1}${li2}${li3}</ul>`

                    })
                }else{
                    ul = `<p>No hay información de paypal</p>`
                }
                Swal.fire({
                    title: 'Paypal',
                    html: `${ul}`,
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    focusConfirm: false,
                    focusCancel: false,
                })
            })
        }
        if(e.target.matches('.btnCambiar')){
            e.preventDefault();
            const estado = e.target.dataset.estado;
            const id = e.target.dataset.id;
            console.log(estado)
            if(estado == "Procesado" || estado == "Anulado"){
                Swal.fire({
                    title: 'No se puede cambiar el estado',
                    text: 'El estado del resultado ya fue cambiado',
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ok'
                })
            }else{
                let options = `
                <option value="0">--Seleccione un estado--</option>
                <option value="Procesado">Procesado</option>
                <option value="Anulado">Anulado</option>`

                Swal.fire({
                    title: 'Cambiar estado',
                    html: `<select class="form-control" id="estado">${options}</select>`,
                    showCloseButton: true,
                    showCancelButton: true,
                    showConfirmButton: true,
                    focusConfirm: false,
                    focusCancel: false,
                    confirmButtonText: 'Cambiar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const estado = d.getElementById('estado').value;
                        if(!estado || estado == "0"){
                            Swal.showValidationMessage(`Seleccione un estado`)
                        }
                        return {estado}
                    }
                }).then((result) =>{
                    if(result.isConfirmed){
                        fetch(`/api/cambiar-estado-resultados/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(result.value)
                        })
                        .then((data) =>{
                            return data.json()
                        })
                        .then((data) =>{
                            if(data.ok){
                                Swal.fire({
                                    title: 'Estado cambiado',
                                    text: 'El estado del resultado fue cambiado',
                                    icon: 'success',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Ok'
                                }).then((result) =>{
                                    if(result.isConfirmed){
                                        location.reload()
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })
