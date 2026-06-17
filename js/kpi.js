// =====================
// KPI CREDICOMPANY
// =====================

function cargarMetasKPI() {

    let archivo =
    document.getElementById("excelMetas").files[0];

    if (!archivo) {
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
    document.getElementById("excelKPI").files[0];

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
        wb.Sheets[wb.SheetNames[0]];

        let json =
        XLSX.utils.sheet_to_json(hoja);

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

        generarKPI(json);

    };

    lector.readAsArrayBuffer(archivo);

}


function generarKPI(json){

    let metas =
    JSON.parse(
        localStorage.getItem("metasKPI")
    ) || [];

    let totalClientes = json.length;

  let montoOtorgadoTotal = 0;
let costoDesembolsoTotal = 0;

json.forEach(c=>{

    montoOtorgadoTotal +=
    parseFloat(c["Monto Otorgado"]) || 0;
let atraso =
parseFloat(c["Dias de retraso"]) || 0;
    let costo =
    parseFloat(c["Costo por Desembolso"]) || 0;

   let fechaDesembolso =
String(
c["Fecha Desembolso"] || ""
);

let partes =
fechaDesembolso.split("/");

let fecha =
new Date(
parseInt(partes[2]),
parseInt(partes[1]) - 1,
parseInt(partes[0])
);
console.log(
fechaDesembolso,
fecha,
costo
);

let hoy =
new Date();
    if(
        fecha.getMonth() === hoy.getMonth()
        &&
        fecha.getFullYear() === hoy.getFullYear()
    ){

        costoDesembolsoTotal += costo;

    }

});

    let totalOperaciones = json.length;
let metaEmpresa = 0;

metas.forEach(m=>{

   metaEmpresa +=
   parseFloat(
      String(
         m["COLOCACION"] ||
         m["COLOC."] ||
         0
      ).replace(/,/g,"")
   ) || 0;

});
let avanceEmpresa =
metaEmpresa > 0
?
((montoOtorgadoTotal / metaEmpresa) * 100)
.toFixed(1)
:
0;
let temGeneral =
0;

json.forEach(c=>{

   temGeneral +=
   parseFloat(c["TEM"]) || 0;

});

temGeneral =
totalClientes > 0
?
(temGeneral / totalClientes).toFixed(2)
:
0;

let resumen = `

<h3 style="
text-align:center;
margin-bottom:15px;
">
📊 KPI GERENCIAL
</h3>

<div style="
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:10px;
">
<div style="
background:#0d6efd;
color:white;
padding:6px;
border-radius:8px;
text-align:center;
min-height:55px;
">
<div style="font-size:16px;">👥</div>
<div style="font-size:11px;">Clientes</div>
<div style="font-size:15px;font-weight:bold;">
${totalClientes}
</div>
</div>

<div style="
background:#198754;
color:white;
padding:6px;
border-radius:8px;
text-align:center;
min-height:55px;
">
<div style="font-size:16px;">💰</div>
<div style="font-size:11px;">Colocación</div>
<div style="font-size:15px;font-weight:bold;">
S/ ${(montoOtorgadoTotal/1000).toFixed(0)}K
</div>
</div>

<div style="
background:#fd7e14;
color:white;
padding:6px;
border-radius:8px;
text-align:center;
min-height:55px;
">
<div style="font-size:16px;">📋</div>
<div style="font-size:11px;">Operaciones</div>
<div style="font-size:15px;font-weight:bold;">
${totalOperaciones}
</div>
</div>

<div style="
background:#6f42c1;
color:white;
padding:6px;
border-radius:8px;
text-align:center;
min-height:55px;
">
<div style="font-size:16px;">📈</div>
<div style="font-size:11px;">TEM</div>
<div style="font-size:15px;font-weight:bold;">
${temGeneral}%
</div>
</div>
<div style="
background:#dc2626;
color:white;
padding:6px;
border-radius:8px;
text-align:center;
min-height:55px;
">
<div style="font-size:16px;">🎯</div>
<div style="font-size:11px;">
Meta Empresa
</div>
<div style="
font-size:15px;
font-weight:bold;
">
${avanceEmpresa}%
</div>
</div>
</div>
`;

    let ranking = {};
    let operaciones = {};
    let temPromedio = {};
    let clientes = {};

    json.forEach(c => {

        let asesor =
        (c["Asesor(a)"] || "SIN ASESOR")
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
let top =
Object.entries(ranking)
.sort((a,b)=>b[1]-a[1]);

let mejorAsesor =
top.length > 0
?
top[0]
:
null;

if(mejorAsesor){

resumen += `

<div style="
background:linear-gradient(
135deg,
#f59e0b,
#fbbf24
);
color:white;
padding:12px;
border-radius:12px;
margin-bottom:12px;
box-shadow:0 4px 10px rgba(0,0,0,.15);
">

<div style="
font-size:18px;
font-weight:bold;
">
⭐ MEJOR ASESOR
</div>

<div style="
font-size:22px;
font-weight:bold;
margin-top:5px;
">
${mejorAsesor[0]}
</div>

<div style="
font-size:18px;
margin-top:4px;
">
💰 S/${mejorAsesor[1].toLocaleString()}
</div>

</div>
`;

}
    resumen += `
    <div class="card">
  <h4 style="
margin:5px 0;
font-size:14px;
">
🎯 KPI POR ASESOR
</h4>
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

        let meta =
        metas.find(m =>

            String(
                m["Asesor (A)"] ||
                m["ASESOR"] ||
                ""
            )
            .trim()
            .toUpperCase()
            .replace(/\s+/g,"")

            ===

            asesor
            .trim()
            .toUpperCase()
            .replace(/\s+/g,"")

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
        0;

        let metaOperaciones =
        meta
        ?
        parseFloat(
            String(
                meta["OPERACIONES"] || 0
            ).replace(/,/g,"")
        )
        :
        0;
        let porcentajeOperaciones =
metaOperaciones > 0
?
((oper / metaOperaciones) * 100).toFixed(1)
:
0;
let porcentajeDesembolso =
metaDesembolso > 0
?
((colocacion / metaDesembolso) * 100).toFixed(1)
:
0;

let colorEstado = "🔴";

if(Number(porcentajeDesembolso) >= 100){

   colorEstado = "🟢";

}
else if(Number(porcentajeDesembolso) >= 80){

   colorEstado = "🟡";

}

resumen += `
<div class="item"
onclick="toggleKPI('${asesor}')"
style="
background:white;
padding:8px;
margin:6px 0;
border-radius:10px;
box-shadow:0 1px 4px rgba(0,0,0,.08);
font-size:12px;
cursor:pointer;
">

<div style="
background:
${Number(porcentajeDesembolso)>=100
? '#22c55e'
: Number(porcentajeDesembolso)>=80
? '#facc15'
: '#ef4444'};
color:white;
padding:6px 10px;
margin:-8px -8px 8px -8px;
border-radius:10px 10px 0 0;
font-weight:bold;
font-size:14px;
">
${colorEstado} ${asesor}
</div>
<br>

<div style="
display:flex;
justify-content:space-between;
font-size:14px;
font-weight:bold;
">

<span>
💰 S/${Math.round(colocacion/1000)}K
</span>

<span>
📊 ${porcentajeDesembolso}%
</span>

</div>

<br>

<span style="
color:#0d6efd;
font-size:11px;
font-weight:bold;
">
▼ Ver detalle
</span>

<br>
<div
id="detalle_${asesor}"
style="
display:none;
margin-top:8px;
font-size:12px;
">

🎯 Meta Desembolso:
S/${metaDesembolso.toLocaleString()}

<br>

💰 Real:
S/${colocacion.toLocaleString()}

<br>

📊 Cumplimiento:
${porcentajeDesembolso}%

<br>

🎯 Meta Operaciones:
${metaOperaciones}

<br>

📋 Operaciones:
${oper}

<br>

📈 TEM:
${tem}%

<br>

👥 Clientes:
${cli}

</div>
</div>
`;
    });

    resumen += `</div>`;
let rankingKPIHTML = "";

top.slice(0,5).forEach((r,index)=>{

let medalla="🥉";

if(index===0) medalla="🥇";
if(index===1) medalla="🥈";

rankingKPIHTML += `
<div style="
font-size:11px;
line-height:1.2;
margin:2px 0;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
">

${medalla}
${r[0].substring(0,8)}
→ S/${Math.round(r[1]/1000)}K

</div>
`;

});

localStorage.setItem(
"rankingKPIHTML",
rankingKPIHTML
);

if(document.getElementById("rankingKPI")){
document.getElementById("rankingKPI").innerHTML =
rankingKPIHTML;
}    

document.getElementById(
    "kpiResumen"
).innerHTML = resumen;

localStorage.setItem(
    "resumenKPI",
    resumen
);

// 🔥 FIREBASE KPI
db.ref("kpiGerencial").set({

    resumen: resumen,
    rankingKPIHTML: rankingKPIHTML,
    nombreMeta:
    localStorage.getItem("nombreMetaKPI") || "",

    fechaMeta:
    localStorage.getItem("fechaMetaKPI") || "",

    nombreProduccion:
    localStorage.getItem("nombreProduccionKPI") || "",

    fechaProduccion:
    localStorage.getItem("fechaProduccionKPI") || "",

    fechaActualizacion:
    new Date().toLocaleString()

});

}

function toggleKPI(asesor){

    let detalle =
    document.getElementById(
        "detalle_" + asesor
    );

    if(!detalle) return;

    if(detalle.style.display==="none"){

        detalle.style.display="block";

    }else{

        detalle.style.display="none";

    }

}
window.addEventListener("load",()=>{

    let div =
    document.getElementById("metaActivaKPI");

    let nombre =
    localStorage.getItem("nombreMetaKPI");

    let fecha =
    localStorage.getItem("fechaMetaKPI");

    if(div && nombre){

        div.innerHTML =
        `📅 Meta vigente: ${nombre}<br>
        🕒 Cargada: ${fecha}`;

    }

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

    let resumenGuardado =
    localStorage.getItem("resumenKPI");

    if(
        resumenGuardado &&
        document.getElementById("kpiResumen")
    ){

        document.getElementById(
            "kpiResumen"
        ).innerHTML =
        resumenGuardado;

    }
// KPI FINANCIERO
let financieroGuardado =
localStorage.getItem("financiero");

if(financieroGuardado){

mostrarResumenFinanciero();

}
    let nombreFinanciero =
localStorage.getItem(
"nombreFinanciero"
);

if(
document.getElementById(
"archivoFinancieroActivo"
)
){

document.getElementById(
"archivoFinancieroActivo"
).innerHTML =

"📂 Archivo vigente: " +
(nombreFinanciero || "Sin archivo");

}
    });
function cargarExcelFinanciero(){

let archivo =
document.getElementById(
"excelFinanciero"
).files[0];

if(!archivo){

alert(
"Seleccione archivo financiero"
);

return;

}

let lector =
new FileReader();

lector.onload = function(e){

let data =
new Uint8Array(
e.target.result
);

let wb =
XLSX.read(
data,
{type:"array"}
);

let hoja =
wb.Sheets[
wb.SheetNames[0]
];

let json =
XLSX.utils
.sheet_to_json(hoja);
console.log(json[0]);
alert(
json.slice(0,20)
.map(x=>x["Producto"])
.join("\n")
);alert(
Object.keys(json[0]).join("\n")
);
localStorage.setItem(
"financiero",
JSON.stringify(json)
);
localStorage.setItem(
"nombreFinanciero",
archivo.name
);
    localStorage.setItem(
"fechaFinanciero",
new Date().toLocaleString()
);
alert(
"✅ Excel financiero cargado"
);

mostrarResumenFinanciero();

};

lector.readAsArrayBuffer(
archivo
);

}

function mostrarResumenFinanciero(){

let data =
JSON.parse(
localStorage.getItem(
"financiero"
)
) || [];

let carteraTotal = 0;
let capitalVencido = 0;
let moraPorcentaje = 0;
let clientesCriticos = 0;
let rentabilidad = 0;
let rankingCartera = {};
let carteraProducto = {};
let vencidoProducto = {};
let clientesProducto = {};
let costoDesembolsoTotal = 0;
let rankingAsesores = {};
data.forEach(c=>{

let saldo =
parseFloat(c["Saldo Capital"]) || 0;
let asesor =
(c["Asesor(a)"] || "SIN ASESOR")
.toString()
.trim()
.toUpperCase();
let producto =
(c["Producto"] || "SIN PRODUCTO")
.toString()
.trim()
.toUpperCase();
let dni =
(c["DNI"] || "")
.toString()
.trim();

if(!clientesProducto[producto]){
clientesProducto[producto] = new Set();
}

if(dni){
clientesProducto[producto].add(dni);
}
if(!carteraProducto[producto]){
carteraProducto[producto] = 0;
}

carteraProducto[producto] += saldo;
if(!rankingCartera[asesor]){
rankingCartera[asesor] = 0;
}

rankingCartera[asesor] += saldo;
if(!vencidoProducto[producto]){
vencidoProducto[producto] = 0;
}

if(atraso > 0){
vencidoProducto[producto] += saldo;
}
let interes =
parseFloat(c["Interes Devengado"]) || 0;

rentabilidad += interes;
let costo =
parseFloat(c["Costo por Desembolso"]) || 0;

let fechaDesembolso =
String(
c["Fecha Desembolso"] || ""
);

let partes =
fechaDesembolso.split("/");

let fecha =
new Date(
parseInt(partes[2]),
parseInt(partes[1]) - 1,
parseInt(partes[0])
);

let hoy =
new Date();
console.log(
"FECHA:",
fechaDesembolso,
" COSTO:",
costo
);if(
fecha.getMonth() === hoy.getMonth()
&&
fecha.getFullYear() === hoy.getFullYear()
){

    costoDesembolsoTotal += costo;

}
carteraTotal += saldo;
if(!rankingAsesores[asesor]){

rankingAsesores[asesor] = 0;

}

rankingAsesores[asesor] += saldo;
if(atraso > 0){

capitalVencido += saldo;

}
if(atraso > 30){

clientesCriticos++;

}
});
let rankingHTML = "";

Object.entries(rankingAsesores)

.sort((a,b)=>b[1]-a[1])

.slice(0,5)

.forEach((r,index)=>{

let medalla = "🥉";

if(index===0) medalla="🥇";
if(index===1) medalla="🥈";

rankingHTML += `

<div style="
padding:5px;
font-size:14px;
font-weight:bold;
">

${medalla}
${r[0]}
→
S/${r[1].toLocaleString()}

</div>

`;

});
moraPorcentaje =
carteraTotal > 0
?
((capitalVencido / carteraTotal) * 100).toFixed(2)
:
0;
let topCartera =
Object.entries(rankingCartera)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);
let moraProductoHTML = "";
let rankingProductoHTML = "";
Object.entries(carteraProducto)
.sort((a,b)=>b[1]-a[1])
.forEach(r=>{

let cantidadClientes =
clientesProducto[r[0]]
?
clientesProducto[r[0]].size
:
0;
let participacion =
carteraTotal > 0
?
((r[1] / carteraTotal) * 100).toFixed(1)
:
0;
rankingProductoHTML += `
<div style="
background:#f8f9fa;
padding:8px;
margin:5px 0;
border-radius:8px;
">

<b>💰 ${r[0]}</b><br>

👥 ${cantidadClientes} clientes<br>

💵 S/${r[1].toLocaleString()}<br>

📈 ${participacion}%

</div>
`;

});
Object.entries(carteraProducto)
.sort((a,b)=>b[1]-a[1])
.forEach(r=>{

let cartera =
r[1];

let vencido =
vencidoProducto[r[0]] || 0;

let mora =
cartera > 0
?
((vencido / cartera) * 100).toFixed(1)
:
0;

let color =
mora <= 5
? "#198754"
: mora <= 10
? "#ffc107"
: "#dc3545";

moraProductoHTML += `
<div style="
background:${color};
color:white;
padding:8px;
margin:5px 0;
border-radius:8px;
">

<b>${r[0]}</b><br>

📊 Cartera:
S/${cartera.toLocaleString()}<br>

🚨 Vencido:
S/${vencido.toLocaleString()}<br>

📉 Mora:
${mora}%

</div>
`;

});
let rankingCarteraHTML = "";

topCartera.forEach((r,index)=>{

let medalla = "🥉";

if(index===0) medalla="🥇";
if(index===1) medalla="🥈";

rankingCarteraHTML += `
<div style="
font-size:15px;
margin:5px 0;
">
${medalla}
${r[0]}
→ S/${r[1].toLocaleString()}
</div>
`;

});
document.getElementById(
"resumenFinanciero"
).innerHTML =

`
<div style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:10px;
">

<div style="
background:#198754;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">💰</div>
<div>Cartera Total</div>
<div style="font-size:22px;font-weight:bold;">
S/${carteraTotal.toLocaleString()}
</div>
</div>

<div style="
background:#dc3545;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">💵</div>
<div>Capital Vencido</div>
<div style="font-size:22px;font-weight:bold;">
S/${capitalVencido.toLocaleString()}
</div>
</div>
<div style="
background:#0d6efd;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">💸</div>
<div>Costo Desembolso</div>
<div style="font-size:22px;font-weight:bold;">
S/${costoDesembolsoTotal.toLocaleString()}
</div>
</div>
<div style="
background:${
moraPorcentaje <= 5
? '#198754'
: moraPorcentaje <= 10
? '#ffc107'
: '#dc3545'
};
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">📉</div>
<div>% Mora</div>
<div style="font-size:22px;font-weight:bold;">
${moraPorcentaje}%
</div>
</div>
<div style="
background:${
clientesCriticos <= 20
? '#198754'
: clientesCriticos <= 50
? '#ffc107'
: '#dc3545'
};
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">🚨</div>
<div>Clientes +30</div>
<div style="font-size:22px;font-weight:bold;">
${clientesCriticos}
</div>
</div>
<div style="
background:#0d6efd;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">
<div style="font-size:28px;">📈</div>
<div>Rentabilidad</div>
<div style="font-size:22px;font-weight:bold;">
S/${rentabilidad.toLocaleString()}
</div>
</div>
</div>

<div style="
background:white;
padding:15px;
border-radius:12px;
margin-top:15px;
">

<h3 style="
text-align:center;
margin-bottom:10px;
color:black;
">
🏆 Ranking Cartera
</h3>
${rankingCarteraHTML}
<hr style="margin:10px 0;">

<h3 style="
text-align:center;
color:black;
">
📊 Cartera por Producto
</h3>

${rankingProductoHTML}
<hr style="margin:15px 0;">

<h3 style="
text-align:center;
color:black;
">
📉 Mora por Producto
</h3>

${moraProductoHTML}
</div>
`;

}
