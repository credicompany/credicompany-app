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
function verHistorialGestiones(){
document.getElementById("historialDiv").style.display="none";
document.getElementById("historialClienteDiv").style.display="none";
document.getElementById("dashboard").style.display="none";

document.querySelector(".resumen").style.display="none";

app.style.display="block";
[
"simulador",
"clientes",
"pagos",
"admin"
].forEach(id=>{

document.getElementById(id).style.display="none";

});

document.getElementById("historialGestionesDiv").style.display="block";

let lista =
document.getElementById(
"listaGestiones"
);

lista.innerHTML="";

db.ref("gestiones").once("value", snap => {

let historial = [];

let ahora = Date.now();
let quinceDias = 15 * 24 * 60 * 60 * 1000;

snap.forEach(item=>{

let g = item.val();

if(!g.timestamp){
    historial.push(g);
    return;
}

if((ahora - g.timestamp) <= quinceDias){
    historial.push(g);
}

});
snap.forEach(item=>{

let g = item.val();
if(!g.timestamp){

    item.ref.remove();

    return;

}
if(
    g.timestamp &&
    (ahora - g.timestamp) > quinceDias
){
    item.ref.remove();
}

});

lista.innerHTML = "";

let agrupado = {};

historial.reverse().forEach(g=>{

let usuario = g.asesor || "Sin Usuario";

if(!agrupado[usuario]){
agrupado[usuario] = [];
}

agrupado[usuario].push(g);

});

Object.keys(agrupado).forEach(usuario=>{

lista.innerHTML += `
<div style="
background:#123B63;
color:white;
padding:10px;
border-radius:10px;
margin-top:15px;
font-weight:bold;
font-size:16px;
">
👤 ${usuario.toUpperCase()}
(${agrupado[usuario].length} gestiones)
</div>
`;

agrupado[usuario].forEach(g=>{

lista.innerHTML += `
<div class="item">
<b>${g.cliente}</b><br>
📞 ${g.celular}<br>
📝 ${g.comentario}<br>
🕒 ${g.fecha}
</div>
`;

});

});

if(historial.length===0){

lista.innerHTML =
"<p>No existen gestiones registradas</p>";

return;

}
  
});
  
}
  function verHistorialCliente(nombre, celular){

document.getElementById("clientes")
.style.display="none";

document.getElementById(
"historialClienteDiv"
).style.display="block";

let historial =
JSON.parse(
localStorage.getItem(
"historialGestiones"
)
) || [];

let lista =
document.getElementById(
"historialClienteContenido"
);

lista.innerHTML = "";

let registros =
historial.filter(g=>

g.cliente === nombre &&
g.celular === celular

);

if(registros.length === 0){

lista.innerHTML = `
<div class="item">
No existen gestiones registradas
</div>
`;

return;
}

registros.forEach(g=>{

lista.innerHTML += `

<div class="item">

<b>📌 ${g.tipo}</b><br>

📝 ${g.comentario}<br>

👤 ${g.asesor || "Sin usuario"}<br>

🕒 ${g.fecha}

</div>

`;

});

}
function volverHistorialCliente(){

document.getElementById(
"historialClienteDiv"
).style.display="none";

document.getElementById(
"clientes"
).style.display="block";

}
