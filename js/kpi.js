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

    json.forEach(c => {

        montoOtorgadoTotal +=
        parseFloat(c["Monto Otorgado"]) || 0;

        costoDesembolsoTotal +=
        parseFloat(c["Costo por Desembolso"]) || 0;

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
grid-template-columns:repeat(2,1fr);
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
top =
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
style="
border-left:4px solid ${
Number(porcentajeDesembolso)>=100
? "#28a745"
: Number(porcentajeDesembolso)>=80
? "#ffc107"
: "#dc3545"
};
">

<b style="font-size:13px;">
${colorEstado} ${asesor}
</b>

<br>

🎯 Meta: S/${(metaDesembolso/1000).toFixed(0)}K
&nbsp;&nbsp;
💰 Real: S/${(colocacion/1000).toFixed(0)}K

<br>

📊 Cumpl.: ${porcentajeDesembolso}%
<div style="
background:#e5e7eb;
height:6px;
border-radius:10px;
overflow:hidden;
margin-top:2px;
margin-bottom:4px;
">

<div style="
width:${Math.min(porcentajeDesembolso,100)}%;
height:100%;
background:
${Number(porcentajeDesembolso)>=100
? '#22c55e'
: Number(porcentajeDesembolso)>=80
? '#facc15'
: '#ef4444'};
">
</div>

</div>
<div style="
background:#e5e7eb;
height:6px;
border-radius:10px;
overflow:hidden;
margin-top:3px;
margin-bottom:3px;
">
<div style="
width:${Math.min(porcentajeDesembolso,100)}%;
height:100%;
background:
${porcentajeDesembolso>=100 ? '#22c55e' :
porcentajeDesembolso>=80 ? '#facc15' :
'#ef4444'};
">
</div>
</div>
&nbsp;&nbsp;
📋 ${oper}/${metaOperaciones}

<br>

👥 ${cli}
&nbsp;&nbsp;
📈 TEM ${tem}

</div>
`;
    });

    resumen += `</div>`;

    let top =
    Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1]);
    let mejorAsesor =
top.length > 0
?
top[0]
:
null;
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
}    resumen += `
    <div class="card">

     <h3 style="
background:#0d6efd;
color:white;
padding:10px;
border-radius:8px;
text-align:center;
">
🏆 Ranking de Colocación
</h3>
    `;

    let puesto = 1;

top.forEach(r => {

   let icono = "🏅";

   if(puesto == 1) icono = "🥇";
   if(puesto == 2) icono = "🥈";
   if(puesto == 3) icono = "🥉";

   resumen += `

   <div style="
      background:#f8f9fa;
      border-left:6px solid #0d6efd;
      padding:10px;
      margin:8px 0;
      border-radius:8px;
      box-shadow:0 2px 4px rgba(0,0,0,0.10);
   ">

      <b style="font-size:18px;">
         ${icono} #${puesto}
      </b>

      <br>

      <span style="
         font-size:16px;
         font-weight:bold;
         color:#1f2937;
      ">
         ${r[0]}
      </span>

      <br>

      <span style="
         color:green;
         font-size:18px;
         font-weight:bold;
      ">
         S/ ${r[1].toLocaleString()}
      </span>

   </div>
   `;

   puesto++;

});

    resumen += `</div>`;

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

});
