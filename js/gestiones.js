// Gestiones Credicompany
 function abrirGestion(nombre, celular){

let comentario = prompt(
"Ingrese gestión realizada:"
);

if(!comentario) return;

let gestion = {
cliente: nombre,
celular: celular,
tipo: "GESTIÓN",
comentario: comentario,
asesor: asesor,
fecha: new Date().toLocaleString()
};

db.ref("gestiones").push(gestion);

alert("✅ Gestión guardada");

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

snap.forEach(item=>{
historial.push(item.val());
});

lista.innerHTML = "";

historial.reverse().forEach(g=>{

lista.innerHTML += `
<div class="item">
<b>${g.cliente}</b><br>
📞 ${g.celular}<br>
📝 ${g.comentario}<br>
👤 ${g.asesor}<br>
🕒 ${g.fecha}
</div>`;
});

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
