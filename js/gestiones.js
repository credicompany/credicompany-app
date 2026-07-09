function abrirGestion(nombre, celular){

    alert("Entró a abrirGestion");

    console.log("Nombre:", nombre);
    console.log("Celular:", celular);

    let comentario = prompt("Ingrese gestión realizada:");

    if(!comentario){
        alert("No se ingresó comentario");
        return;
    }

    let gestion = {
        cliente: nombre,
        celular: celular,
        tipo: "GESTIÓN",
        comentario: comentario,
        asesor: (typeof asesor !== "undefined") ? asesor : "",
        fecha: new Date().toLocaleString(),
        timestamp: Date.now()
    };

    console.log("DB:", db);
    console.log("Gestión:", gestion);

    db.ref("gestiones").push(gestion)
    .then(()=>{
        alert("✅ Gestión guardada");
    })
    .catch(err=>{
        console.error(err);
        alert(err.message);
    });

}
