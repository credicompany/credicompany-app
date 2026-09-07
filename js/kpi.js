// =====================
// KPI CREDICOMPANY
// =====================
// ======================================================
// MÓDULO KPI CREDICOMPANY
// ======================================================
//
// 1. Funciones Generales
// 2. KPI Gerencial
// 3. KPI Financiero
// 4. Firebase
// 5. Eventos
// 6. Carga de Excel
//
// ======================================================

// ======================================================
// KPI GERENCIAL
// ======================================================
function generarKPI(json){

    let totalClientesActual = 0;
    let totalClientesAgosto = 0;

    const usuarios =
    JSON.parse(
        localStorage.getItem("usuarios")
    ) || [];

    const clientesHistorico = {};

// ======================================
// KPI GERENCIAL
// DETECCIÓN AUTOMÁTICA DEL MES
// ======================================

const jsonGeneral = [...json];

let ultimaFecha = null;

jsonGeneral.forEach(c=>{

    let fechaExcel =
    Number(c["Fecha Desembolso"]);

    if(!isNaN(fechaExcel)){

        let fecha =
        new Date(
            (fechaExcel-25569)*
            86400*1000
        );

        if(
            !ultimaFecha ||
            fecha>ultimaFecha
        ){
            ultimaFecha=fecha;
        }

    }

});

// ========================================
// CLIENTES ACUMULADOS HASTA EL MES ACTUAL
// ========================================
// Cuenta clientes únicos por asesor.
// Incluye todos los desembolsos hasta agosto.
// Un cliente con varios créditos cuenta UNA sola vez.
// ========================================

jsonGeneral.forEach(c => {

    let asesor =
        String(c["Asesor(a)"] || "")
        .trim()
        .toUpperCase();

    let codigoCliente =
        String(
            c["Cod Cliente"] ||
            c["DNI"] ||
            c["dni"] ||
            ""
        )
        .trim()
        .toUpperCase();

    if(!asesor || !codigoCliente){
        return;
    }

    if(!clientesHistorico[asesor]){
        clientesHistorico[asesor] = new Set();
    }

    clientesHistorico[asesor].add(codigoCliente);

});

console.log(
    "CLIENTES ACUMULADOS POR ASESOR:",
    Object.fromEntries(
        Object.entries(clientesHistorico)
        .map(([asesor, set]) => [
            asesor,
            set.size
        ])
    )
);

console.log(
    "TOTAL CLIENTES ACUMULADOS:",
    Object.values(clientesHistorico)
    .reduce(
        (total, clientes) =>
            total + clientes.size,
        0
    )
);
    

if(!ultimaFecha){

    alert(
    "No existe ninguna fecha válida."
    );

    return;

}

const meses=[
"Enero","Febrero","Marzo","Abril",
"Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre",
"Noviembre","Diciembre"
];

const indiceMes =
ultimaFecha.getUTCMonth();

const anioActual =
ultimaFecha.getUTCFullYear();

const mesActual =
meses[indiceMes];

const mesAnterior =
meses[(indiceMes+11)%12];

json=jsonGeneral.filter(c=>{

    let fechaExcel=
    Number(c["Fecha Desembolso"]);

    if(isNaN(fechaExcel))
    return false;

    let fecha=
    new Date(
        (fechaExcel-25569)*
        86400*1000
    );

    return(

        fecha.getUTCMonth()
        ===
        indiceMes

        &&

        fecha.getUTCFullYear()
        ===
        anioActual

    );

});

console.log(
"KPI:",
mesActual,
json.length,
"REGISTROS"
);let metas =
JSON.parse(
    localStorage.getItem("metasKPI")
) || [];

console.log(
"REGISTROS MES ACTUAL:",
json.length
);
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
console.log(
"COSTO:",
c["Costo por Desembolso"]
);  

costoDesembolsoTotal += costo;
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
let temGeneral = 0;

json.forEach(c=>{

    temGeneral +=
    parseFloat(
        String(c["TEM"] || 0)
        .replace(",",".")
    ) || 0;

});

temGeneral =
totalClientes > 0
?
(temGeneral / totalClientes).toFixed(2)
:
0;

// ==========================================
// TABLERO GERENCIAL - RESUMEN EJECUTIVO
// ==========================================

let estadoMeta =
    Number(avanceEmpresa) >= 100
    ? "CUMPLIDO"
    : Number(avanceEmpresa) >= 80
    ? "EN RIESGO"
    : "CRÍTICO";

let colorMeta =
    Number(avanceEmpresa) >= 100
    ? "#16A34A"
    : Number(avanceEmpresa) >= 80
    ? "#F59E0B"
    : "#DC2626";

let resumen = `

<div style="
    width:100%;
    margin-bottom:18px;
">

<!-- =========================================
     CABECERA EJECUTIVA
     ========================================= -->

<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    margin-bottom:16px;
    padding:4px 4px 12px 4px;
">

    <div>

        <div style="
            font-size:26px;
            font-weight:800;
            color:#0A3A63;
            letter-spacing:.2px;
        ">
            🎯 KPI POR ASESOR
        </div>

        <div style="
            font-size:13px;
            color:#64748B;
            margin-top:3px;
        ">
            Desempeño y evolución de la cartera
            al mes de ${mesActual.toUpperCase()} ${anioActual}
        </div>

    </div>

    <div style="
        background:#F1F7FC;
        border-radius:12px;
        padding:10px 16px;
        text-align:left;
        min-width:190px;
    ">

        <div style="
            font-size:11px;
            color:#64748B;
        ">
            📅 Última actualización
        </div>

        <div style="
            font-size:13px;
            font-weight:800;
            color:#0A3A63;
            margin-top:2px;
        ">
            ${localStorage.getItem("fechaProduccionKPI")
              || new Date().toLocaleString("es-PE")}
        </div>

    </div>

</div>


<!-- =========================================
     TABLA KPI
     ========================================= -->

<div style="
    overflow-x:auto;
    width:100%;
    border-radius:12px;
">

<table style="
    width:100%;
    min-width:1450px;
    border-collapse:separate;
    border-spacing:0;
    font-size:14px;
    text-align:center;
    overflow:hidden;
">

<thead>

<tr style="
    background:#0A3A63;
    color:white;
">

<th style="padding:10px 8px;">ASESOR</th>

<th style="padding:10px 8px;">META<br>COLOCACIÓN</th>

<th style="padding:10px 8px;">AVANCE</th>

<th style="padding:10px 8px;">%<br>AVANCE</th>

<th style="padding:10px 8px;">META<br>OPERACIONES</th>

<th style="padding:10px 8px;">AVANCE</th>

<th style="padding:10px 8px;">% AVANCE<br>OPER</th>

<th style="padding:10px 8px;">
CLIENTES<br>${mesAnterior.toUpperCase()}
</th>

<th style="padding:10px 8px;">
CLIENTES<br>${mesActual.toUpperCase()}
</th>

<th style="padding:10px 8px;">
VARIACIÓN
</th>

<th style="padding:10px 8px;">
TEM<br>${mesAnterior.toUpperCase()}
</th>

<th style="padding:10px 8px;">
TEM<br>${mesActual.toUpperCase()}
</th>

<th style="padding:10px 8px;">
MORA<br>${mesAnterior.toUpperCase()}
</th>

<th style="padding:10px 8px;">
MORA<br>${mesActual.toUpperCase()}
</th>

<th style="padding:10px 8px;">
MORA<br>${mesActual.toUpperCase()} 9+
</th>

<th style="padding:10px 8px;">
MORA<br>${mesActual.toUpperCase()} 1+
</th>

<th style="padding:10px 8px;">
ESTADO
</th>

</tr>

</thead>

<tbody>
`;
// ==========================
// MORA ACTUAL (TODA LA CARTERA)
// ==========================

let moraActualAsesor = {};
let mora1MasAsesor = {};

jsonGeneral.forEach(c=>{

    let asesor =
    (c["Asesor(a)"] || "")
    .toString()
    .trim()
    .toUpperCase();

    let atraso =
    parseFloat(c["Dias de retraso"] || 0) || 0;

    let saldo =
    parseFloat(c["Saldo Capital"] || 0) || 0;

    if(!moraActualAsesor[asesor]){
        moraActualAsesor[asesor] = 0;
    }

    if(atraso >= 9){
    moraActualAsesor[asesor] += saldo;
}
    
if(atraso >= 1){
    mora1MasAsesor[asesor] =
        (mora1MasAsesor[asesor] || 0) + saldo;
}
});   
 // =========================================
// TOTALES EMPRESA
// =========================================

let totalMetaColocacion = 0;
let totalAvanceColocacion = 0;

let totalMetaOperaciones = 0;
let totalAvanceOperaciones = 0;

let totalClientesJulio = 0;

let totalMoraJulio = 0;
let totalMoraAgosto = 0;
let totalMoraAgosto1Mas = 0;

let sumaTemJulio = 0;
let sumaTemAgosto = 0;
let cantidadTemJulio = 0;
let cantidadTemAgosto = 0;   
 metas.forEach(meta=>{

   let asesor =
String(meta["Asesor (A)"] || "")
.trim()
.toUpperCase();

let metaAsesor = metas.find(m => {

    let nombreMeta =
    String(
        m["Asesor (A)"] ||
        m["ASESOR"] ||
        ""
    )
    .trim()
    .toUpperCase()
    .replace(/\s+/g,"");

    let nombreAsesor =
    asesor
    .trim()
    .toUpperCase()
    .replace(/\s+/g,"");

    return nombreMeta === nombreAsesor;

});

    //=========================================
    // FUNCIONES AUXILIARES
    //=========================================

    const normalizar = texto =>
        String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/\s+/g," ")
        .trim()
        .toUpperCase();

    //=========================================
    // META DEL ASESOR
    //=========================================
    function buscarColumna(tipo,mes){

        if(!meta) return null;

        return Object.keys(meta).find(col=>{

            let nombre =
            col
            .toUpperCase()
            .replace(/\s+/g," ")
            .trim();

            return(
                nombre.includes(tipo.toUpperCase())
                &&
                nombre.includes(mes.toUpperCase())
            );

        });

    }

    //=========================================
    // VARIABLES
    //=========================================

   let colocacion = ranking[asesor] || 0;
let oper = operaciones[asesor] || 0;
     
    let tem =
temPromedio[asesor] && temPromedio[asesor].length
?
(
temPromedio[asesor]
.reduce((a,b)=>a+b,0)
/
temPromedio[asesor].length
).toFixed(2)
:
0;

    //=========================================
    // CLIENTES
    //=========================================

  let clientesActual =
    clientesHistorico[asesor]
    ?
    clientesHistorico[asesor].size
    :
    0;

    let colClientes =
    buscarColumna(
        "CLIENTES",
        mesAnterior
    );

    let clientesAnterior =
    colClientes
    ?
    Number(meta[colClientes] || 0)
    :
    0;

    let variacionClientes =
    clientesActual - clientesAnterior;

    let colorVariacion = "#64748B";

    if(variacionClientes>0){

        colorVariacion="#16A34A";

    }else if(variacionClientes<0){

        colorVariacion="#DC2626";

    }

    //=========================================
    // TEM HISTÓRICO
    //=========================================

    let temAnterior=0;

    let colTEM=
    buscarColumna(
        "TEM",
        mesAnterior
    );

    if(colTEM){

        temAnterior=
        parseFloat(
            String(meta[colTEM])
            .replace(/,/g,"")
        )||0;

    }

    //=========================================
    // MORA HISTÓRICA
    //=========================================

    let moraAnterior=0;

    let colMora=
    buscarColumna(
        "MORA",
        mesAnterior
    );

    if(colMora){

        moraAnterior=
        parseFloat(
            String(meta[colMora])
            .replace(/,/g,"")
        )||0;

    }

    let moraActual =
    moraActualAsesor[asesor] || 0;

     let mora1Mas =
mora1MasAsesor[asesor] || 0;

    //=========================================
    // METAS
    //=========================================

    let metaDesembolso =
    meta
    ?
    Number(
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
    Number(
        String(
            meta["OPERACIONES"] || 0
        ).replace(/,/g,"")
    )
    :
    0;

    //=========================================
    // PORCENTAJES
    //=========================================

    let porcentajeDesembolso =
    metaDesembolso>0
    ?
    ((colocacion/metaDesembolso)*100).toFixed(1)
    :
    0;

    let porcentajeOperaciones =
    metaOperaciones>0
    ?
    ((oper/metaOperaciones)*100).toFixed(1)
    :
    0;

    let colorEstado="🔴";

    if(Number(porcentajeDesembolso)>=100){

        colorEstado="🟢";

    }else if(Number(porcentajeDesembolso)>=80){

        colorEstado="🟡";

    }

    //=========================================
    // TABLA
    //=========================================

  //=========================================
// FILA KPI DEL ASESOR
//=========================================

resumen += `

<tr style="
    border-bottom:1px solid #E2E8F0;
    background:#FFFFFF;
">

<td style="
    padding:8px;
    font-weight:800;
    color:#0F2742;
">
    ${asesor}
</td>


<td style="padding:8px;">
    S/${Math.round(metaDesembolso).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-weight:700;
">
    S/${Math.round(colocacion).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-weight:800;
    background:${
        Number(porcentajeDesembolso)>=100
        ? "#22C55E"
        : Number(porcentajeDesembolso)>=80
        ? "#FDE68A"
        : "#FECACA"
    };
    color:${
        Number(porcentajeDesembolso)>=100
        ? "#FFFFFF"
        : Number(porcentajeDesembolso)>=80
        ? "#92400E"
        : "#B91C1C"
    };
">
    ${porcentajeDesembolso}%
</td>


<td style="padding:8px;">
    ${metaOperaciones}
</td>


<td style="
    padding:8px;
    font-weight:700;
">
    ${oper}
</td>


<td style="
    padding:8px;
    font-weight:800;
    background:${
        Number(porcentajeOperaciones)>=100
        ? "#22C55E"
        : Number(porcentajeOperaciones)>=80
        ? "#FACC15"
        : "#EF4444"
    };
    color:white;
">
    ${porcentajeOperaciones}%
</td>


<td style="
    padding:8px;
    font-weight:700;
    color:#334155;
">
    ${clientesAnterior}
</td>


<td style="
    padding:8px;
    font-weight:800;
    background:#F0F7FF;
    color:#0A3A63;
    border-left:1px solid #D8E6F2;
    border-right:1px solid #D8E6F2;
">
    ${clientesActual}
</td>


<td style="
    padding:8px;
    font-size:15px;
    font-weight:900;
    color:${colorVariacion};
">
    ${variacionClientes > 0 ? "+" : ""}
    ${variacionClientes}
</td>


<td style="padding:8px;">
    ${Number(temAnterior).toFixed(1)}%
</td>


<td style="
    padding:8px;
    font-weight:700;
">
    ${Number(tem).toFixed(1)}%
</td>


<td style="padding:8px;">
    S/${Math.round(Number(moraAnterior)).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-weight:700;
    color:#DC2626;
">
    S/${Math.round(Number(moraActual)).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-weight:800;
    color:#DC2626;
">
    S/${Math.round(Number(moraActual)).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-weight:800;
    color:#DC2626;
">
    S/${Math.round(Number(mora1Mas)).toLocaleString("es-PE")}
</td>


<td style="
    padding:8px;
    font-size:18px;
">
    ${colorEstado}
</td>

</tr>

`;

// =========================================
// ACUMULAR TOTALES EMPRESA
// =========================================

totalMetaColocacion += Number(metaDesembolso) || 0;
totalAvanceColocacion += Number(colocacion) || 0;

totalMetaOperaciones += Number(metaOperaciones) || 0;
totalAvanceOperaciones += Number(oper) || 0;

totalClientesJulio += Number(clientesAnterior) || 0;
totalClientesAgosto += Number(clientesActual) || 0;

totalMoraJulio += Number(moraAnterior) || 0;
totalMoraAgosto += Number(moraActual) || 0;
totalMoraAgosto1Mas += Number(mora1Mas) || 0;

if(Number(temAnterior) > 0){

    sumaTemJulio += Number(temAnterior);
    cantidadTemJulio++;

}

if(Number(tem) > 0){

    sumaTemAgosto += Number(tem);
    cantidadTemAgosto++;

}
     }); 
    
// =========================================
// TOTAL EMPRESA
// =========================================

let totalVariacionClientes =
totalClientesAgosto - totalClientesJulio;

let porcentajeTotalColocacion =
totalMetaColocacion > 0
?
(
    totalAvanceColocacion /
    totalMetaColocacion *
    100
).toFixed(1)
:
0;

let porcentajeTotalOperaciones =
totalMetaOperaciones > 0
?
(
    totalAvanceOperaciones /
    totalMetaOperaciones *
    100
).toFixed(1)
:
0;

let temTotalJulio =
cantidadTemJulio > 0
?
(
    sumaTemJulio /
    cantidadTemJulio
).toFixed(1)
:
0;

let temTotalAgosto =
cantidadTemAgosto > 0
?
(
    sumaTemAgosto /
    cantidadTemAgosto
).toFixed(1)
:
0;

let colorTotalVariacion =
totalVariacionClientes > 0
?
"#16A34A"
:
totalVariacionClientes < 0
?
"#DC2626"
:
"#64748B";

resumen += `

<tr style="
    background:#E8F2FA;
    font-weight:800;
    border-top:3px solid #0A3A63;
">

<td style="
    padding:10px;
    color:#0A3A63;
">
    TOTAL<br>EMPRESA
</td>

<td>
    S/${Math.round(totalMetaColocacion)
        .toLocaleString("es-PE")}
</td>

<td>
    S/${Math.round(totalAvanceColocacion)
        .toLocaleString("es-PE")}
</td>

<td>
    ${porcentajeTotalColocacion}%
</td>

<td>
    ${totalMetaOperaciones}
</td>

<td>
    ${totalAvanceOperaciones}
</td>

<td>
    ${porcentajeTotalOperaciones}%
</td>

<td>
    ${totalClientesJulio}
</td>

<td style="
    color:#0A3A63;
    font-size:15px;
">
    ${totalClientesAgosto}
</td>

<td style="
    color:${colorTotalVariacion};
    font-size:15px;
">
    ${totalVariacionClientes > 0 ? "+" : ""}
    ${totalVariacionClientes}
</td>

<td>
    ${temTotalJulio}%
</td>

<td>
    ${temTotalAgosto}%
</td>

<td>
    S/${Math.round(totalMoraJulio)
        .toLocaleString("es-PE")}
</td>

<td>
    S/${Math.round(totalMoraAgosto)
        .toLocaleString("es-PE")}
</td>

<td>
    S/${Math.round(totalMoraAgosto)
        .toLocaleString("es-PE")}
</td>

<td>
    S/${Math.round(totalMoraAgosto1Mas)
        .toLocaleString("es-PE")}
</td>

<td>
    🏢
</td>

</tr>

</tbody>

</table>

</div>
`;
    resumen += `
</table>
</div>
`;
resumen += `

<!-- =========================================
     RESUMEN EJECUTIVO
     ========================================= -->

<div style="
    display:grid;
    grid-template-columns:
        repeat(auto-fit,minmax(220px,1fr));
    gap:14px;
    margin-top:18px;
">


<!-- CLIENTES -->

<div style="
    background:#F2F8FF;
    border:1px solid #D9EAF7;
    border-radius:14px;
    padding:16px 18px;
">

<div style="
    font-size:12px;
    font-weight:700;
    color:#0A3A63;
">
    👥 CLIENTES ${mesActual.toUpperCase()}
</div>

<div style="
    font-size:30px;
    font-weight:900;
    color:#0A3A63;
    margin-top:4px;
">
    ${totalClientesAgosto}
</div>

<div style="
    margin-top:5px;
    font-size:12px;
    color:${colorTotalVariacion};
    font-weight:800;
">
    ${totalVariacionClientes > 0 ? "↑ +" : "↓ "}
    ${Math.abs(totalVariacionClientes)}
    vs ${mesAnterior}
</div>

</div>


<!-- COLOCACIÓN -->

<div style="
    background:#F1FBF5;
    border:1px solid #D8F0E0;
    border-radius:14px;
    padding:16px 18px;
">

<div style="
    font-size:12px;
    font-weight:700;
    color:#16A34A;
">
    💰 COLOCACIÓN
</div>

<div style="
    font-size:30px;
    font-weight:900;
    color:#0A3A63;
    margin-top:4px;
">
    S/${Math.round(montoOtorgadoTotal)
        .toLocaleString("es-PE")}
</div>

<div style="
    margin-top:7px;
    height:7px;
    background:#DDE8E1;
    border-radius:10px;
    overflow:hidden;
">

<div style="
    width:${Math.min(Number(avanceEmpresa),100)}%;
    height:100%;
    background:#16A34A;
">
</div>

</div>

<div style="
    margin-top:6px;
    font-size:12px;
    color:#475569;
">
    ${avanceEmpresa}% de la meta
</div>

</div>


<!-- OPERACIONES -->

<div style="
    background:#F7F4FF;
    border:1px solid #E7DFFF;
    border-radius:14px;
    padding:16px 18px;
">

<div style="
    font-size:12px;
    font-weight:700;
    color:#4F46E5;
">
    📋 OPERACIONES
</div>

<div style="
    font-size:30px;
    font-weight:900;
    color:#0A3A63;
    margin-top:4px;
">
    ${totalOperaciones}
</div>

<div style="
    margin-top:7px;
    height:7px;
    background:#E5E0F3;
    border-radius:10px;
    overflow:hidden;
">

<div style="
    width:${Math.min(
        Number(porcentajeTotalOperaciones),
        100
    )}%;
    height:100%;
    background:#7C3AED;
">
</div>

</div>

<div style="
    margin-top:6px;
    font-size:12px;
    color:#475569;
">
    ${porcentajeTotalOperaciones}% de la meta
</div>

</div>


<!-- MORA -->

<div style="
    background:#FFF5F5;
    border:1px solid #F8DADA;
    border-radius:14px;
    padding:16px 18px;
">

<div style="
    font-size:12px;
    font-weight:700;
    color:#DC2626;
">
    ⚠️ MORA TOTAL 1+
</div>

<div style="
    font-size:30px;
    font-weight:900;
    color:#DC2626;
    margin-top:4px;
">
    S/${Math.round(totalMoraAgosto1Mas)
        .toLocaleString("es-PE")}
</div>

<div style="
    margin-top:5px;
    font-size:12px;
    color:#DC2626;
    font-weight:800;
">
    Comparativo contra ${mesAnterior}
</div>

</div>

</div>
`;    

    resumen += `

<!-- =========================================
     INSIGHTS + PRÓXIMOS PASOS
     ========================================= -->

<div style="
    display:grid;
    grid-template-columns:
        repeat(auto-fit,minmax(320px,1fr));
    gap:14px;
    margin-top:14px;
">


<!-- INSIGHTS -->

<div style="
    background:#F8FAFC;
    border:1px solid #E2E8F0;
    border-radius:14px;
    padding:16px 20px;
">

<div style="
    font-size:16px;
    font-weight:800;
    color:#0A3A63;
    margin-bottom:8px;
">
    💡 INSIGHTS
</div>

<div style="
    font-size:13px;
    line-height:1.8;
    color:#475569;
">

<div>
• 🏆 Mejor desempeño:
<strong>${top[0] ? top[0][0] : "-"}</strong>
</div>

<div>
• 👥 Variación de clientes:
<strong style="color:${colorTotalVariacion};">
${totalVariacionClientes > 0 ? "+" : ""}
${totalVariacionClientes}
</strong>
</div>

<div>
• 💰 Cumplimiento de colocación:
<strong>${avanceEmpresa}%</strong>
</div>

<div>
• 📋 Cumplimiento de operaciones:
<strong>${porcentajeTotalOperaciones}%</strong>
</div>

<div>
• ⚠️ Mora 1+:
<strong>
S/${Math.round(totalMoraAgosto1Mas)
    .toLocaleString("es-PE")}
</strong>
</div>

</div>

</div>


<!-- PRÓXIMOS PASOS -->

<div style="
    background:#F8FAFC;
    border:1px solid #E2E8F0;
    border-radius:14px;
    padding:16px 20px;
">

<div style="
    font-size:16px;
    font-weight:800;
    color:#0A3A63;
    margin-bottom:8px;
">
    🎯 PRÓXIMOS PASOS
</div>

<div style="
    font-size:13px;
    line-height:1.8;
    color:#475569;
">

<div>
• Reforzar gestión de asesores con avance
<strong>&lt; 80%</strong>.
</div>

<div>
• Revisar asesores con variación negativa
de clientes.
</div>

<div>
• Priorizar recuperación de cartera con
mora 1+.
</div>

<div>
• Dar seguimiento diario a colocación y operaciones.
</div>

</div>

</div>

</div>

</div>
`;
let rankingKPIHTML = "";
top
.filter(([asesor]) =>
    asesor.toUpperCase() !== "ADMIN"
)
.slice(0,10)
.forEach((r,index)=>{

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
→ S/${Number(r[1]).toLocaleString("es-PE")}

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
guardarGerencialFirebase(
    resumen,
    rankingKPIHTML
);


}

// ======================================================
// FIREBASE KPI GERENCIAL
// ======================================================
function guardarGerencialFirebase(
    resumen,
    rankingKPIHTML
){

    db.ref("kpiGerencial").set({

        resumen,
        rankingKPIHTML,

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

    })

    .then(()=>{

        console.log(
            "✅ KPI GERENCIAL FIREBASE"
        );

    })

    .catch(error=>{

        console.error(
            "❌ ERROR KPI GERENCIAL",
            error
        );

    });

}

function cargarGerencialFirebase(){

    db.ref("kpiGerencial")
    .once("value")
    .then(snapshot=>{

        const datos = snapshot.val();
console.log("================================");
console.log("GERENCIAL FIREBASE");
console.log(datos);
console.log("================================");
        if(!datos) return;

      if(datos.fechaProduccion){

    const fechaCargaProduccion =
    new Date().toLocaleString("es-PE");

localStorage.setItem(
    "fechaProduccionKPI",
    fechaCargaProduccion
);

}

       console.log("RESUMEN GERENCIAL:", datos.resumen);

const divResumen = document.getElementById("kpiResumen");

console.log("DIV KPI:", divResumen);

if(divResumen){

    divResumen.innerHTML = datos.resumen || "";

}

        if(
            datos.rankingKPIHTML &&
            document.getElementById("rankingKPI")
        ){

            document.getElementById(
                "rankingKPI"
            ).innerHTML =
            datos.rankingKPIHTML;

        }

        console.log(
            "✅ KPI GERENCIAL DESDE FIREBASE"
        );

    })

    .catch(error=>{

        console.error(
            "❌ ERROR CARGANDO KPI GERENCIAL",
            error
        );

    });

}
// ======================================================
// FIREBASE KPI FINANCIERO
// ======================================================

function cargarFinancieroFirebase(){

    db.ref("kpiFinanciero")
    .once("value")
    .then(snapshot=>{

        const datos = snapshot.val();
        const divFinanciero = document.getElementById("resumenFinanciero");

        if(datos){

            // Restaurar datos del Excel
            if(datos.datos){

                localStorage.setItem(
                    "financiero",
                    JSON.stringify(datos.datos)
                );

                mostrarResumenFinanciero();

            }
            // Si no existen datos, mostrar el HTML guardado
            else if(divFinanciero){

                divFinanciero.innerHTML = datos.html || "";

            }

            console.log("✅ KPI FINANCIERO DESDE FIREBASE");

        }
        else{

            let financieroGuardado =
            localStorage.getItem("financiero");

            if(financieroGuardado){

                mostrarResumenFinanciero();

            }

        }

    })
    .catch(error=>{

        console.error(
            "❌ ERROR CARGANDO KPI FINANCIERO",
            error
        );

    });

}
// ======================================================
// FUNCIONES GENERALES
// ======================================================
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
function mostrarPanel(panel){

let resumen =
document.getElementById("panelResumen");

let asesores =
document.getElementById("panelAsesores");

let rentabilidad =
document.getElementById("panelRentabilidad");

let clientes =
document.getElementById("panelClientes");

if(resumen)
resumen.style.display="none";

if(asesores)
asesores.style.display="none";

if(rentabilidad)
rentabilidad.style.display="none";

if(clientes)
clientes.style.display="none";

if(panel==="resumen")
resumen.style.display="block";

if(panel==="asesores")
asesores.style.display="block";

if(panel==="rentabilidad")
rentabilidad.style.display="block";

if(panel==="clientes")
clientes.style.display="block";

}
// ======================================================
// ARCHIVOS ACTIVOS
// ======================================================

function mostrarArchivosActivos(){

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

    let nombreFinanciero =
    localStorage.getItem("nombreFinanciero");

    let archivo =
    document.getElementById(
        "archivoFinancieroActivo"
    );

    if(archivo){

        archivo.innerHTML =
        "📂 Archivo vigente: " +
        (nombreFinanciero || "Sin archivo");

    }

}
// ======================================================
// INICIALIZACIÓN
// ======================================================
window.addEventListener("load", iniciarKPI);

function iniciarKPI(){
mostrarArchivosActivos();
    // KPI GERENCIAL
cargarGerencialFirebase();
// KPI FINANCIERO
cargarFinancieroFirebase();
    
}  
// ======================================================
// KPI FINANCIERO
// ======================================================
function cargarExcelFinanciero(){

    let archivo =
    document.getElementById(
        "excelFinanciero"
    ).files[0];

    if(!archivo){

        alert("Seleccione el archivo financiero.");

        return;

    }

    let lector =
    new FileReader();

    lector.onload = function(e){

        try{

            const data =
            new Uint8Array(
                e.target.result
            );

            const wb =
            XLSX.read(
                data,
                {type:"array"}
            );

            const hoja =
            wb.Sheets[
                wb.SheetNames[0]
            ];

            const json =
            XLSX.utils.sheet_to_json(
                hoja
            );

            console.log(
                "📊 REGISTROS FINANCIEROS:",
                json.length
            );

            if(!json.length){

                alert(
                    "❌ El Excel no contiene datos."
                );

                return;

            }

            // =====================================
            // GUARDAR DATOS LOCALMENTE
            // =====================================

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

            // =====================================
            // ACTUALIZAR NOMBRE DEL ARCHIVO
            // =====================================

            const archivoActivo =
            document.getElementById(
                "archivoFinancieroActivo"
            );

            if(archivoActivo){

                archivoActivo.innerHTML =
                    "📂 Archivo vigente: " +
                    archivo.name;

            }

            // =====================================
            // MOSTRAR KPI NUEVO
            // =====================================

            mostrarResumenFinanciero();

            // =====================================
            // GUARDAR DATOS COMPLETOS EN FIREBASE
            // =====================================

            guardarDatosFinancieros(json);

            // =====================================
            // GUARDAR RESUMEN EN FIREBASE
            // =====================================

            setTimeout(() => {

                guardarFinancieroFirebase();

            },1000);

            alert(
                "✅ Excel financiero cargado y actualizado correctamente."
            );

        }catch(error){

            console.error(
                "❌ ERROR CARGANDO EXCEL FINANCIERO:",
                error
            );

            alert(
                "❌ Error al cargar el Excel financiero. Revise la consola."
            );

        }

    };

    lector.readAsArrayBuffer(
        archivo
    );

}
function guardarFinancieroFirebase(){

db.ref("kpiFinanciero").update({

archivo:
localStorage.getItem("nombreFinanciero") || "",

fecha:
localStorage.getItem("fechaFinanciero") || "",

actualizacion:
new Date().toLocaleString(),

html:
document.getElementById(
"resumenFinanciero"
).innerHTML

})
.then(()=>{

console.log(
"✅ KPI FINANCIERO FIREBASE"
);

})
.catch(error=>{

console.error(
"❌ FIREBASE ERROR",
error
);

});

}

function guardarDatosFinancieros(datos){

    // ==========================================
    // LIMPIAR COLUMNAS PARA FIREBASE
    // ==========================================

    const datosLimpios = datos.map(fila => {

        const nuevaFila = {};

        Object.keys(fila).forEach(clave => {

            const claveLimpia =
                String(clave)
                .replace(/\./g, "")
                .replace(/#/g, "")
                .replace(/\$/g, "")
                .replace(/\//g, "")
                .replace(/\[/g, "")
                .replace(/\]/g, "")
                .trim();

            nuevaFila[claveLimpia] = fila[clave];

        });

        return nuevaFila;

    });

    db.ref("kpiFinanciero/datos")
    .set(datosLimpios)

    .then(() => {

        console.log(
            "✅ Datos financieros guardados:",
            datosLimpios.length
        );

    })

    .catch(error => {

        console.error(
            "❌ Error guardando datos financieros:",
            error
        );

    });

}
function mostrarResumenFinanciero(){
let data =
JSON.parse(
localStorage.getItem(
"financiero"
)
) || [];

const esMovil = window.innerWidth <= 768;
    
let carteraTotal = 0;
let capitalVencido = 0;
let moraTotal = 0;
let carteraSana = 0;
let moraPorcentaje = 0;
let clientesCriticos = 0;
let rentabilidad = 0;
let rankingCartera = {};
let carteraProducto = {};
let vencidoProducto = {};
let clientesProducto = {};
let costoDesembolsoTotal = 0;
let registrosMes = 0;
let rankingAsesores = {};
let rentabilidadAsesor = {};
let clientesAsesor = {};
let moraAsesor = {};
let vencidoAsesor = {};
    let ultimaFecha = null;

data.forEach(c=>{
let fechaValor = c["Fecha Desembolso"];

let fecha = null;

if(typeof fechaValor === "number"){

    fecha = new Date(
        (fechaValor - 25569) * 86400 * 1000
    );

}else{

    fecha = new Date(fechaValor);

}

if(!isNaN(fecha.getTime())){

    if(!ultimaFecha || fecha > ultimaFecha){

        ultimaFecha = fecha;

    }

}


});
if(!ultimaFecha){

alert(
"No se encontró ninguna fecha de desembolso válida"
);

return;

}
    let mesConsulta =
ultimaFecha.getUTCMonth();

let anioConsulta =
ultimaFecha.getUTCFullYear();
  console.log(
"ULTIMA FECHA:",
ultimaFecha
);


console.log(
"MES DETECTADO:",
mesConsulta + 1
);

console.log(
"AÑO DETECTADO:",
anioConsulta
);
data.forEach(c=>{

let saldo =
parseFloat(c["Saldo Capital"]) || 0;

let atraso =
parseFloat(c["Dias de retraso"]) || 0;

if(atraso >= 1){

    moraTotal += saldo;

}
let asesor =
(c["Asesor(a)"] || "SIN ASESOR")
.toString()
.trim()
.toUpperCase();
if(!moraAsesor[asesor]){
    moraAsesor[asesor] = 0;
}

if(!vencidoAsesor[asesor]){
    vencidoAsesor[asesor] = 0;
}

if(atraso > 30){

    moraAsesor[asesor] += saldo;

}
let producto =
(c["Producto"] || "SIN PRODUCTO")
.toString()
.trim()
.toUpperCase();
let dni =
(c["DNI"] || "")
.toString()
.trim();
if(!clientesAsesor[asesor]){
clientesAsesor[asesor] = new Set();
}

if(dni){
clientesAsesor[asesor].add(dni);
}
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
if(atraso > 30){

vencidoAsesor[asesor] += saldo;

}
let interes =
parseFloat(c["Interes Devengado"]) || 0;

rentabilidad += interes;
    if(!rentabilidadAsesor[asesor]){
    rentabilidadAsesor[asesor] = 0;
}

rentabilidadAsesor[asesor] += interes;
let costo =
parseFloat(c["Costo por Desembolso"]) || 0;

let fechaExcel =
parseFloat(c["Fecha Desembolso"]);

if(!isNaN(fechaExcel)){

let fecha =
new Date(
Date.UTC(
1899,
11,
30 + fechaExcel
)
);

if(
fecha.getUTCMonth() === mesConsulta
&&
fecha.getUTCFullYear() === anioConsulta
){

costoDesembolsoTotal += costo;
registrosMes++;

console.log(
"SUMANDO:",
fecha,
"COSTO:",
costo,
"ACUMULADO:",
costoDesembolsoTotal
);

}

}

carteraTotal += saldo;
if(!rankingAsesores[asesor]){

rankingAsesores[asesor] = 0;

}

rankingAsesores[asesor] += saldo;

   if(atraso > 30){

capitalVencido += saldo;

}else{

carteraSana += saldo;

}
if(atraso > 30){

clientesCriticos++;

}
});
console.log(
Object.keys(rankingAsesores)
);
let rankingHTML = "";

Object.entries(rankingAsesores)
.filter(([asesor]) =>
    asesor.toLowerCase() !== "admin"
)

.sort((a,b)=>b[1]-a[1])

.slice(0,7)

.forEach((r,index)=>{

let medalla = "🥉";

if(index===0) medalla="🥇";
if(index===1) medalla="🥈";

let cantidadClientes =
clientesAsesor[r[0]]
?
clientesAsesor[r[0]].size
:
0;

let ticket =
cantidadClientes > 0
?
(r[1] / cantidadClientes)
:
0;

rankingHTML += `

<div style="
background:white;
padding:12px;
margin:6px 0;
border-radius:12px;
border:1px solid #E5E7EB;
font-size:14px;
font-weight:500;
box-shadow:0 1px 4px rgba(0,0,0,.04);
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
">

<span>
${medalla}
<b>${r[0]}</b>
</span>

<span>
👥 ${cantidadClientes}
</span>

<span>
💰 ${Math.round(r[1]/1000)}K
</span>

<span>
🎯 ${Math.round(ticket)}
</span>

</div>

`;

});
    console.log(
"TOTAL COSTO DESEMBOLSO:",
costoDesembolsoTotal
);
    console.log(
"REGISTROS FINANCIEROS:",
data.length
);
    console.log(
"REGISTROS MES:",
registrosMes
);
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
background:white;
padding:12px;
border-radius:12px;
border:1px solid #F1F5F9;
margin:6px 0;
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
font-size:14px;
">

<span>
💰 <b>${r[0]}</b>
</span>

<span>
👥 ${cantidadClientes}
</span>

<span>
💵 ${Math.round(r[1]/1000)}K
</span>

<span>
📈 ${participacion}%
</span>

</div>

`;

});
Object.entries(carteraProducto)
.sort((a,b)=>b[1]-a[1])
.forEach(r=>{
let cantidadClientes =
clientesProducto[r[0]]
?
clientesProducto[r[0]].size
:
0;
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

let fondo =
mora <= 5
? "#F0FDF4"
: mora <= 10
? "#FFFBEB"
: "#FEF2F2";

let borde =
mora <= 5
? "#22C55E"
: mora <= 10
? "#F59E0B"
: "#EF4444";
moraProductoHTML += `
<div
onclick="mostrarDetalleProducto('${r[0]}')"
style="
background:${fondo};
color:#1F2937;
border-left:5px solid ${borde};
padding:14px;
margin:10px 0;
border-radius:12px;
box-shadow:0 2px 8px rgba(0,0,0,.05);
cursor:pointer;
transition:.25s;
">
<div style="
font-size:18px;
font-weight:700;
margin-bottom:8px;
">
${r[0]}
</div>

👥 Clientes: <b>${cantidadClientes}</b><br>

💰 Cartera: <b>S/${cartera.toLocaleString()}</b><br>

📍 Vencido: <b>S/${vencido.toLocaleString()}</b><br>

📉 Mora: <b>${mora}%</b>

</div>
`;
});

let topClientesHTML = "";

let topClientes = [...data]

.sort((a,b)=>

(parseFloat(b["Saldo Capital"]) || 0)

-

(parseFloat(a["Saldo Capital"]) || 0)

)

.slice(0,30);

topClientes.forEach((c,index)=>{

topClientesHTML += `

<div style="
background:white;
padding:10px;
margin:5px 0;
border-radius:10px;
border:1px solid #E5E7EB;
display:flex;
justify-content:space-between;
font-size:13px;
">

<div style="
display:flex;
flex-direction:column;
">

<span style="
font-weight:bold;
">
${index+1}. ${
(
(c["Apellido Paterno"] || "") + " " +
(c["Apellido Materno"] || "") + " " +
(c["Nombre"] || "")
).trim()
}
</span>

<span style="
font-size:11px;
color:#6B7280;
">
👤 ${c["Asesor(a)"] || "SIN ASESOR"}
</span>

<span style="
font-size:11px;
color:#6B7280;
">
📦 ${c["Producto"] || ""}
</span>

</div>

<div style="
text-align:right;
font-weight:bold;
color:#198754;
">
💰 S/${(parseFloat(c["Saldo Capital"]) || 0).toLocaleString()}
</div>

</div>

`;

});
let moraAsesorHTML = "";

Object.keys(moraAsesor)

.forEach(asesor=>{

let cartera =
moraAsesor[asesor] || 0;

let vencido =
vencidoAsesor[asesor] || 0;

let mora =
cartera > 0
?
((vencido / cartera) * 100)
.toFixed(1)
:
0;

moraAsesorHTML += `

<div style="
background:white;
padding:12px;
margin:6px 0;
border-radius:10px;
border:1px solid #E5E7EB;
display:flex;
justify-content:space-between;
font-size:14px;
">

<span>
👨‍💼 ${asesor}
</span>

<span>
📉 ${mora}%
</span>

</div>

`;

});
    let rentabilidadHTML = "";

Object.entries(rentabilidadAsesor)

.sort((a,b)=>b[1]-a[1])

.forEach((r,index)=>{

let medalla = "🏅";

if(index===0) medalla="🥇";
if(index===1) medalla="🥈";
if(index===2) medalla="🥉";

rentabilidadHTML += `

<div style="
background:white;
padding:12px;
margin:6px 0;
border-radius:10px;
border:1px solid #E5E7EB;
display:flex;
justify-content:space-between;
font-size:14px;
">

<span>
${medalla} ${r[0]}
</span>

<span>
💰 S/${Math.round(r[1]).toLocaleString()}
</span>

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
font-size:13px;
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
grid-template-columns:repeat(3,1fr);
gap:8px;
margin-bottom:15px;
">

<div class="card-resumen"
onclick="mostrarPanel('resumen')">
📊<br>Resumen
</div>

<div class="card-resumen"
onclick="mostrarPanel('asesores')">
👨‍💼<br>Asesores
</div>

<div class="card-resumen"
onclick="mostrarPanel('rentabilidad')">
💰<br>Rentabilidad
</div>

<div class="card-resumen"
onclick="mostrarPanel('resumen')">
📦<br>Productos
</div>

<div class="card-resumen"
onclick="mostrarPanel('resumen')">
📉<br>Mora
</div>

<div class="card-resumen"
onclick="mostrarPanel('clientes')">
🏆<br>Clientes
</div>

</div>

<div id="panelResumen"
style="display:block;">

<div style="
display:grid;
grid-template-columns:${esMovil ? "1fr" : "repeat(2,1fr)"};
gap:10px;
">

<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
text-align:center;
min-height:80px;
">
<div style="
font-size:28px;
margin-bottom:5px;
">
💰
</div>
<div>Cartera Total</div>
<div style="font-size:22px;font-weight:bold;">
S/${carteraTotal.toLocaleString()}
</div>
</div>

<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
text-align:center;
min-height:80px;
">
<div style="font-size:22px;">💵</div>
<div>Capital Vencido</div>
<div style="font-size:22px;font-weight:bold;">
S/${capitalVencido.toLocaleString()}
</div>
</div>
<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
text-align:center;
min-height:80px;
">
<div style="font-size:22px;">💸</div>
<div>Costo Desembolso</div>
<div style="font-size:22px;font-weight:bold;">
S/${costoDesembolsoTotal.toLocaleString()}
</div>
</div>
<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
padding:10px;
border-radius:12px;
text-align:center;
min-height:80px;
">
<div style="font-size:22px;">📉</div>
<div>% Mora</div>
<div style="font-size:22px;font-weight:bold;">
${moraPorcentaje}%
</div>
</div>
<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
padding:10px;
border-radius:12px;
text-align:center;
min-height:80px;
">
<div style="font-size:22px;">🚨</div>
<div>Clientes +30</div>
<div style="font-size:22px;font-weight:bold;">
${clientesCriticos}
</div>
</div>

<div style="
background:#FFF5F5;
color:#991B1B;
border:1px solid #FECACA;
box-shadow:0 2px 8px rgba(0,0,0,.05);
padding:10px;
border-radius:12px;
text-align:center;
min-height:80px;
">

<div style="font-size:22px;">🔴</div>

<div>Mora Total (+1)</div>

<div style="
font-size:20px;
font-weight:bold;
">

S/${moraTotal.toLocaleString()}

</div>

</div>

<div style="
background:#FFFFFF;
color:#1F2937;
border:1px solid #E5E7EB;
box-shadow:0 2px 8px rgba(0,0,0,.05);
text-align:center;
min-height:80px;
">
<div style="font-size:22px;">📈</div>
<div>Rentabilidad</div>
<div style="font-size:18px;font-weight:bold;">
S/${rentabilidad.toLocaleString()}
</div>
</div>
</div>
<div style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:10px;
margin-top:15px;
">

<div style="
background:#198754;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">

<div style="font-size:24px;">
🟢
</div>

<div>
Cartera Sana
</div>

<div style="
font-size:22px;
font-weight:bold;
">
S/${carteraSana.toLocaleString()}
</div>

</div>

<div style="
background:#dc3545;
color:white;
padding:15px;
border-radius:12px;
text-align:center;
">

<div style="font-size:24px;">
🔴
</div>

<div>
Cartera Vencida
</div>

<div style="
font-size:22px;
font-weight:bold;
">
S/${capitalVencido.toLocaleString()}
</div>

</div>

</div>

<div style="
background:#FFFFFF;
border:1px solid #E5E7EB;
padding:15px;
border-radius:12px;
margin-top:10px;
text-align:center;
font-weight:bold;
">

🟢 ${((carteraSana/carteraTotal)*100).toFixed(1)}%

&nbsp;&nbsp;|&nbsp;&nbsp;

🔴 ${((capitalVencido/carteraTotal)*100).toFixed(1)}%

</div>
<div style="
background:#FFFFFF;
padding:20px;
border-radius:16px;
box-shadow:0 2px 10px rgba(0,0,0,.06);
margin-top:15px;
">
</div>

</div>

<div id="panelAsesores"
style="display:none;">

<h3 style="
text-align:center;
color:black;
">
👨‍💼 Ranking Asesores
</h3>

${rankingHTML}

</div>

<hr style="margin:15px 0;">
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

<div id="listaProductos">

${moraProductoHTML}

</div>

<div id="detalleProducto" style="display:none;"></div>

<hr style="margin:15px 0;">

<div id="panelRentabilidad"
style="display:none;">

<h3 style="
text-align:center;
color:black;
">
💰 RENTABILIDAD POR ASESOR
</h3>

${rentabilidadHTML}
<hr style="margin:15px 0;">

<h3 style="
text-align:center;
color:black;
">
📉 MORA POR ASESOR
</h3>

${moraAsesorHTML}
</div>
<hr style="margin:15px 0;">

<div id="panelClientes"
style="display:none;">

<h3 style="
text-align:center;
color:black;
">
🏆 TOP 30 CLIENTES
</h3>

${topClientesHTML}

</div>
`;

}
function cargarMetasKPI(){

    const archivo =
    document.getElementById("excelMetas").files[0];

    if(!archivo){

        alert("Seleccione el archivo de metas.");

        return;

    }

    const lector = new FileReader();

    lector.onload = function(e){

        try{

            const data =
            new Uint8Array(e.target.result);

            const wb =
            XLSX.read(
                data,
                {type:"array"}
            );

            const hoja =
            wb.Sheets[wb.SheetNames[0]];

            const json =
            XLSX.utils.sheet_to_json(hoja);

            if(!json.length){

                alert(
                    "❌ El archivo de metas no contiene datos."
                );

                return;

            }

            // =====================================
            // GUARDAR METAS
            // =====================================

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

            // =====================================
            // MOSTRAR META ACTIVA
            // =====================================

            const metaActiva =
            document.getElementById("metaActivaKPI");

            if(metaActiva){

                metaActiva.style.display = "block";

                metaActiva.innerHTML =
                "🎯 Metas activas: " + archivo.name;

            }

            console.log(
                "✅ METAS CARGADAS:",
                json
            );

            alert(
                "✅ Metas cargadas correctamente."
            );

        }catch(error){

            console.error(
                "❌ ERROR CARGANDO METAS:",
                error
            );

            alert(
                "❌ Error al leer el archivo de metas."
            );

        }

    };

    lector.readAsArrayBuffer(archivo);

}
// ==========================================
// CARGAR PRODUCCIÓN KPI
// ==========================================
function cargarExcelKPI(){

    const archivo =
    document.getElementById("excelKPI").files[0];

    if(!archivo){
        alert("Seleccione el archivo de producción.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){
        const data =
        new Uint8Array(e.target.result);

        const wb =
        XLSX.read(data,{type:"array"});

        const hoja =
        wb.Sheets[wb.SheetNames[0]];

        const json =
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

        alert("✅ Producción cargada correctamente.");

generarKPI(json);

    };

    lector.readAsArrayBuffer(archivo);

}
// ======================================================
// DETALLE MORA POR PRODUCTO
// ======================================================
function mostrarDetalleProducto(producto){

const data=JSON.parse(localStorage.getItem("financiero"))||[];

const clientes=data.filter(c=>
String(c["Producto"]||"").trim().toUpperCase()===producto.toUpperCase()
).sort((a,b)=>
(parseFloat(b["Dias de retraso"])||0)-
(parseFloat(a["Dias de retraso"])||0)
);

let html=`
<div style="margin-bottom:15px">
<button onclick="volverProductos()" style="width:100%;padding:14px;border:none;border-radius:12px;background:#0A3A63;color:#fff;font-weight:bold;cursor:pointer">
← Volver a Productos
</button>
</div>

<div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #E5E7EB">
<h2 style="margin:0;text-align:center;color:#0A3A63">${producto}</h2>
<p style="text-align:center">👥 ${clientes.length} Clientes</p>

<div class="detallePC">
<table style="width:100%;border-collapse:collapse">
<thead>
<tr>
<th>#</th>
<th>Nombre y Apellido</th>
<th>Monto</th>
<th>Días</th>
<th>CP</th>
<th>CC</th>
</tr>
</thead>
<tbody>
`;

clientes.forEach((c,i)=>{
const nombre=`${c["Apellido Paterno"]||""} ${c["Apellido Materno"]||""} ${c["Nombre"]||""}`.replace(/\s+/g," ").trim();
html+=`
<tr>
<td>${i+1}</td>
<td>${nombre}</td>
<td>S/${(parseFloat(c["Monto Otorgado"])||0).toLocaleString()}</td>
<td>${parseFloat(c["Dias de retraso"])||0}</td>
<td>S/${(parseFloat(c["CP"])||0).toLocaleString()}</td>
<td>S/${(parseFloat(c["CC"])||0).toLocaleString()}</td>
</tr>`;
});

html+=`
</tbody>
</table>
</div>

<div class="detalleMobile">
`;

clientes.forEach(c=>{
const nombre=`${c["Apellido Paterno"]||""} ${c["Apellido Materno"]||""} ${c["Nombre"]||""}`.replace(/\s+/g," ").trim();
html+=`
<div class="cardDetalle">
<div class="nombre">👤 ${nombre}</div>
<div class="fila"><span>💰 S/${(parseFloat(c["Monto Otorgado"])||0).toLocaleString()}</span><span>⏳ ${parseFloat(c["Dias de retraso"])||0} días</span></div>
<div class="fila"><span>CP</span><b>S/${(parseFloat(c["CP"])||0).toLocaleString()}</b></div>
<div class="fila"><span>CC</span><b>S/${(parseFloat(c["CC"])||0).toLocaleString()}</b></div>
</div>`;
});

html+=`
</div>
</div>
`;

document.getElementById("listaProductos").style.display="none";
document.getElementById("detalleProducto").style.display="block";
document.getElementById("detalleProducto").innerHTML=html;
document.getElementById("detalleProducto").scrollIntoView({behavior:"smooth",block:"start"});
}
function volverProductos(){

document.getElementById("detalleProducto").style.display="none";

document.getElementById("listaProductos").style.display="block";

document.getElementById("listaProductos")
.scrollIntoView({
behavior:"smooth",
block:"start"
});

}
