// ====================================
// RESULTADO MENSUAL CREDICOMPANY
// ====================================

function cargarResultadoMensual(){

document.getElementById("resumenResultadoMensual").innerHTML = `

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

<h3>💰 Ingresos</h3>

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

<h3>💸 Egresos</h3>

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

<h3>📈 Utilidad Operativa</h3>

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

<h3>🏆 Utilidad Neta</h3>

<h2 id="rmNeta">
S/ 0
</h2>

</div>

</div>

<br>

<div style="
background:white;
padding:20px;
border-radius:15px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h3>Detalle de Ingresos</h3>
<input
type="file"
id="excelGastos"
accept=".xlsx,.xls">

<button
class="btn-verde"
onclick="cargarExcelGastos()">

📂 Cargar Gastos

</button>

<br><br>

<div id="archivoGastosActivo"
style="
background:#e8f5e9;
padding:10px;
border-radius:10px;
font-weight:bold;
margin-bottom:15px;
">

Sin archivos cargados

</div><table style="width:100%;">

<tr>

<td>Interés Devengado</td>

<td align="right">
<b id="rmInteres">
S/0
</b>
</td>

</tr>

<tr>

<td>Mora Real</td>

<td align="right">
<b id="rmMora">
S/0
</b>
</td>

</tr>

<tr>

<td>Costo por Desembolso</td>

<td align="right">
<b id="rmCosto">
S/0
</b>
</td>

</tr>

</table>

</div>

`;
}
// ===============================
// CARGAR EXCEL DE GASTOS
// ===============================
// ===============================
// CARGAR EXCEL DE GASTOS
// ===============================

function cargarExcelGastos(){

let archivo =
document.getElementById("excelGastos").files[0];

if(!archivo){

alert("Seleccione el Excel de gastos");

return;

}

let lector = new FileReader();

lector.onload = function(e){

let data =
new Uint8Array(e.target.result);

let wb =
XLSX.read(data,{type:"array"});

let hoja =
wb.Sheets[wb.SheetNames[0]];

let json =
XLSX.utils.sheet_to_json(hoja);

localStorage.setItem(
"gastosMensuales",
JSON.stringify(json)
);

localStorage.setItem(
"nombreGastosMensuales",
archivo.name
);

localStorage.setItem(
"fechaGastosMensuales",
new Date().toLocaleString()
);

document.getElementById(
"archivoGastosActivo"
).innerHTML =
"📂 " + archivo.name;

alert("✅ Gastos cargados correctamente");

actualizarResultadoMensual();

};

lector.readAsArrayBuffer(archivo);

}


// ===============================
// ACTUALIZAR RESULTADO MENSUAL
// ===============================

function actualizarResultadoMensual(){

let ingresos = 0;
let egresos = 0;

let interesDevengado = 0;
let moraReal = 0;
let costoDesembolso = 0;

// ===== INGRESOS DESDE KPI FINANCIERO =====

let financiero =
JSON.parse(localStorage.getItem("financiero")) || [];

financiero.forEach(f=>{

interesDevengado +=
parseFloat(f["Interes Devengado"]) || 0;

costoDesembolso +=
parseFloat(f["Costo por Desembolso"]) || 0;

});

// ===== MORA REAL =====
// En el siguiente paso la leeremos automáticamente.

moraReal = 0;


// ===== EGRESOS =====

let gastos =
JSON.parse(localStorage.getItem("gastosMensuales")) || [];

gastos.forEach(g=>{

Object.keys(g).forEach(col=>{

let valor =
parseFloat(g[col]);

if(!isNaN(valor)){

egresos += valor;

}

});

});


// ===== TOTALES =====

ingresos =
interesDevengado +
moraReal +
costoDesembolso;

let utilidad =
ingresos - egresos;


// ===== MOSTRAR =====

document.getElementById("rmInteres").innerHTML =
"S/ " + interesDevengado.toLocaleString();

document.getElementById("rmMora").innerHTML =
"S/ " + moraReal.toLocaleString();

document.getElementById("rmCosto").innerHTML =
"S/ " + costoDesembolso.toLocaleString();

document.getElementById("rmIngresos").innerHTML =
"S/ " + ingresos.toLocaleString();

document.getElementById("rmEgresos").innerHTML =
"S/ " + egresos.toLocaleString();

document.getElementById("rmOperativa").innerHTML =
"S/ " + utilidad.toLocaleString();

document.getElementById("rmNeta").innerHTML =
"S/ " + utilidad.toLocaleString();

}
