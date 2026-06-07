// =====================
// KPI CREDICOMPANY
// =====================

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

let totalClientes =
json.length;

let resumen = `
<div class="card">
<h3>📊 Resumen KPI</h3>

<p>👥 Total Clientes:
<b>${totalClientes}</b></p>

</div>
`;

document.getElementById(
"kpiResumen"
).innerHTML = resumen;

};

lector.readAsArrayBuffer(
archivo
);

}
