// =====================================================
// RESULTADO MENSUAL CREDICOMPANY
// Versión 2.0
// =====================================================

// ======================================
// VARIABLES GLOBALES
// ======================================

let ingresosMensuales = [];
let gastosMensuales = [];

let totalIngresos = 0;
let totalEgresos = 0;

let interesDevengado = 0;
let moraReal = 0;
let costoDesembolso = 0;
let otrosIngresos = 0;

let utilidadOperativa = 0;
let utilidadNeta = 0;

let margenOperativo = 0;
let margenNeto = 0;


// ======================================
// PANEL PRINCIPAL
// ======================================

function cargarResultadoMensual(){

let html = `

<div style="
background:white;
padding:18px;
border-radius:18px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h2 style="
margin:0;
color:#123B63;
text-align:center;
">
💼 RESULTADO MENSUAL
</h2>

<div style="
text-align:center;
color:#666;
font-size:13px;
margin-top:5px;
">

Estado de Resultados del Mes

</div>

</div>

<br>


<div style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:12px;
">

<div style="
background:#16a34a;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<div style="font-size:30px;">
💰
</div>

<div>
Ingresos
</div>

<h2 id="rmIngresos">
S/ 0
</h2>

</div>


<div style="
background:#dc2626;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<div style="font-size:30px;">
💸
</div>

<div>
Egresos
</div>

<h2 id="rmEgresos">
S/ 0
</h2>

</div>


<div style="
background:#2563eb;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<div style="font-size:30px;">
📈
</div>

<div>
Utilidad Operativa
</div>

<h2 id="rmOperativa">
S/ 0
</h2>

</div>


<div style="
background:#7c3aed;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<div style="font-size:30px;">
🏆
</div>

<div>
Utilidad Neta
</div>

<h2 id="rmNeta">
S/ 0
</h2>

</div>

</div>

<br>

<div style="
background:white;
padding:18px;
border-radius:18px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h3 style="
margin-top:0;
color:#123B63;
">

📂 Archivo de Ingresos

</h3>

<input
type="file"
id="excelIngresos"
accept=".xlsx,.xls">

<button
class="btn-verde"
onclick="cargarExcelIngresos()">

💰 Cargar Archivo Ingresos

</button>

<br><br>

<div
id="archivoIngresosActivo"
style="
background:#E8F5E9;
padding:10px;
border-radius:10px;
font-weight:bold;
">

Sin archivo cargado

</div>

</div>

<br>

<div style="
background:white;
padding:18px;
border-radius:18px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h3 style="
margin-top:0;
color:#123B63;
">

📂 Archivo de Gastos

</h3>

<input
type="file"
id="excelGastos"
accept=".xlsx,.xls">

<button
class="btn-verde"
onclick="cargarExcelGastos()">

💸 Cargar Archivo Gastos

</button>

<br><br>

<div
id="archivoGastosActivo"
style="
background:#E8F5E9;
padding:10px;
border-radius:10px;
font-weight:bold;
">

Sin archivo cargado

</div>

</div>

<br>

<div style="
background:white;
padding:18px;
border-radius:18px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h3 style="margin-top:0;">
📊 Detalle de Ingresos
</h3>

<table
style="
width:100%;
border-collapse:collapse;
">

<tr>

<td>Interés Devengado</td>

<td align="right">
<b id="rmInteres">
S/ 0
</b>
</td>

</tr>

<tr>

<td>Mora Real</td>

<td align="right">
<b id="rmMora">
S/ 0
</b>
</td>

</tr>

<tr>

<td>Costo por Desembolso</td>

<td align="right">
<b id="rmCosto">
S/ 0
</b>
</td>

</tr>

<tr>

<td>Otros Ingresos</td>

<td align="right">
<b id="rmOtros">
S/ 0
</b>
</td>

</tr>

</table>

</div>

`;

document.getElementById(
"resumenResultadoMensual"
).innerHTML = html;

actualizarResultadoMensual();

}
// =====================================================
// PARTE 2/6
// CARGA DE INGRESOS
// =====================================================


// ======================================
// CARGAR EXCEL DE INGRESOS
// ======================================

function cargarExcelIngresos(){

let archivo =
document.getElementById("excelIngresos").files[0];

if(!archivo){

alert("Seleccione el archivo de ingresos");

return;

}

let lector =
new FileReader();

lector.onload = function(e){

let data =
new Uint8Array(e.target.result);

let wb =
XLSX.read(data,{type:"array"});

let hoja =
wb.Sheets[
wb.SheetNames[0]
];

let json =
XLSX.utils.sheet_to_json(hoja);

ingresosMensuales = json;

localStorage.setItem(
"ingresosMensuales",
JSON.stringify(json)
);

localStorage.setItem(
"nombreIngresos",
archivo.name
);

localStorage.setItem(
"fechaIngresos",
new Date().toLocaleString()
);

document.getElementById(
"archivoIngresosActivo"
).innerHTML =

"📂 " + archivo.name;


// =============================
// CALCULAR INGRESOS
// =============================

interesDevengado = 0;
moraReal = 0;
costoDesembolso = 0;
otrosIngresos = 0;

json.forEach(f=>{

interesDevengado +=
parseFloat(
f["Interes Devengado"] ||
f["INTERES DEVENGADO"] ||
0
);

moraReal +=
parseFloat(
f["Mora Real"] ||
f["MORA REAL"] ||
0
);

costoDesembolso +=
parseFloat(
f["Costo por Desembolso"] ||
f["COSTO POR DESEMBOLSO"] ||
0
);

otrosIngresos +=
parseFloat(
f["Otros Ingresos"] ||
f["OTROS INGRESOS"] ||
0
);

});

actualizarResultadoMensual();

guardarResultadoMensualFirebase();

alert(
"✅ Archivo de ingresos cargado correctamente."
);

};

lector.readAsArrayBuffer(
archivo
);

}


// ======================================
// RECUPERAR INGRESOS
// ======================================

function recuperarIngresos(){

let data =
JSON.parse(
localStorage.getItem(
"ingresosMensuales"
)
) || [];

if(data.length==0) return;

ingresosMensuales = data;

interesDevengado = 0;
moraReal = 0;
costoDesembolso = 0;
otrosIngresos = 0;

data.forEach(f=>{

interesDevengado +=
parseFloat(
f["Interes Devengado"] ||
f["INTERES DEVENGADO"] ||
0
);

moraReal +=
parseFloat(
f["Mora Real"] ||
f["MORA REAL"] ||
0
);

costoDesembolso +=
parseFloat(
f["Costo por Desembolso"] ||
f["COSTO POR DESEMBOLSO"] ||
0
);

otrosIngresos +=
parseFloat(
f["Otros Ingresos"] ||
f["OTROS INGRESOS"] ||
0
);

});

let nombre =
localStorage.getItem(
"nombreIngresos"
);

if(
document.getElementById(
"archivoIngresosActivo"
)
){

document.getElementById(
"archivoIngresosActivo"
).innerHTML =

"📂 " +
(nombre || "Sin archivo");

}

}


// ======================================
// TOTAL INGRESOS
// ======================================

function calcularIngresos(){

totalIngresos =

interesDevengado +

moraReal +

costoDesembolso +

otrosIngresos;

return totalIngresos;

}
// =====================================================
// PARTE 3/6
// CARGA DE GASTOS
// =====================================================


// ======================================
// CARGAR EXCEL DE GASTOS
// ======================================

function cargarExcelGastos(){

let archivo =
document.getElementById("excelGastos").files[0];

if(!archivo){

alert("Seleccione el archivo de gastos");

return;

}

let lector =
new FileReader();

lector.onload = function(e){

let data =
new Uint8Array(e.target.result);

let wb =
XLSX.read(data,{type:"array"});

let hoja =
wb.Sheets[
wb.SheetNames[0]
];

let json =
XLSX.utils.sheet_to_json(hoja);

gastosMensuales = json;

localStorage.setItem(
"gastosMensuales",
JSON.stringify(json)
);

localStorage.setItem(
"nombreGastos",
archivo.name
);

localStorage.setItem(
"fechaGastos",
new Date().toLocaleString()
);

document.getElementById(
"archivoGastosActivo"
).innerHTML =

"📂 " + archivo.name;


// =============================
// CALCULAR GASTOS
// =============================

calcularGastos();

actualizarResultadoMensual();

guardarResultadoMensualFirebase();

alert(
"✅ Archivo de gastos cargado correctamente."
);

};

lector.readAsArrayBuffer(
archivo);

}



// ======================================
// RECUPERAR GASTOS
// ======================================

function recuperarGastos(){

let data =
JSON.parse(
localStorage.getItem(
"gastosMensuales"
)
) || [];

if(data.length==0) return;

gastosMensuales = data;

let nombre =
localStorage.getItem(
"nombreGastos"
);

if(
document.getElementById(
"archivoGastosActivo"
)
){

document.getElementById(
"archivoGastosActivo"
).innerHTML =

"📂 " +
(nombre || "Sin archivo");

}

calcularGastos();

}



// ======================================
// CALCULAR TOTAL DE EGRESOS
// ======================================

function calcularGastos(){

totalEgresos = 0;

gastosMensuales.forEach(f=>{

Object.keys(f).forEach(col=>{

let valor =
parseFloat(f[col]);

if(!isNaN(valor)){

totalEgresos += valor;

}

});

});

return totalEgresos;

}



// ======================================
// DETALLE DE EGRESOS
// ======================================

function obtenerDetalleGastos(){

let detalle = [];

gastosMensuales.forEach(f=>{

Object.keys(f).forEach(col=>{

let valor =
parseFloat(f[col]);

if(!isNaN(valor) && valor>0){

detalle.push({

concepto:col,

monto:valor

});

}

});

});

return detalle;

}



// ======================================
// TOTAL GENERAL
// ======================================

function calcularResultado(){

calcularIngresos();

calcularGastos();

utilidadOperativa =

totalIngresos -

totalEgresos;

utilidadNeta =
utilidadOperativa;

if(totalIngresos>0){

margenOperativo =

(
(utilidadOperativa /
totalIngresos)
*100
).toFixed(2);

margenNeto =

(
(utilidadNeta /
totalIngresos)
*100
).toFixed(2);

}else{

margenOperativo = 0;

margenNeto = 0;

}

}



// ======================================
// RECUPERAR TODO
// ======================================

function recuperarResultadoMensual(){

recuperarIngresos();

recuperarGastos();

actualizarResultadoMensual();

}

// =====================================================
// PARTE 4/6
// ACTUALIZAR RESULTADO MENSUAL
// =====================================================


// ======================================
// ACTUALIZAR DASHBOARD
// ======================================

function actualizarResultadoMensual(){

// Recalcular resultados

calcularResultado();


// ===============================
// TARJETAS PRINCIPALES
// ===============================

if(document.getElementById("rmIngresos")){

document.getElementById("rmIngresos").innerHTML=

"S/ "+totalIngresos.toLocaleString();

}

if(document.getElementById("rmEgresos")){

document.getElementById("rmEgresos").innerHTML=

"S/ "+totalEgresos.toLocaleString();

}

if(document.getElementById("rmOperativa")){

document.getElementById("rmOperativa").innerHTML=

"S/ "+utilidadOperativa.toLocaleString();

}

if(document.getElementById("rmNeta")){

document.getElementById("rmNeta").innerHTML=

"S/ "+utilidadNeta.toLocaleString();

}


// ===============================
// DETALLE INGRESOS
// ===============================

if(document.getElementById("rmInteres")){

document.getElementById("rmInteres").innerHTML=

"S/ "+interesDevengado.toLocaleString();

}

if(document.getElementById("rmMora")){

document.getElementById("rmMora").innerHTML=

"S/ "+moraReal.toLocaleString();

}

if(document.getElementById("rmCosto")){

document.getElementById("rmCosto").innerHTML=

"S/ "+costoDesembolso.toLocaleString();

}

if(document.getElementById("rmOtros")){

document.getElementById("rmOtros").innerHTML=

"S/ "+otrosIngresos.toLocaleString();

}


// ===============================
// COLORES SEGÚN UTILIDAD
// ===============================

if(document.getElementById("rmOperativa")){

if(utilidadOperativa>=0){

document.getElementById("rmOperativa").style.color="#16a34a";

}else{

document.getElementById("rmOperativa").style.color="#dc2626";

}

}

if(document.getElementById("rmNeta")){

if(utilidadNeta>=0){

document.getElementById("rmNeta").style.color="#16a34a";

}else{

document.getElementById("rmNeta").style.color="#dc2626";

}

}


// ===============================
// MÁRGENES
// ===============================

if(totalIngresos>0){

margenOperativo=

((utilidadOperativa/

totalIngresos)*100)

.toFixed(2);

margenNeto=

((utilidadNeta/

totalIngresos)*100)

.toFixed(2);

}else{

margenOperativo=0;

margenNeto=0;

}


// ===============================
// FECHA ACTUALIZACIÓN
// ===============================

localStorage.setItem(

"fechaResultadoMensual",

new Date().toLocaleString()

);


// ===============================
// SINCRONIZAR FIREBASE
// ===============================

if(typeof guardarResultadoMensualFirebase==="function"){

guardarResultadoMensualFirebase();

}

}



// ======================================
// REFRESCAR
// ======================================

function refrescarResultadoMensual(){

recuperarIngresos();

recuperarGastos();

actualizarResultadoMensual();

}



// ======================================
// LIMPIAR DATOS
// ======================================

function limpiarResultadoMensual(){

localStorage.removeItem("ingresosMensuales");

localStorage.removeItem("gastosMensuales");

localStorage.removeItem("nombreIngresos");

localStorage.removeItem("nombreGastos");

localStorage.removeItem("fechaIngresos");

localStorage.removeItem("fechaGastos");

ingresosMensuales=[];

gastosMensuales=[];

interesDevengado=0;

moraReal=0;

costoDesembolso=0;

otrosIngresos=0;

totalIngresos=0;

totalEgresos=0;

utilidadOperativa=0;

utilidadNeta=0;

margenOperativo=0;

margenNeto=0;

actualizarResultadoMensual();

}



// ======================================
// CARGA AUTOMÁTICA
// ======================================

window.addEventListener("load",()=>{

if(document.getElementById("resumenResultadoMensual")){

recuperarResultadoMensual();

}

});
// =====================================================
// PARTE 5/6
// FIREBASE RESULTADO MENSUAL
// =====================================================


// ======================================
// GUARDAR EN FIREBASE
// ======================================

function guardarResultadoMensualFirebase(){

if(typeof db==="undefined") return;

let datos={

ingresos:totalIngresos,

egresos:totalEgresos,

utilidadOperativa:utilidadOperativa,

utilidadNeta:utilidadNeta,

interesDevengado:interesDevengado,

moraReal:moraReal,

costoDesembolso:costoDesembolso,

otrosIngresos:otrosIngresos,

margenOperativo:margenOperativo,

margenNeto:margenNeto,

nombreIngresos:
localStorage.getItem("nombreIngresos")||"",

nombreGastos:
localStorage.getItem("nombreGastos")||"",

fechaIngresos:
localStorage.getItem("fechaIngresos")||"",

fechaGastos:
localStorage.getItem("fechaGastos")||"",

fechaActualizacion:
new Date().toLocaleString()

};

db.ref("resultadoMensual")
.set(datos)

.then(()=>{

console.log(
"✅ Resultado Mensual sincronizado"
);

})

.catch(error=>{

console.error(
"Firebase:",
error
);

});

}



// ======================================
// CARGAR DESDE FIREBASE
// ======================================

function cargarResultadoMensualFirebase(){

if(typeof db==="undefined") return;

db.ref("resultadoMensual")

.once("value")

.then(snapshot=>{

let datos=snapshot.val();

if(!datos) return;


// ==============================
// RESTAURAR VARIABLES
// ==============================

totalIngresos=
Number(datos.ingresos)||0;

totalEgresos=
Number(datos.egresos)||0;

utilidadOperativa=
Number(datos.utilidadOperativa)||0;

utilidadNeta=
Number(datos.utilidadNeta)||0;

interesDevengado=
Number(datos.interesDevengado)||0;

moraReal=
Number(datos.moraReal)||0;

costoDesembolso=
Number(datos.costoDesembolso)||0;

otrosIngresos=
Number(datos.otrosIngresos)||0;

margenOperativo=
Number(datos.margenOperativo)||0;

margenNeto=
Number(datos.margenNeto)||0;


// ==============================
// ARCHIVOS
// ==============================

if(document.getElementById(
"archivoIngresosActivo"
)){

document.getElementById(
"archivoIngresosActivo"
).innerHTML=

"📂 "+(
datos.nombreIngresos||

"Sin archivo"

);

}


if(document.getElementById(
"archivoGastosActivo"
)){

document.getElementById(
"archivoGastosActivo"
).innerHTML=

"📂 "+(
datos.nombreGastos||

"Sin archivo"

);

}


// ==============================
// ACTUALIZAR PANTALLA
// ==============================

if(document.getElementById("rmIngresos")){

document.getElementById(
"rmIngresos"
).innerHTML=

"S/ "+

totalIngresos.toLocaleString();

}


if(document.getElementById("rmEgresos")){

document.getElementById(
"rmEgresos"
).innerHTML=

"S/ "+

totalEgresos.toLocaleString();

}


if(document.getElementById("rmOperativa")){

document.getElementById(
"rmOperativa"
).innerHTML=

"S/ "+

utilidadOperativa.toLocaleString();

}


if(document.getElementById("rmNeta")){

document.getElementById(
"rmNeta"
).innerHTML=

"S/ "+

utilidadNeta.toLocaleString();

}


if(document.getElementById("rmInteres")){

document.getElementById(
"rmInteres"
).innerHTML=

"S/ "+

interesDevengado.toLocaleString();

}


if(document.getElementById("rmMora")){

document.getElementById(
"rmMora"
).innerHTML=

"S/ "+

moraReal.toLocaleString();

}


if(document.getElementById("rmCosto")){

document.getElementById(
"rmCosto"
).innerHTML=

"S/ "+

costoDesembolso.toLocaleString();

}


if(document.getElementById("rmOtros")){

document.getElementById(
"rmOtros"
).innerHTML=

"S/ "+

otrosIngresos.toLocaleString();

}


if(document.getElementById(
"rmMargenOperativo"
)){

document.getElementById(
"rmMargenOperativo"
).innerHTML=

margenOperativo+" %";

}


if(document.getElementById(
"rmMargenNeto"
)){

document.getElementById(
"rmMargenNeto"
).innerHTML=

margenNeto+" %";

}

console.log(
"✅ Resultado Mensual cargado desde Firebase"
);

});

}



// ======================================
// SINCRONIZAR AL INICIAR
// ======================================

window.addEventListener("load",()=>{

setTimeout(()=>{

cargarResultadoMensualFirebase();

},1000);

});
