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

localStorage.setItem(
"metasKPI",
JSON.stringify(json)
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

resumen += `
<hr>

<b>👤 ${asesor}</b><br>

💰 Colocación:
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

};

lector.readAsArrayBuffer(
archivo
);

}
