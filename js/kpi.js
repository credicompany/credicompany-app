// =====================
// KPI CREDICOMPANY
// =====================
function cargarMetasKPI(){

let archivo =
document.getElementById("excelMetas").files[0];

if(!archivo){
alert("Seleccione archivo de metas");
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
  
alert(JSON.stringify(Object.keys(json[0])));
alert(JSON.stringify(json[0]));
console.log(json[0]);
alert(JSON.stringify(Object.keys(json[0])));localStorage.setItem(
"metasKPI",
JSON.stringify(json)
);
localStorage.setItem(
"nombreMetaKPI",
archivo.name
);

localStorage.setItem(
"fechaMetaKPI",
new Date().toLocaleString()
);
alert("✅ Metas cargadas correctamente");

};

lector.readAsArrayBuffer(archivo);

}
function cargarExcelKPI(){
let archivo =
document.getElementById("excelKPI")
.files[0];

if(!archivo){

alert("Seleccione un Excel");
return;

}

let lector = new FileReader();

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
  // GUARDAR PRODUCCIÓN
localStorage.setItem(
   "produccionKPI",
   JSON.stringify(json)
);

localStorage.setItem(
   "nombreProduccionKPI",
   archivo.name
);

localStorage.setItem(
   "fechaProduccionKPI",
   new Date().toLocaleString()
);
let metas =
JSON.parse(
localStorage.getItem("metasKPI")
) || [];let totalClientes = json.length;
  
let montoOtorgadoTotal = 0;
let costoDesembolsoTotal = 0;

json.forEach(c => {

montoOtorgadoTotal +=
parseFloat(c["Monto Otorgado"]) || 0;

costoDesembolsoTotal +=
parseFloat(c["Costo por Desembolso"]) || 0;

});

let resumen = `
<div class="card">

<h3>📊 KPI Gerencial</h3>

<p>👥 Clientes:
<b>${totalClientes}</b></p>

<p>💰 Monto Otorgado:
<b>S/ ${montoOtorgadoTotal.toFixed(2)}</b></p>

<p>💸 Costo Desembolso:
<b>S/ ${costoDesembolsoTotal.toFixed(2)}</b></p>

</div>
`;
let ranking = {};
let operaciones = {};
let temPromedio = {};
let clientes = {};

json.forEach(c => {

let asesor =
(c["Asesor(a)"] || "Sin Asesor")
.trim()
.toUpperCase();

let monto =
parseFloat(c["Monto Otorgado"]) || 0;

let tem =
parseFloat(c["TEM"]) || 0;

let dni =
(c["DNI"] || "").toString();

if(!ranking[asesor]){
ranking[asesor] = 0;
operaciones[asesor] = 0;
temPromedio[asesor] = [];
clientes[asesor] = new Set();
}

ranking[asesor] += monto;

operaciones[asesor]++;

temPromedio[asesor].push(tem);

if(dni){
clientes[asesor].add(dni);
}

});

let top = Object.entries(ranking)
.sort((a,b)=>b[1]-a[1]);
resumen += `
<div class="card">
<h3>🎯 KPI POR ASESOR</h3>
`;

Object.keys(ranking).forEach(asesor=>{

let colocacion =
ranking[asesor];

let oper =
operaciones[asesor];

let tem =
temPromedio[asesor].length
?
(
temPromedio[asesor]
.reduce((a,b)=>a+b,0)
/
temPromedio[asesor].length
).toFixed(2)
:
0;

let cli =
clientes[asesor].size;
let meta = metas.find(m =>

String(
m["Asesor (A)"] ||
m["ASESOR"] ||
""
)
.trim()
.toUpperCase() === asesor

);

let metaDesembolso =
meta
?
parseFloat(
String(
meta["COLOCACION"] ||
meta["COLOC."] ||
0
).replace(/,/g,"")
)
:
0;resumen += `
<hr>

<b>👤 ${asesor}</b><br>

🎯 Meta Desembolsos:
S/ ${metaDesembolso.toLocaleString()}<br>

💰 Desembolsos:
S/ ${colocacion.toFixed(2)}<br>

📋 Operaciones:
${oper}<br>

📈 TEM Promedio:
${tem}<br>

👥 Clientes:
${cli}<br>
`;

});

resumen += `</div>`;
resumen += `
<div class="card">

<h3>🏆 Ranking Cartera</h3>
`;

top.forEach(r => {

resumen += `
<p>
${r[0]}
:
S/ ${r[1].toFixed(2)}
</p>
`;

});

resumen += `</div>`;
document.getElementById(
"kpiResumen"
).innerHTML = resumen;
  
localStorage.setItem(
"resumenKPI",
resumen
);
};

lector.readAsArrayBuffer(
archivo
);

}
window.addEventListener("load",()=>{

let div =
document.getElementById("metaActivaKPI");

// META ACTIVA
let nombre =
localStorage.getItem("nombreMetaKPI");

let fecha =
localStorage.getItem("fechaMetaKPI");

if(div && nombre){

div.innerHTML =
`📅 Meta vigente: ${nombre}<br>
🕒 Cargada: ${fecha}`;

}

// PRODUCCIÓN ACTIVA
let nombreProd =
localStorage.getItem("nombreProduccionKPI");

let fechaProd =
localStorage.getItem("fechaProduccionKPI");

if(div && nombreProd){

div.innerHTML +=
`<br><br>
📂 Producción vigente: ${nombreProd}<br>
🕒 Cargada: ${fechaProd}`;

}

// KPI GUARDADO
let resumenGuardado =
localStorage.getItem("resumenKPI");

if(
resumenGuardado &&
document.getElementById("kpiResumen")
){

document.getElementById(
"kpiResumen"
).innerHTML = resumenGuardado;

}

});
