// =====================
// KPI CREDICOMPANY
// =====================

function cargarExcelKPI(){
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

localStorage.setItem(
"metasKPI",
JSON.stringify(json)
);

alert("✅ Metas cargadas correctamente");

};

lector.readAsArrayBuffer(archivo);

}
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

let totalClientes = json.length;

let saldoCapital = 0;
let clientesMora = 0;
let cuotaMoraTotal = 0;

json.forEach(c => {

saldoCapital +=
parseFloat(c["Saldo Capital"]) || 0;

let atraso =
parseFloat(c["Días Retraso"]) || 0;

if(atraso > 0){
clientesMora++;
}

cuotaMoraTotal +=
parseFloat(c["Cuota Mora"]) || 0;

});

let resumen = `
<div class="card">

<h3>📊 KPI Gerencial</h3>

<p>👥 Clientes:
<b>${totalClientes}</b></p>

<p>💰 Saldo Capital:
<b>S/ ${saldoCapital.toFixed(2)}</b></p>

<p>🚨 Clientes en Mora:
<b>${clientesMora}</b></p>

<p>💵 Cuota Mora:
<b>S/ ${cuotaMoraTotal.toFixed(2)}</b></p>

</div>
`;
  let ranking = {};

json.forEach(c => {

let asesor =
c["Asesor(a)"] || "Sin Asesor";

let capital =
parseFloat(c["Saldo Capital"]) || 0;

if(!ranking[asesor]){
ranking[asesor] = 0;
}

ranking[asesor] += capital;

});

let top = Object.entries(ranking)
.sort((a,b)=>b[1]-a[1]);

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

};

lector.readAsArrayBuffer(
archivo
);

}
