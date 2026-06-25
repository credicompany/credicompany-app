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
