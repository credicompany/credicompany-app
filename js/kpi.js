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
        <hr>

        <b>👤 ${asesor}</b><br>

${colorEstado}
${porcentajeDesembolso >= 100 ? "META CUMPLIDA" :
porcentajeDesembolso >= 80 ? "EN RUTA" :
"BAJO META"}<br>

🎯 Meta Desembolsos:
S/ ${metaDesembolso.toLocaleString()}<br>

💰 Desembolsos:
S/ ${colocacion.toFixed(2)}<br>

📊 Cumplimiento Desembolso:
${porcentajeDesembolso}%<br>

🎯 Meta Operaciones:
${metaOperaciones}<br>

📋 Operaciones:
${oper}<br>

📈 Cumplimiento Operaciones:
${porcentajeOperaciones}%<br>

📈 TEM Promedio:
${tem}<br>

👥 Clientes:
${cli}<br>
        `;

    });

    resumen += `</div>`;

    let top =
    Object.entries(ranking)
    .sort((a,b)=>b[1]-a[1]);

    resumen += `
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
