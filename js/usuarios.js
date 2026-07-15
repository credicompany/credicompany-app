const CLOUD_NAME = "ohmeklhe";
const UPLOAD_PRESET = "credicompany_upload";

// LOGIN
function login(){
let user=usuario.value.trim();
let pass=clave.value.trim();

if(
(user==="admin" && pass==="1234") ||
(user==="operaciones" && pass==="1234")
){

asesor = user.toLowerCase().trim();

window.esAdmin = true;

cargarPerfilAsesor(asesor);

loginDiv.style.display="none";
dashboard.style.display="block";
  document.querySelector(".headerNuevo").style.display="block";
document.querySelector(".resumen").style.display="grid";

document.getElementById("boxAdmin").style.display="flex";
document.getElementById("panelExcel").style.display="block";
document.getElementById("panelAsesores").style.display="grid";
document.getElementById("boxKpiFinanciero").style.display="flex";
document.getElementById("boxResultadoMensual").style.display="flex";
actualizarResumen();

return;
}

let usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

let encontrado = usuarios.find(
    u =>
    (u.user || "").toLowerCase().trim() === user.toLowerCase().trim() &&
    (u.pass || "").trim() === pass.trim()
);

if(encontrado){

    asesor = user.toLowerCase().trim();
if(asesor==="ebenites"){

document.getElementById("boxKpiFinanciero").style.display="flex";

document.getElementById("boxResultadoMensual").style.display="flex";

}else{

document.getElementById("boxKpiFinanciero").style.display="none";

document.getElementById("boxResultadoMensual").style.display="none";

}
    nombreAsesor.innerText = asesor;

    cargarPerfilAsesor(asesor);

    loginDiv.style.display="none";
    dashboard.style.display="block";

    document.getElementById("boxAdmin").style.display="none";

    if(asesor === "slopez"){
        document.getElementById("panelAsesores").style.display="grid";
    }else{
        document.getElementById("panelAsesores").style.display="none";
    }

    document.getElementById("panelExcel").style.display="none";

    actualizarResumen();

}else{

    alert("❌ Usuario o clave incorrectos");

}
}
function eliminarUsuarioManual(){

let user = document.getElementById("nuevoUser").value.trim();

if(!user){
alert("Ingrese usuario a eliminar");
return;
}

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

let index = usuarios.findIndex(u => u.user === user);

if(index === -1){
alert("Usuario no encontrado");
return;
}

if(!confirm("¿Eliminar usuario?")) return;

usuarios.splice(index,1);

localStorage.setItem(
    "usuarios",
    JSON.stringify(usuarios)
);

db.ref("usuarios")
.set(usuarios)
.then(()=>{

    console.log(
    "✅ Usuario eliminado Firebase"
    );

})
.catch(err=>{

    console.error(err);

});

renderUsuarios();

alert("✅ Usuario eliminado");
  }

function filtrarMora(min,max){

let lista = document.getElementById("listaClientes");
lista.innerHTML="";
let html = "";
  
let data = JSON.parse(localStorage.getItem("cartera")) || [];
filtroMin = min;
filtroMax = max;
let textoBusqueda =
(document.getElementById("buscarCliente")?.value || "")
.toLowerCase()
.trim();
let filtrados = data.filter(c=>{

if(c.pagado_hoy) return false;

let r = parseFloat(c.retraso)||0;
let coincideBusqueda =

!textoBusqueda ||

(c.nombre || "")
.toLowerCase()
.includes(textoBusqueda)

||

(c.celular || "")
.toString()
.includes(textoBusqueda)

||

(c.direccion || "")
.toLowerCase()
.includes(textoBusqueda);
// 🔥 ADMIN con filtro combinado
if(
asesor === "admin" ||
asesor === "operaciones"
){

    if(filtroAsesor){
        return r>=filtroMin && r<=filtroMax &&
        (c.asesor || "").toLowerCase() === filtroAsesor.toLowerCase();
    }

    return r>=filtroMin &&
r<=filtroMax &&
coincideBusqueda;
}

// 🔥 ASESOR NORMAL
let asesorCliente = (c.asesor || "")
    .toString()
    .toLowerCase()
    .trim();

let asesorActual = (asesor || "")
    .toString()
    .toLowerCase()
    .trim();

// SLOPEZ puede ver toda la cartera
if(asesorActual === "slopez"){
   return r>=filtroMin &&
r<=filtroMax &&
coincideBusqueda;
}

let esMio = asesorCliente === asesorActual;

return r>=filtroMin && r<=filtroMax && esMio;
});

let hoy=0, alDia=0, leve=0, medio=0, critico=0;
filtrados.forEach(c=>{
    let r=parseFloat(c.retraso)||0;

    if(r === 0) hoy++;
    else if(r <= 8) alDia++;
    else if(r <= 30) leve++;
    else if(r <= 60) medio++;
    else critico++;
});

html+=`
<div class="item" style="background:#123B63;color:white">
<b>📊 Resumen</b><br>
🟢 ${hoy} | 🟢 ${alDia} | 🟡 ${leve} | 🔴 ${medio} | ⚫ ${critico}
</div>`;

filtrados.sort((a,b)=>{
    return (b.retraso||0)-(a.retraso||0);
});
console.log("=== VERIFICANDO CARTERA ===");

data.forEach(c=>{
    if(
        c.nombre &&
        c.nombre.toUpperCase().includes("CARRASCAL")
    ){
        console.log(c);
    }
});
filtrados.forEach((c,index)=>{
let color="#2ecc71";
if(c.retraso>8) color="#f1c40f";
if(c.retraso>30) color="#e74c3c";
if(c.retraso>60) color="black";

html+=`
<div class="item"
style="
border-left:4px solid ${color};
background:#fff;
border-radius:14px;
padding:10px;
margin-bottom:12px;
box-sizing:border-box;
overflow:hidden;
">

<div style="
display:flex;
flex-direction:column;
gap:8px;
">
<div
style="
font-size:13px;
font-weight:700;
color:#123B63;
line-height:1.2;
cursor:pointer;
"
onclick="verHistorialCliente(
'${c.nombre}',
'${c.celular}'
)">
👤 ${c.nombre}
</div>
<div style="
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px;
margin-top:8px;
margin-bottom:10px;
">

<button
style="
background:#25D366;
color:white;
border:none;
border-radius:10px;
padding:8px;
font-size:12px;
font-weight:700;
"
onclick='enviarCobranzaDesdeLista(
"${encodeURIComponent(c.nombre)}",
"${c.celular}",
"${c.retraso}",
"${c.monto}"
);return false;'>
💬 WhatsApp
</button>

<button
style="
background:#2563EB;
color:white;
border:none;
border-radius:10px;
padding:8px;
font-size:12px;
font-weight:700;
"
onclick="window.location.href='tel:${c.celular}'">
📞 Llamar
</button>

<button
style="
background:#F59E0B;
color:white;
border:none;
border-radius:10px;
padding:8px;
font-size:12px;
font-weight:700;
"
onclick="abrirGestion('${c.nombre}','${c.celular}')">
📝 Gestión
</button>

</div>
<div
style="
display:grid;
grid-template-columns:1fr 1fr;
gap:8px;
margin-top:8px;
margin-bottom:8px;
">

<div
style="
width:100%;
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:12px;
padding:6px 8px;
min-height:58px;
display:flex;
flex-direction:column;
justify-content:center;
">

<div
style="
font-size:12px;
line-height:1.3;
white-space:normal;
font-weight:700;
color:#64748B;
text-transform:uppercase;
letter-spacing:.8px;
">
Cuota_Mora
</div>

<div
style="
font-size:13px;
font-weight:800;
margin-top:2px;
line-height:1.1;
">
S/${parseFloat(c.monto || 0).toLocaleString()}
</div>

</div>

<div
style="
width:100%;
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:12px;
">

<div
style="
font-size:10px;
font-weight:700;
color:#64748B;
text-transform:uppercase;
letter-spacing:.8px;
line-height:1.3;
white-space:normal;
">
Monto Desembolsado
</div>

<div
style="
font-size:13px;
font-weight:800;
color:#2563EB;
margin-top:6px;
">
S/${parseFloat(c.montoDesembolsado || 0).toLocaleString()}
</div>

</div>

</div>
<div
style="
width:100%;
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:6px 8px;
">

<div
style="
font-size:10px;
font-weight:700;
color:#64748B;
text-transform:uppercase;
letter-spacing:.8px;
">
Fecha Desembolso
</div>

<div
style="
font-size:13px;
font-weight:700;
color:#0F766E;
margin-top:2px;
">
${c.fechaDesembolso || "-"}
</div>

</div>
<div style="
margin-top:8px;
">

<div style="
display:grid;

grid-template-columns:repeat(3,1fr);
gap:6px;
margin-top:8px;
margin-bottom:8px;
">

<div style="
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:8px;
text-align:center;
">

<div style="
font-size:13px;
font-weight:800;
color:${color};
">
${parseInt(c.retraso || 0)}
</div>

<div style="
font-size:11px;
font-weight:700;
color:#64748B;
margin-top:4px;
">
DÍAS
</div>

</div>

<div style="
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:6px;
text-align:center;
">

<div style="
font-size:13px;
font-weight:800;
color:#EF4444;
">
${c.cuotasVencidas || 0}
</div>

<div style="
font-size:10px;
font-weight:700;
color:#64748B;
margin-top:4px;
">
VENCIDAS
</div>

</div>

<div style="
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:6px;
text-align:center;
">

<div style="
font-size:13px;
font-weight:800;
color:#2563EB;
">
${c.cuotasPorPagar || 0}
</div>

<div style="
font-size:11px;
font-weight:700;
color:#64748B;
margin-top:4px;
">
P/PAGAR
</div>

</div>
</div>
</div>
<div style="
margin-top:8px;
">
<div style="
margin-top:16px;
display:grid;
grid-template-columns:1fr 1fr;
gap:8px;
align-items:start;
">
<div>
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
👤 Asesor
</div>

<div style="
font-size:13px;
font-weight:700;
color:#123B63;
">
${(c.asesor || "").toUpperCase()}
</div>
</div>

<div>
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
📞 Celular
</div>

<div style="
font-size:13px;
font-weight:700;
">
<a href="#"
onclick='enviarCobranzaDesdeLista(
"${encodeURIComponent(c.nombre)}",
"${c.celular}",
"${c.retraso}",
"${c.monto}"
); return false;'
style="
color:#16A34A;
text-decoration:none;
font-weight:700;
">
${c.celular}
</a>
</div>
</div>
<div>
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
🆔 DNI
</div>

<div style="
font-size:13px;
font-weight:700;
color:#334155;
">
${c.dni || "-"}
</div>
</div>
<div>
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
📦 Producto
</div>

<div style="
font-size:14px;
font-weight:700;
color:#334155;
">
${c.producto}
</div>
</div>

<div style="
grid-column:1 / span 2;
">
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
📍 Dirección
</div>

<div style="
font-size:13px;
line-height:1.4;
color:#334155;
">
${c.direccion}
</div>
</div>

<div>
<div style="
font-size:11px;
color:#64748B;
font-weight:700;
text-transform:uppercase;
">
🏙 Distrito
</div>

<div style="
font-size:13px;
font-weight:700;
color:#334155;
">
${c.distrito}
</div>
</div>

</div>
<div style="
margin-top:14px;
background:#F8FAFC;
border:1px solid #E5EAF1;
border-radius:14px;
padding:12px;
">

<div style="
font-size:13px;
font-weight:700;
color:#123B63;
margin-bottom:10px;
">
🏠 EVIDENCIAS
</div>

<div style="
display:grid;
grid-template-columns:1fr 1fr;
gap:10px;
">

<div style="
border:1px dashed #CBD5E1;
border-radius:12px;
padding:10px;
text-align:center;
">

<div style="font-size:22px;">🏡</div>

<div style="
font-size:12px;
font-weight:700;
margin-top:6px;
">
CASA
</div>

<div id="fotoCasa_${c.dni}">
<button
style="
margin-top:8px;
background:#16A34A;
color:white;
border:none;
border-radius:10px;
padding:8px;
font-size:12px;
"
onclick="subirFoto('casa','${c.dni}')">
📷 Agregar
</button>
</div>

</div>

<div style="
border:1px dashed #CBD5E1;
border-radius:12px;
padding:10px;
text-align:center;
">

<div style="font-size:22px;">🏪</div>

<div style="
font-size:12px;
font-weight:700;
margin-top:6px;
">
NEGOCIO
</div>

<div id="fotoNegocio_${c.dni}">
<button
style="
margin-top:8px;
background:#2563EB;
color:white;
border:none;
border-radius:10px;
padding:8px;
font-size:12px;
"
onclick="subirFoto('negocio','${c.dni}')">
📷 Agregar
</button>
</div>

</div>

</div>

</div>
${c.nombreAval ? `

<div style="height:12px;"></div>

<div style="
background:#F8FAFC;
padding:8px;
border-radius:14px;
margin-top:16px;
">

<b>👥 AVAL</b><br>

👤 ${c.nombreAval}
${c.apellidoPAval}
${c.apellidoMAval}<br>

📞 <a href="#"
onclick='enviarCobranzaAval(
"${encodeURIComponent(c.nombreAval)}",
"${c.telefonoAval}",
"${encodeURIComponent(c.nombre)}",
"${c.retraso}",
"${c.monto}"
); return false;'
style="color:#25D366;font-weight:bold;text-decoration:none;">
${c.telefonoAval}
</a><br>

📍 ${c.direccionAval}

</div>

` : ""}

<div style="clear:both;"></div>

</div>

<div
style="
margin-top:20px;
padding-top:18px;
border-top:1px solid #E5EAF1;
">

</div>

</div>

</div>`;
});
  
const fragment = document.createRange().createContextualFragment(html);

lista.replaceChildren(fragment);

filtrados.forEach(c=>{
    cargarFotosCliente(c.dni);
});
  
}
function filtrarPorAsesor(nombreAsesor){
    filtroAsesor = nombreAsesor;
    filtrarMora(filtroMin, filtroMax);
}

function resetFiltros(){
    filtroAsesor = "";
    filtroMin = 0;
    filtroMax = 1000;
    filtrarMora(0,1000);
}
// USUARIOS
function crearUsuario(){
let user=nuevoUser.value.trim();
let pass=nuevoPass.value.trim();

if(!user || !pass) return alert("Completar");

let usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

if(usuarios.find(u=>u.user===user)) return alert("Existe");

usuarios.push({
user:user.toLowerCase().trim(),
pass:pass,
nombre:nuevoNombre.value.trim(),
foto:nuevoFoto.value.trim()
});
localStorage.setItem("usuarios",JSON.stringify(usuarios));
db.ref("usuarios")
.set(usuarios)
.then(()=>{

   console.log(
   "✅ Usuarios sincronizados"
   );

})
.catch(err=>{

   console.error(
   "❌ Error usuarios:",
   err
   );

});
nuevoUser.value="";
nuevoPass.value="";
nuevoNombre.value="";
nuevoFoto.value="";

renderUsuarios();
}

function renderUsuarios(){
let lista=listaUsuarios;
let usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

lista.innerHTML="";
usuarios.forEach(u=>{
lista.innerHTML+=`<div class="item">${u.user}</div>`;
});
}
function verTodosClientes(){

// Mostrar toda la cartera
filtrarMora(0,1000);
cargarResumen();
console.log("Vista general activada");

}
async function subirFoto(tipo, dni){

try{

const input = document.createElement("input");
input.type = "file";
input.accept = "image/*";
input.capture = "environment";

input.onchange = async ()=>{

const archivo = input.files[0];

if(!archivo) return;

const formData = new FormData();

formData.append("file", archivo);
formData.append("upload_preset", UPLOAD_PRESET);

const respuesta = await fetch(
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
{
method:"POST",
body:formData
}
);

const datos = await respuesta.json();

if(!datos.secure_url){
alert("Error al subir imagen");
return;
}

// Guardar en Firebase
await db.ref("evidencias/"+dni+"/"+tipo).set({
url: datos.secure_url,
fecha: new Date().toLocaleString()
});

// Mostrar inmediatamente la miniatura
const contenedor =
document.getElementById(
tipo==="casa"
? "fotoCasa_"+dni
: "fotoNegocio_"+dni
);

contenedor.innerHTML = `
<img
src="${datos.secure_url}"
style="
width:100%;
height:120px;
object-fit:cover;
border-radius:10px;
cursor:pointer;
margin-bottom:8px;
"
onclick="window.open('${datos.secure_url}','_blank')">

<button
class="btnCambiarFoto"
onclick="subirFoto('${tipo}','${dni}')">
📷 Cambiar foto
</button>
`;

alert("✅ Foto guardada correctamente");

};

input.click();

}catch(error){

console.error(error);
alert("Error al subir imagen");

}

}
  async function cargarFotosCliente(dni){

try{

const snap = await db.ref("evidencias/"+dni).once("value");

if(!snap.exists()) return;

const datos = snap.val();

if(datos.casa){

document.getElementById("fotoCasa_"+dni).innerHTML = `
<img
src="${datos.casa.url}"
style="
width:100%;
height:120px;
object-fit:cover;
border-radius:10px;
cursor:pointer;
margin-bottom:8px;
"
onclick="window.open('${datos.casa.url}','_blank')">

<button
class="btnCambiarFoto"
onclick="subirFoto('casa','${dni}')">
📷 Cambiar foto
</button>
`;
  
}

if(datos.negocio){

document.getElementById("fotoNegocio_"+dni).innerHTML = `
<img
src="${datos.negocio.url}"
style="
width:100%;
height:120px;
object-fit:cover;
border-radius:10px;
cursor:pointer;
margin-bottom:8px;
"
onclick="window.open('${datos.negocio.url}','_blank')">

<button
class="btnCambiarFoto"
onclick="subirFoto('negocio','${dni}')">
📷 Cambiar foto
</button>
`;
  
}

}catch(e){

console.error("Error cargando fotos", e);

}

}
