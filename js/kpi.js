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
    let rankingKPIHTML = localStorage.getItem("rankingKPIHTML") || "";

    let totalClientesActual = 0;
    let totalClientesSiguiente = 0;

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

    let fechaExcel = c["Fecha Desembolso"];

let fecha;

if(fechaExcel instanceof Date){

    fecha = fechaExcel;

}else if(typeof fechaExcel === "number"){

    fecha = new Date(
        (fechaExcel - 25569) * 86400 * 1000
    );

}else{

    const fechaTexto = String(fechaExcel).trim();

    const partes = fechaTexto.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if(partes){

        fecha = new Date(Date.UTC(
            Number(partes[3]),
            Number(partes[2]) - 1,
            Number(partes[1])
        ));

    }else{

        fecha = new Date(fechaTexto);

    }

}

if(!fecha || isNaN(fecha.getTime())){
    return;
}

if(
    !ultimaFecha ||
    fecha > ultimaFecha
){
    ultimaFecha = fecha;
}
});
// ========================================
// CLIENTES ACUMULADOS HASTA EL MES ACTUAL
// ========================================
// Cuenta clientes únicos por asesor.
// Incluye todos los desembolsos de la data cargada.
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
);
    let metas =
JSON.parse(
    localStorage.getItem("metasKPI")
) || [];
console.log("=================================");
console.log("METAS KPI CARGADAS:");
console.log(metas);
console.log("CANTIDAD DE ASESORES EN METAS:", metas.length);
console.log("=================================");
console.log(
"REGISTROS MES ACTUAL:",
json.length
);

// ==========================================
// CONFIGURACIÓN AUTOMÁTICA DE CLIENTES
// ==========================================
// La columna histórica se detecta directamente
// desde el Excel de METAS. No se escriben meses
// manualmente en el código.
//
// Ejemplo:
// METAS -> CLIENTES SETIEMBRE
// DATA  -> Octubre
// KPI   -> CLIENTES SETIEMBRE | CLIENTES OCTUBRE
// ==========================================

const mesesKPIClientes = [
    "ENERO","FEBRERO","MARZO","ABRIL",
    "MAYO","JUNIO","JULIO","AGOSTO",
    "SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
];

const equivalenciasMesKPI = {
    "ENERO":"ENERO",
    "FEBRERO":"FEBRERO",
    "MARZO":"MARZO",
    "ABRIL":"ABRIL",
    "MAYO":"MAYO",
    "JUNIO":"JUNIO",
    "JULIO":"JULIO",
    "AGOSTO":"AGOSTO",
    "SEPTIEMBRE":"SEPTIEMBRE",
    "SETIEMBRE":"SEPTIEMBRE",
    "OCTUBRE":"OCTUBRE",
    "NOVIEMBRE":"NOVIEMBRE",
    "DICIEMBRE":"DICIEMBRE"
};

const normalizarTextoClientes = texto =>
    String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ")
    .trim()
    .toUpperCase();

const mesesClientesEncontrados = [];

const metaReferenciaClientes = metas[0] || {};

Object.keys(metaReferenciaClientes).forEach(col => {

    const nombre = normalizarTextoClientes(col);

    if(!nombre.includes("CLIENTES")) return;

    for(const mesDetectado of mesesKPIClientes){

        const variantes =
            mesDetectado === "SEPTIEMBRE"
            ? ["SEPTIEMBRE","SETIEMBRE"]
            : [mesDetectado];

        if(variantes.some(mes => nombre.includes(mes))){

            mesesClientesEncontrados.push({
                columna: col,
                mes: mesDetectado,
                indice: mesesKPIClientes.indexOf(mesDetectado)
            });

            break;
        }
    }
});

// Se toma el último mes disponible en la hoja de METAS.
mesesClientesEncontrados.sort((a,b) => a.indice - b.indice);

const configuracionClientes =
    mesesClientesEncontrados.length
    ? mesesClientesEncontrados[mesesClientesEncontrados.length - 1]
    : null;

const indiceMesClientesHistorico =
    configuracionClientes
    ? configuracionClientes.indice
    : null;

const mesClientesHistorico =
    configuracionClientes
    ? configuracionClientes.mes
    : mesAnterior.toUpperCase();

const mesClientesProduccion =
    indiceMesClientesHistorico !== null
    ? mesesKPIClientes[
        (indiceMesClientesHistorico + 1) % 12
      ]
    : mesActual.toUpperCase();

// Año de comparación. Si el histórico es diciembre,
// el siguiente período corresponde al año siguiente.
const anioClientesProduccion =
    indiceMesClientesHistorico === 11
    ? anioActual + 1
    : anioActual;

console.log("📊 CLIENTES - MES HISTÓRICO DESDE METAS:", mesClientesHistorico);
console.log("📊 CLIENTES - MES DE PRODUCCIÓN ESPERADO:", mesClientesProduccion);

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
    ? "#159447"
    : Number(avanceEmpresa) >= 80
    ? "#D99A1A"
    : "#D64545";

let resumen = `

<div class="kpi-resumen-gerencial" style="
    margin-bottom:18px;
">

    <div class="kpi-resumen-encabezado" style="
    text-align:center;
    margin-bottom:18px;
">

        <div style="
            font-size:26px;
            font-weight:800;
            color:#123F63;
            letter-spacing:.3px;
        ">
        🎯 GESTIÓN Y CUMPLIMIENTO DE METAS
        </div>

        <div style="
            font-size:13px;
            color:#657789;
            margin-top:4px;
        ">
            ${mesActual.toUpperCase()} ${anioActual}
            &nbsp;•&nbsp;
          Actualizado: ${localStorage.getItem("fechaProduccionKPI") || new Date().toLocaleString("es-PE")}
        </div>

    </div>


    <!-- ================================= -->
    <!-- INDICADORES PRINCIPALES -->
    <!-- ================================= -->

    <div class="kpi-resumen-grid" style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
        gap:10px;
    ">


        <!-- CLIENTES -->

     <div class="kpi-resumen-card" style="
            background:#FFFFFF;
            border:1px solid #DCE4EC;
            border-top:4px solid #123F63;
            border-radius:12px;
            padding:14px;
            text-align:center;
            box-shadow:0 3px 10px rgba(18,63,99,.07);
        ">

            <div style="font-size:23px;">👥</div>

            <div style="
                font-size:12px;
                color:#657789;
                margin-top:3px;
            ">
                CLIENTES EN CARTERA
            </div>

           <div style="
    font-size:25px;
    font-weight:800;
    color:#172B3A;
    margin-top:3px;
">
 ${totalClientesActual}
</div>

        </div>


        <!-- COLOCACIÓN -->

       <div class="kpi-resumen-card" style="
            background:#FFFFFF;
            border:1px solid #DCE4EC;
            border-top:4px solid #159447;
            border-radius:12px;
            padding:14px;
            text-align:center;
            box-shadow:0 3px 10px rgba(18,63,99,.07);
        ">

            <div style="font-size:23px;">💰</div>

            <div style="
                font-size:12px;
                color:#657789;
            ">
                COLOCACIÓN
            </div>

            <div style="
                font-size:24px;
                font-weight:800;
                color:#172B3A;
            ">
                S/${Math.round(montoOtorgadoTotal).toLocaleString("es-PE")}
            </div>

            <div style="
                font-size:11px;
                color:#657789;
                margin-top:3px;
            ">
                Meta: S/${Math.round(metaEmpresa).toLocaleString("es-PE")}
            </div>

        </div>


        <!-- OPERACIONES -->

        <div class="kpi-resumen-card" style="
            background:#FFFFFF;
            border:1px solid #DCE4EC;
            border-top:4px solid #2F6FDB;
            border-radius:12px;
            padding:14px;
            text-align:center;
            box-shadow:0 3px 10px rgba(18,63,99,.07);
        ">

            <div style="font-size:23px;">📋</div>

            <div style="
                font-size:12px;
                color:#657789;
            ">
                OPERACIONES
            </div>

            <div style="
                font-size:25px;
                font-weight:800;
                color:#172B3A;
            ">
                ${totalOperaciones}
            </div>

        </div>


        <!-- TEM -->

        <div class="kpi-resumen-card" style="
            background:#FFFFFF;
            border:1px solid #DCE4EC;
            border-top:4px solid #6653B8;
            border-radius:12px;
            padding:14px;
            text-align:center;
            box-shadow:0 3px 10px rgba(18,63,99,.07);
        ">

            <div style="font-size:23px;">📈</div>

            <div style="
                font-size:12px;
                color:#657789;
            ">
                TEM PROMEDIO
            </div>

            <div style="
                font-size:25px;
                font-weight:800;
                color:#172B3A;
            ">
                ${temGeneral}%
            </div>

        </div>


        <!-- CUMPLIMIENTO -->

        <div class="kpi-resumen-card" style="
            background:#FFFFFF;
            border:1px solid #DCE4EC;
            border-top:4px solid ${colorMeta};
            border-radius:12px;
            padding:14px;
            text-align:center;
            box-shadow:0 3px 10px rgba(18,63,99,.07);
        ">

            <div style="font-size:23px;">🎯</div>

            <div style="
                font-size:12px;
                color:#657789;
            ">
                CUMPLIMIENTO
            </div>

            <div style="
                font-size:25px;
                font-weight:800;
                color:${colorMeta};
            ">
                ${avanceEmpresa}%
            </div>

            <div style="
                font-size:11px;
                font-weight:700;
                color:${colorMeta};
                margin-top:3px;
            ">
                ${estadoMeta}
            </div>

        </div>

    </div>


    <!-- ================================= -->
    <!-- BARRA DE CUMPLIMIENTO -->
    <!-- ================================= -->

    <div style="
        background:#F6F8FA;
        border:1px solid #DCE4EC;
        border-radius:12px;
        padding:13px;
        margin-top:12px;
    ">

        <div style="
            display:flex;
            justify-content:space-between;
            font-size:12px;
            font-weight:700;
            margin-bottom:7px;
        ">

            <span>
                🎯 Avance de colocación
            </span>

            <span style="color:${colorMeta};">
                ${avanceEmpresa}%
            </span>

        </div>

        <div style="
            width:100%;
            height:10px;
            background:#DCE4EC;
            border-radius:20px;
            overflow:hidden;
        ">

            <div style="
                width:${Math.min(Number(avanceEmpresa),100)}%;
                height:100%;
                background:${colorMeta};
                border-radius:20px;
            "></div>

        </div>

        <div style="
            display:flex;
            justify-content:space-between;
            margin-top:6px;
            font-size:11px;
            color:#657789;
        ">

            <span>
                Real: S/${Math.round(montoOtorgadoTotal).toLocaleString("es-PE")}
            </span>

            <span>
                Meta: S/${Math.round(metaEmpresa).toLocaleString("es-PE")}
            </span>

        </div>

    </div>

</div>

`;

   let ranking = {};
let operaciones = {};
let temPromedio = {};
let clientes = {};
let moraAsesor = {};

    json.forEach(c => {
console.log(Object.keys(c));
        let asesor =
        (c["Asesor(a)"] || "SIN ASESOR")
        .trim()
        .toUpperCase();
console.log(
    "ASESOR:",
    JSON.stringify(c["Asesor(a)"]),
    "| PRESTAMO:",
    c["Prestamo"],
    "| FECHA:",
    c["Fecha Desembolso"]
);
        let monto =
        parseFloat(c["Monto Otorgado"]) || 0;

        let tem =
parseFloat(
    String(c["TEM"])
    .replace(",",".")
) || 0;

        let codigoCliente =
String(c["Cod Cliente"] || "")
.trim()
.toUpperCase();
let saldoCapitalVencido =
parseFloat(
    c["Saldo capital vencido"] ??
    c["Saldo Capital Vencido"] ??
    c["SALDO CAPITAL VENCIDO"] ??
    0
) || 0;


       if(!ranking[asesor]){

    ranking[asesor] = 0;
    operaciones[asesor] = 0;
    temPromedio[asesor] = [];
    clientes[asesor] = new Set();
    moraAsesor[asesor] = 0;

}

        ranking[asesor] += monto;
        operaciones[asesor]++;
        temPromedio[asesor].push(tem);
        
moraAsesor[asesor] += saldoCapitalVencido;
       
      if(codigoCliente){

    clientes[asesor].add(codigoCliente);

}

    });

// =========================================
// CLIENTES EN CARTERA
// =========================================

totalClientesActual =
Object.values(clientesHistorico)
.reduce(
    (total, clientes) => total + clientes.size,
    0
);

console.log(
    "CLIENTES EN CARTERA:",
    totalClientesActual
);
    
// ==========================================
// RANKING COLOCACIÓN
// ==========================================

// ==========================================
// INCLUIR TODOS LOS ASESORES ACTIVOS
// ==========================================
usuarios.forEach(u => {

    const asesor = String(
        u.user || u.usuario || u.nombre || ""
    ).trim().toUpperCase();

    if (!asesor || asesor === "ADMIN") return;

    ranking[asesor] = Number(ranking[asesor] || 0);
    operaciones[asesor] = Number(operaciones[asesor] || 0);

    if (!temPromedio[asesor]) temPromedio[asesor] = [];
    if (!clientes[asesor]) clientes[asesor] = new Set();
    if (!moraAsesor[asesor]) moraAsesor[asesor] = 0;

});

let top =
Object.entries(ranking)

.filter(([asesor]) =>
    asesor.toUpperCase() !== "ADMIN"
)

.sort((a,b) => b[1] - a[1]);
console.log("RANKING COLOCACION REAL:", ranking);
console.log("TOP COLOCACION REAL:", top);
let mejorAsesor =
top.length > 0
?
top[0]
:
null;

if(mejorAsesor){

resumen += `

<div style="
background:#FFFFFF;
border-left:5px solid #123F63;
color:#243746;
padding:12px;
border-radius:12px;
margin-bottom:12px;
">

<div style="
font-size:14px;
font-weight:600;
color:#667783;
">
🏆 Líder del Mes
</div>

<div style="
font-size:20px;
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

   <style>
   
/* KPI POR ASESOR - DISEÑO PROFESIONAL */

.kpi-asesor-card {
    background: #FFFFFF;
    border: 1px solid #DCE5ED;
    border-radius: 10px;
    padding: 10px;
    margin-top: 10px;
    box-shadow: 0 2px 7px rgba(18,63,99,.05);
}

.kpi-asesor-titulo {
    margin: 0 0 10px;
    color: #123F63;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: .3px;
    text-align: center;
}

.kpi-asesor-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 5px;
}

.kpi-asesor-table {
    width: 100%;
    min-width: 1450px;
    border-collapse: separate;
    border-spacing: 0;
    text-align: center;
    font-size: 11px;
    color: #263746;
    font-variant-numeric: tabular-nums;
}

.kpi-asesor-table th {
    background: #123F63;
    color: #FFFFFF;
    padding: 7px 5px;
    font-size: 10px;
    line-height: 1.15;
    font-weight: 750;
    letter-spacing: .12px;
    white-space: normal;
    vertical-align: middle;
    border-right: 1px solid rgba(255,255,255,.12);
    border-bottom: 2px solid #0B2E4A;
}

.kpi-asesor-table th:first-child {
    border-radius: 6px 0 0 0;
}

.kpi-asesor-table th:last-child {
    border-radius: 0 6px 0 0;
    border-right: 0;
}

.kpi-asesor-table td {
    padding: 6px;
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
    vertical-align: middle;
    border-bottom: 1px solid #E8EDF2;
}

.kpi-asesor-table tbody tr:nth-child(even):not(.kpi-total-row) {
    background: #F7F9FB;
}

.kpi-asesor-table tbody tr:hover:not(.kpi-total-row) {
    background: #EEF4F8;
}

.kpi-asesor-table .kpi-total-row td {
    padding: 9px 7px;
    font-size: 14px;
    font-weight: 900;
    background: #EAF1F6;
    border-top: 2px solid #123F63;
    border-bottom: 0;
    text-align: center;
}

.kpi-asesor-table .kpi-total-row td:first-child {
    color: #123F63;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.1;
    text-align: center;
}

@media (max-width: 768px) {
    .kpi-asesor-card {
        padding: 8px;
    }

    .kpi-asesor-table {
        min-width: 1400px;
    }

    .kpi-asesor-table th {
        font-size: 9.5px;
        padding: 6px 4px;
    }

    .kpi-asesor-table td {
        font-size: 10.5px;
        padding: 5px;
    }
}

/* =====================================
   COLUMNA ASESOR FIJA
===================================== */

.kpi-asesor-table th:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
    min-width: 90px;
    background: #123F63;
    box-shadow: 2px 0 4px rgba(0,0,0,.10);
}

.kpi-asesor-table td:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    min-width: 90px;
    background: #FFFFFF;
    box-shadow: 2px 0 4px rgba(0,0,0,.06);
}

/* Filas alternadas */

.kpi-asesor-table tbody tr:nth-child(even):not(.kpi-total-row) td:first-child {
    background: #F7F9FB;
}

/* Fila TOTAL EMPRESA */

.kpi-asesor-table .kpi-total-row td:first-child {
    position: sticky;
    left: 0;
    z-index: 3;
    background: #EAF1F6;
}

/* ==========================================
   KPI GERENCIAL - DISEÑO RESPONSIVE
========================================== */

@media screen and (max-width: 768px) {

    #kpiResumen .kpi-resumen-gerencial {
        margin-bottom: 10px !important;
        width: 100%;
        box-sizing: border-box;
    }

    #kpiResumen .kpi-resumen-encabezado {
        margin-bottom: 10px !important;
    }

    #kpiResumen .kpi-resumen-encabezado div:first-child {
        font-size: 17px !important;
        line-height: 1.25 !important;
    }

    #kpiResumen .kpi-resumen-encabezado div:last-child {
        font-size: 10px !important;
    }

    /* Dos columnas en celular */
    #kpiResumen .kpi-resumen-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 7px !important;
        width: 100%;
    }

    /* Tarjetas compactas */
    #kpiResumen .kpi-resumen-card {
        min-width: 0 !important;
        padding: 8px 5px !important;
        border-radius: 9px !important;
        box-sizing: border-box;
        overflow: hidden;
    }

    /* Iconos */
    #kpiResumen .kpi-resumen-card div:first-child {
        font-size: 19px !important;
    }

    /* Nombres de indicadores */
    #kpiResumen .kpi-resumen-card div:nth-child(2) {
        font-size: 10px !important;
        line-height: 1.2 !important;
    }

    /* Valores principales */
    #kpiResumen .kpi-resumen-card div:nth-child(3) {
        font-size: 17px !important;
        overflow-wrap: anywhere;
        line-height: 1.2 !important;
    }

    /* Texto secundario */
    #kpiResumen .kpi-resumen-card div:nth-child(4) {
        font-size: 9px !important;
    }

}


/* =========================================
   KPI ASESOR - COMPACTO LAPTOP Y MÓVIL
========================================= */

.kpi-asesor-card {
    padding: 6px !important;
    margin-top: 5px !important;
}

.kpi-asesor-titulo {
    margin-bottom: 5px !important;
    font-size: 14px !important;
}

.kpi-asesor-scroll {
    overflow-x: auto;
    width: 100%;
}

.kpi-asesor-scroll table {
    border-collapse: collapse !important;
    width: 100% !important;
}

.kpi-asesor-scroll th,
.kpi-asesor-scroll td {
    padding: 4px 5px !important;
    line-height: 1.15 !important;
    white-space: nowrap;
}

.kpi-asesor-scroll th {
    font-size: 9px !important;
}

.kpi-asesor-scroll td {
    font-size: 10px !important;
}

/* Laptop */
@media (min-width: 768px) {
    .kpi-asesor-scroll th,
    .kpi-asesor-scroll td {
        padding: 4px 4px !important;
    }
}

/* Celular */
@media (max-width: 600px) {
    .kpi-asesor-card {
        padding: 4px !important;
    }

    .kpi-asesor-scroll th,
    .kpi-asesor-scroll td {
        padding: 3px 3px !important;
        font-size: 8px !important;
        line-height: 1.1 !important;
    }

    .kpi-asesor-titulo {
        font-size: 12px !important;
    }
}

/* =========================================
   COMPACTAR COLUMNAS KPI
   TEM - VARIACIÓN - MORA
========================================= */

@media (max-width: 768px) {

    .kpi-asesor-scroll th,
    .kpi-asesor-scroll td {
        padding: 2px !important;
        font-size: 7px !important;
    }

    .kpi-asesor-scroll th {
        font-size: 7px !important;
        line-height: 1 !important;
    }

    .kpi-asesor-scroll td {
        line-height: 1.05 !important;
    }

    .kpi-asesor-scroll table {
        width: max-content !important;
        min-width: 100% !important;
    }

}

/* ==========================================
   COMPACTACIÓN EXTREMA KPI EN CELULAR
========================================== */

@media (max-width: 600px) {

    /* Tarjeta KPI */
    .kpi-asesor-card {
        padding: 5px !important;
        margin: 4px !important;
        border-radius: 8px !important;
    }

    /* Título */
    .kpi-asesor-titulo {
        font-size: 12px !important;
        margin: 3px 0 !important;
        padding: 0 !important;
    }

    /* Botones */
    .kpi-asesor-card button {
        min-height: 32px !important;
        height: 32px !important;
        padding: 4px 8px !important;
        font-size: 11px !important;
        margin: 3px 0 !important;
        border-radius: 6px !important;
    }

    /* Selector histórico */
    .kpi-asesor-card select {
        min-height: 32px !important;
        height: 32px !important;
        padding: 4px 8px !important;
        font-size: 11px !important;
        margin: 3px 0 !important;
    }

    /* Tabla */
    .kpi-asesor-scroll th,
    .kpi-asesor-scroll td {
        padding: 2px 3px !important;
        font-size: 7px !important;
        line-height: 1 !important;
    }

    /* Encabezados */
    .kpi-asesor-scroll th {
        font-size: 6.5px !important;
        padding: 3px 2px !important;
    }

    /* Filas */
    .kpi-asesor-scroll tr {
        height: auto !important;
    }

    /* Total empresa */
    .kpi-asesor-scroll tfoot td,
    .kpi-asesor-scroll tr:last-child td {
        padding: 3px !important;
        font-size: 8px !important;
    }

}

</style>

<div class="card kpi-asesor-card">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:10px;
margin-bottom:12px;
">

<h4 class="kpi-asesor-titulo" style="margin:0;">
🎯 KPI POR ASESOR
</h4>

<div style="
display:${asesor === "admin" ? "flex" : "none"};
align-items:center;
gap:8px;
flex-wrap:wrap;
">

<button
type="button"
onclick="cerrarKPIHistorico()"
style="
background:#123F63;
color:white;
border:0;
padding:9px 12px;
border-radius:6px;
font-weight:bold;
cursor:pointer;
">
🔒 Cerrar y guardar mes
</button>

<select
id="selectorHistoricoKPI"
onchange="consultarKPIHistorico(this.value)"
style="
padding:9px;
border:1px solid #CCD6DF;
border-radius:6px;
font-weight:600;
">

<option value="">Consultar histórico mensual</option>

</select>

<button
type="button"
onclick="volverKPIActual()"
style="
background:#EAF1F6;
color:#123F63;
border:1px solid #CCD6DF;
padding:9px 12px;
border-radius:6px;
font-weight:bold;
cursor:pointer;
">
↩ KPI actual
</button>

</div>
</div>

<div class="kpi-asesor-scroll">

<table class="kpi-asesor-table">
<thead>
<tr>

<th>ASESOR</th>
<th>META COLOCACIÓN</th>
<th>AVANCE</th>
<th>% AVANCE</th>
<th>META OPERACIONES</th>
<th>AVANCE</th>
<th>% AVANCE OPER</th>
<th>META CLIENTES</th>
<th>CLIENTES ${mesClientesHistorico}</th>
<th>CLIENTES ${mesClientesProduccion}</th>
<th>VARIACIÓN</th>
<th>TEM ${mesAnterior.toUpperCase()}</th>
<th>TEM ${mesActual.toUpperCase()}</th>
<th>VARIACIÓN TEM</th>
<th>MORA ${mesAnterior.toUpperCase()}</th>
<th>MORA ${mesActual.toUpperCase()} 31+</th>
<th>MORA ${mesActual.toUpperCase()} 9-30</th>
<th>MORA ${mesActual.toUpperCase()} 1-8</th>
<th>🚦</th>

</tr>
</thead>
<tbody>
`;
// ==========================
// MORA ACTUAL (TODA LA CARTERA)
// ==========================

let mora9a30Asesor = {};
let mora31MasAsesor = {};
let mora1a8Asesor = {};
// ==========================================
// CLIENTES: HISTÓRICO VS SIGUIENTE PERÍODO
// ==========================================

// ==========================================
// CLIENTES EN CARTERA - MES ACTUAL
// ==========================================
// IMPORTANTE:
//
// NO se cuentan solamente los desembolsos de octubre.
//
// Se cuentan TODOS los clientes únicos que existen
// en la data de producción cargada.
//
// Si un cliente tiene varios créditos,
// cuenta solamente UNA vez.
//
// Esto permite comparar:
//
// CLIENTES SEPTIEMBRE
//        VS
// CLIENTES OCTUBRE
//
// Ejemplo:
//
// Septiembre = 147
// Octubre    = 147
// Variación  = 0
//
// Si aparecen 5 clientes nuevos:
//
// Septiembre = 147
// Octubre    = 152
// Variación  = +5
// ==========================================

let clientesMesActual = {};

// ==========================================
// TOMAR TODOS LOS CLIENTES DE LA DATA
// ==========================================

jsonGeneral.forEach(c => {

    const asesor =
        String(
            c["Asesor(a)"] ||
            ""
        )
        .trim()
        .toUpperCase();

    const codigoCliente =
        String(
            c["Cod Cliente"] ||
            c["COD CLIENTE"] ||
            c["DNI"] ||
            c["dni"] ||
            c["DNI Cliente"] ||
            c["Documento"] ||
            c["N° Documento"] ||
            c["Nº Documento"] ||
            ""
        )
        .trim()
        .toUpperCase();

    if(!asesor || !codigoCliente){
        return;
    }

    // Crear Set para el asesor
    if(!clientesMesActual[asesor]){

        clientesMesActual[asesor] =
            new Set();

    }

    // Cliente único
    clientesMesActual[asesor]
        .add(codigoCliente);

});

// ==========================================
// VERIFICACIÓN EN CONSOLA
// ==========================================

console.log(
    "📊 CLIENTES ACTUALES POR ASESOR:",
    Object.fromEntries(
        Object.entries(clientesMesActual)
        .map(([asesor,set]) => [
            asesor,
            set.size
        ])
    )
);

console.log(
    "📊 TOTAL CLIENTES ACTUALES:",
    Object.values(clientesMesActual)
        .reduce(
            (total,set) =>
                total + set.size,
            0
        )
);
    
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

 // ==========================================
// INICIALIZAR MORA POR RANGO
// ==========================================

if(!mora9a30Asesor[asesor]){
    mora9a30Asesor[asesor] = 0;
}

if(!mora31MasAsesor[asesor]){
    mora31MasAsesor[asesor] = 0;
}

if(!mora1a8Asesor[asesor]){
    mora1a8Asesor[asesor] = 0;
}

// ==========================================
// MORA DE 1 A 8 DÍAS
// ==========================================

if(atraso >= 1 && atraso <= 8){
    mora1a8Asesor[asesor] += saldo;
}

// ==========================================
// MORA DE 9 A 30 DÍAS
// ==========================================

if(atraso >= 9 && atraso <= 30){
    mora9a30Asesor[asesor] += saldo;
}

// ==========================================
// MORA DE 31 DÍAS A MÁS
// ==========================================

if(atraso >= 31){
    mora31MasAsesor[asesor] += saldo;
}
    
});   
 // =========================================
// TOTALES EMPRESA
// =========================================

let totalMetaColocacion = 0;
let totalAvanceColocacion = 0;

let totalMetaOperaciones = 0;
let totalAvanceOperaciones = 0;

let totalClientesHistorico = 0;
let totalMetaClientes = 0;
let totalMoraJulio = 0;
let totalMoraAgosto = 0;
let totalMoraAgosto31Mas = 0;
let totalMoraAgosto1Mas = 0;

let sumaTemJulio = 0;
let sumaTemAgosto = 0;
let cantidadTemJulio = 0;
let cantidadTemAgosto = 0;   
    // ======================================================
    // TOTALES Y DETALLE POR ASESOR
    // Se recorren LAS METAS, no la producción.
    // Por eso todos los asesores aparecen aunque tengan S/0.
    // ======================================================

    const normalizarAsesor = texto =>
        String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/\s+/g,"")
        .trim()
        .toUpperCase();

    const metasValidas = metas.filter(meta =>
        normalizarAsesor(
            meta["Asesor (A)"] ||
            meta["ASESOR"] ||
            ""
        ) !== ""
    );

    console.log("📊 METAS VÁLIDAS PARA TABLA:",metasValidas);
    console.log("📊 CANTIDAD DE ASESORES EN TABLA:",metasValidas.length);



    metasValidas.forEach(meta=>{

        const asesor = normalizarAsesor(
            meta["Asesor (A)"] ||
            meta["ASESOR"] ||
            ""
        );

        const buscarColumna = (tipo,mes)=>{

            const tipoN = normalizarAsesor(tipo);
            const mesN = normalizarAsesor(mes);

            return Object.keys(meta || {}).find(col=>{

                const nombre = normalizarAsesor(col);

                return nombre.includes(tipoN) && nombre.includes(mesN);

            });

        };

        // ==========================================
        // DATOS REALES DEL ASESOR
        // ==========================================

        const colocacion =
            Number(ranking[asesor] || 0);

        const oper =
            Number(operaciones[asesor] || 0);

        const tem =
            temPromedio[asesor] &&
            temPromedio[asesor].length
            ?
            (
                temPromedio[asesor]
                .reduce((a,b)=>a+b,0)
                /
                temPromedio[asesor].length
            ).toFixed(2)
            :
            "0.00";

        // ==========================================
        // CLIENTES: METAS VS PRODUCCIÓN
        // ==========================================

        // HISTÓRICO: columna CLIENTES detectada automáticamente
        // desde el Excel de METAS.
        const colClientesHistorico =
            configuracionClientes
            ? configuracionClientes.columna
            : null;

        const clientesHistoricoMes =
            colClientesHistorico
            ? Number(
                String(meta[colClientesHistorico] || 0)
                .replace(/,/g,"")
                .replace(",", ".")
              ) || 0
            : 0;

        // PRODUCCIÓN: clientes únicos del mes siguiente al histórico.
        const clientesMesActualAsesor =
            clientesMesActual[asesor]
            ? clientesMesActual[asesor].size
            : 0;

        // META DE CLIENTES DEL ASESOR
const metaClientes =
    Number(meta["META CLIENTES"]) || 0;

        // VARIACIÓN.
        const variacionClientes =
            clientesMesActualAsesor -
            clientesHistoricoMes;

        let colorVariacion = "#657789";

        if(variacionClientes > 0){
            colorVariacion = "#159447";
        }else if(variacionClientes < 0){
            colorVariacion = "#D64545";
        }

       // ==========================================
// TEM HISTÓRICO - DESDE EXCEL DE METAS
// ==========================================
// Detecta automáticamente la columna:
// TEM SEPTIEMBRE
// TEM SETIEMBRE
// TEM OCTUBRE
// etc.
//
// No depende de mesAnterior.
// ==========================================

let temAnterior = 0;

let columnaTEMHistorico = null;

if(configuracionClientes){

    const mesTEMHistorico =
        configuracionClientes.mes;

    columnaTEMHistorico =
        Object.keys(meta || {}).find(col => {

            const nombreColumna =
                normalizarTextoClientes(col);

            return (
                nombreColumna.includes("TEM") &&
                (
                    nombreColumna.includes(
                        mesTEMHistorico
                    ) ||
                    (
                        mesTEMHistorico === "SEPTIEMBRE" &&
                        nombreColumna.includes("SETIEMBRE")
                    )
                )
            );

        });

}

// ==========================================
// LEER TEM DESDE METAS
// ==========================================

if(columnaTEMHistorico){

    temAnterior =
        parseFloat(
            String(
                meta[columnaTEMHistorico] || 0
            )
            .replace(/%/g,"")
            .replace(/,/g,".")
        ) || 0;

}

console.log(
    "📊 TEM HISTÓRICO:",
    asesor,
    columnaTEMHistorico,
    temAnterior
);

        // ==========================================
// VARIACIÓN TEM POR ASESOR
// ==========================================

const variacionTEM =
    Number(tem) - Number(temAnterior);

const colorVariacionTEM =
    variacionTEM > 0
        ? "#159447"
        : variacionTEM < 0
            ? "#D64545"
            : "#657789";

        
        // Mora histórica: se toma siempre el mes anterior.
        let moraAnterior = 0;
        const colMora = buscarColumna("MORA",mesAnterior);

        if(colMora){
            moraAnterior =
                parseFloat(
                    String(meta[colMora] || 0)
                    .replace(/,/g,"")
                    .replace(",",".")
                ) || 0;
        }

        // Mora actual desde la cartera/producción actual.
        const mora9a30 = Number(mora9a30Asesor[asesor] || 0);
const mora31Mas = Number(mora31MasAsesor[asesor] || 0);
const mora1a8 = Number(mora1a8Asesor[asesor] || 0);
        // Metas.
        const metaDesembolso =
            Number(
                String(meta["COLOCACION"] || meta["COLOC."] || 0)
                .replace(/,/g,"")
                .replace(",",".")
            ) || 0;

        const metaOperaciones =
            Number(
                String(meta["OPERACIONES"] || 0)
                .replace(/,/g,"")
                .replace(",",".")
            ) || 0;

        const porcentajeDesembolso =
            metaDesembolso > 0
            ? ((colocacion / metaDesembolso) * 100).toFixed(1)
            : "0.0";

        const porcentajeOperaciones =
            metaOperaciones > 0
            ? ((oper / metaOperaciones) * 100).toFixed(1)
            : "0.0";

        let colorEstado = "🔴";

        if(Number(porcentajeDesembolso) >= 100){
            colorEstado = "🟢";
        }else if(Number(porcentajeDesembolso) >= 80){
            colorEstado = "🟡";
        }

        // Fila del asesor.
        resumen += `
<tr>
<td><b>${asesor}</b></td>
<td>S/${Math.round(metaDesembolso).toLocaleString("es-PE")}</td>
<td>S/${Math.round(colocacion).toLocaleString("es-PE")}</td>
<td style="background:${Number(porcentajeDesembolso)>=100?'#22B55A':'#FFFFFF'};color:${Number(porcentajeDesembolso)>=100?'white':'#000000'};font-weight:bold;">${porcentajeDesembolso}%</td>
<td>${metaOperaciones}</td>
<td>${oper}</td>
<td style="background:${Number(porcentajeOperaciones)>=100?'#22B55A':Number(porcentajeOperaciones)>=80?'#E0AA24':'#D64545'};color:white;font-weight:bold;">${porcentajeOperaciones}%</td>

<td><b>${metaClientes}</b></td>

<td>
    <b>${clientesHistoricoMes}</b>
</td>
<td>
    <b>${clientesMesActualAsesor}</b>
</td>
<td style="font-weight:bold;color:${colorVariacion};">${variacionClientes>0?'+':''}${variacionClientes}</td>
<td>${Number(temAnterior).toFixed(1)}%</td>

<td>${Number(tem).toFixed(2)}%</td>

<td style="
    color:${colorVariacionTEM};
    font-weight:800;
    text-align:center;
    white-space:nowrap;
">
    ${variacionTEM > 0 ? "+" : ""}${variacionTEM.toFixed(1)}
</td>
<td>S/${Math.round(moraAnterior).toLocaleString("es-PE")}</td>
<td
    style="
        font-weight:bold;
        color:#991B1B;
        cursor:pointer;
        text-decoration:underline;
        text-underline-offset:3px;
    "
    title="Ver clientes con mora de 31 días a más"
    onclick="mostrarMorososKPI('${asesor.replace(/'/g, "\\'")}', '31+')"
>
    S/${Math.round(mora31Mas).toLocaleString("es-PE")}
</td>

<td
    style="
        font-weight:bold;
        color:#C43D3D;
        cursor:pointer;
        text-decoration:underline;
        text-underline-offset:3px;
    "
    title="Ver clientes con mora de 9 a 30 días"
    onclick="mostrarMorososKPI('${asesor.replace(/'/g, "\\'")}', '9-30')"
>
    S/${Math.round(mora9a30).toLocaleString("es-PE")}
</td>

<td
    style="
        font-weight:bold;
        color:#D97706;
        cursor:pointer;
        text-decoration:underline;
        text-underline-offset:3px;
    "
    title="Ver clientes con mora de 1 a 8 días"
    onclick="mostrarMorososKPI('${asesor.replace(/'/g, "\\'")}', '1-8')"
>
    S/${Math.round(mora1a8).toLocaleString("es-PE")}
</td>
<td>${colorEstado}</td>
</tr>
`;

        // Totales empresa.
        totalMetaColocacion += metaDesembolso;
        totalAvanceColocacion += colocacion;
        totalMetaOperaciones += metaOperaciones;
        totalAvanceOperaciones += oper;
        totalMetaClientes += metaClientes;
        totalClientesHistorico += clientesHistoricoMes;
        totalClientesSiguiente += clientesMesActualAsesor;
       totalMoraJulio += moraAnterior;

// Totales separados por rango
totalMoraAgosto += mora9a30;
totalMoraAgosto31Mas += mora31Mas;
totalMoraAgosto1Mas += mora1a8;

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
totalClientesSiguiente - totalClientesHistorico;

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

// ==========================================
// VARIACIÓN TEM TOTAL EMPRESA
// ==========================================

let variacionTEMTotal =
    Number(temTotalAgosto) - Number(temTotalJulio);

let colorVariacionTEMTotal =
    variacionTEMTotal > 0
        ? "#159447"
        : variacionTEMTotal < 0
            ? "#D64545"
            : "#657789";
    

let colorTotalVariacion =
totalVariacionClientes > 0
?
"#159447"
:
totalVariacionClientes < 0
?
"#D64545"
:
"#657789";

resumen += `

<tr class="kpi-total-row">
<td>
TOTAL<br>EMPRESA
</td>

<td>
S/${totalMetaColocacion.toLocaleString("es-PE")}
</td>

<td>
S/${Math.round(totalAvanceColocacion).toLocaleString("es-PE")}
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
${totalMetaClientes}
</td>

<td>
${totalClientesHistorico}
</td>

<td>
${totalClientesSiguiente}
</td>

<td style="
color:${colorTotalVariacion};
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

<td style="
    color:${colorVariacionTEMTotal};
    font-weight:800;
    text-align:center;
">
    ${variacionTEMTotal > 0 ? "+" : ""}${variacionTEMTotal.toFixed(1)}
</td>

<td>
S/${Math.round(totalMoraJulio).toLocaleString("es-PE")}
</td>

<td>
S/${Math.round(totalMoraAgosto31Mas).toLocaleString("es-PE")}
</td>

<td>
S/${Math.round(totalMoraAgosto).toLocaleString("es-PE")}
</td>

<td>
S/${Math.round(totalMoraAgosto1Mas).toLocaleString("es-PE")}
</td>

<td>
🏢
</td>

</tr>

`;
    resumen += `
</tbody>
</table>
</div>
</div>
`;

    // ======================================================
// CUADRO DE DESEMBOLSOS POR ASESOR
// ======================================================

resumen += generarCuadroDesembolsosAsesor(jsonGeneral);

// ======================================================
// KPI DE COBRANZA SLOPEZ
// BLOQUE INDEPENDIENTE
// ======================================================

resumen += `
<div id="kpiCobranzaWrapper">
    ${generarKpiCobranza()}
</div>
`;
    
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
// DETALLE DE CLIENTES MOROSOS - KPI GERENCIAL
// SOLO MUESTRA NOMBRES Y APELLIDOS
// ======================================================

function mostrarMorososKPI(asesorSeleccionado, rango){

    // ==========================================
    // LEER DATA GENERAL
    // ==========================================

    const data = JSON.parse(
        localStorage.getItem("financiero") || "[]"
    );

    // ==========================================
    // NORMALIZAR
    // ==========================================

    const normalizar = valor => {

        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"")
            .trim()
            .toUpperCase();

    };

    // ==========================================
    // ESCAPAR HTML
    // ==========================================

    const escaparHTML = texto => {

        return String(texto || "")
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;")
            .replace(/'/g,"&#039;");

    };

    // ==========================================
    // FILTRAR CLIENTES POR ASESOR Y MORA
    // ==========================================

    const clientes = new Set();

    data.forEach(c => {

        const asesor = normalizar(
            c["Asesor(a)"] || c["Asesor"]
        );

        const atraso = Number(
            c["Dias de retraso"] || 0
        );

        // ======================================
        // VALIDAR ASESOR
        // ======================================

        if(
            asesor !== normalizar(asesorSeleccionado)
        ){
            return;
        }

        // ======================================
        // VALIDAR RANGO DE MORA
        // ======================================

        let perteneceRango = false;

        if(rango === "31+"){
            perteneceRango = atraso >= 31;
        }

        if(rango === "9-30"){
            perteneceRango =
                atraso >= 9 && atraso <= 30;
        }

        if(rango === "1-8"){
            perteneceRango =
                atraso >= 1 && atraso <= 8;
        }

        if(!perteneceRango){
            return;
        }

        // ======================================
        // OBTENER NOMBRE DEL CLIENTE
        // ======================================

        const nombre = String(
            c["Cliente"] ||
            c["Apellidos y Nombres"] ||
            c["Nombre Cliente"] ||
            c["Nombres y Apellidos"] ||
            c["Nombre Completo"] ||
            c["Cliente (Nombre)"] ||
            ""
        ).trim();

        if(nombre){
            clientes.add(nombre);
        }

    });

    // ==========================================
    // ORDENAR ALFABÉTICAMENTE
    // ==========================================

    const lista = [...clientes].sort(
        (a,b) => a.localeCompare(b,"es")
    );

    // ==========================================
    // TITULO SEGÚN RANGO
    // ==========================================

    let tituloRango = "";

    if(rango === "31+"){
        tituloRango = "31 DÍAS A MÁS";
    }

    if(rango === "9-30"){
        tituloRango = "9 A 30 DÍAS";
    }

    if(rango === "1-8"){
        tituloRango = "1 A 8 DÍAS";
    }

    // ==========================================
    // CREAR VENTANA
    // ==========================================

    let modal = document.getElementById(
        "modalMorososKPI"
    );

    if(!modal){

        modal = document.createElement("div");

        modal.id = "modalMorososKPI";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:12px;
        `;

        document.body.appendChild(modal);

    }

    // ==========================================
    // LISTADO DE NOMBRES
    // ==========================================

    const listado = lista.length

        ? lista.map((nombre,i) => `
            <div style="
                padding:10px 12px;
                border-bottom:1px solid #E5E7EB;
                font-size:14px;
                font-weight:600;
                color:#1F2937;
            ">
                ${i+1}. ${escaparHTML(nombre)}
            </div>
        `).join("")

        : `
            <div style="
                padding:20px;
                text-align:center;
                color:#64748B;
            ">
                No se encontraron clientes en este rango.
            </div>
        `;

    // ==========================================
    // CONTENIDO DEL MODAL
    // ==========================================

    modal.innerHTML = `

        <div style="
            width:100%;
            max-width:450px;
            max-height:85vh;
            background:white;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 15px 40px rgba(0,0,0,.3);
            display:flex;
            flex-direction:column;
        ">

            <div style="
                background:#153F63;
                color:white;
                padding:16px;
            ">

                <div style="
                    font-size:16px;
                    font-weight:800;
                ">
                    📋 CLIENTES MOROSOS
                </div>

                <div style="
                    font-size:12px;
                    margin-top:5px;
                    opacity:.9;
                ">
                    ${escaparHTML(asesorSeleccionado)}
                    · ${tituloRango}
                </div>

            </div>

            <div style="
                overflow-y:auto;
                flex:1;
            ">

                ${listado}

            </div>

            <div style="
                padding:12px;
                background:#F1F5F9;
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <strong>
                    CLIENTES: ${lista.length}
                </strong>

                <button
                    onclick="document.getElementById('modalMorososKPI').remove()"
                    style="
                        background:#153F63;
                        color:white;
                        border:none;
                        padding:9px 18px;
                        border-radius:8px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    CERRAR
                </button>

            </div>

        </div>

    `;

}
// ======================================================
// KPI DE COBRANZA - SLOPEZ
// SOLO CARTERA CON 31 DÍAS DE ATRASO A MÁS
// ======================================================

function generarKpiCobranza(){

    // ==========================================
// CONFIGURACIÓN DE COBRANZA
// ==========================================

const USUARIO_COBRANZA = "SLOPEZ";

// LEER METAS DESDE EXCEL DE COBRANZA
const metasCobranza = JSON.parse(
    localStorage.getItem("metasCobranza") || "[]"
);

const metaUsuario = metasCobranza.find(m =>
    String(m["Usuario"] || "")
        .trim()
        .toUpperCase() === USUARIO_COBRANZA
);

// METAS
const META_REDUCCION_SALDO =
    Number(metaUsuario?.["Meta Reduccion Saldo"]) || 3000;

const META_REDUCCION_OPERACIONES =
    Number(metaUsuario?.["Meta Reduccion Operaciones"]) || 5;

// BASE INICIAL
const SALDO_INICIAL =
    Number(metaUsuario?.["Saldo Inicial"]) || 88245;

const OPERACIONES_INICIALES =
    Number(metaUsuario?.["Operaciones Iniciales"]) || 70;
    

    // ==================================================
    // LEER DATA GENERAL
    // ==================================================

    const data = JSON.parse(
        localStorage.getItem("financiero")
    ) || [];


    // ==================================================
    // NORMALIZAR TEXTO
    // ==================================================

    const normalizar = valor => {

        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();

    };


    // ==================================================
    // CONVERTIR NUMEROS
    // ==================================================

    const numero = valor => {

        if(valor == null || valor === ""){
            return 0;
        }

        return Number(
            String(valor)
                .replace(/,/g,"")
                .replace(/S\/?/gi,"")
                .trim()
        ) || 0;

    };


    // ==================================================
    // SI NO EXISTE DATA GENERAL
    // ==================================================

    if(!data.length){

        return `
        <div style="
            margin-top:18px;
            padding:16px;
            border-radius:14px;
            background:#FFF7ED;
            border:1px solid #FED7AA;
            color:#9A3412;
        ">

            <h3 style="
                margin:0 0 8px;
                font-size:17px;
            ">
                📉 KPI DE COBRANZA - SLOPEZ
            </h3>

            <p style="margin:0">
                Cargue la Data General para actualizar
                los indicadores de cobranza.
            </p>

        </div>
        `;

    }


    // ==================================================
    // FILTRAR CARTERA SLOPEZ
    // 31 DÍAS A MÁS
    // ==================================================

    const cartera = data.filter(c => {

        const usuario = normalizar(
            c["Asesor(a)"]
        );

        const atraso = numero(
            c["Dias de retraso"]
        );

        return usuario === USUARIO_COBRANZA
            && atraso >= 31;

    });

   // ==========================================
// SUMAR SALDO CAPITAL DE CARTERA 31+
// ==========================================

let saldoActual = 0;

cartera.forEach(c => {
    saldoActual += numero(c["Saldo Capital"]);
});

    // ==================================================
    // CONTAR OPERACIONES ÚNICAS
    // ==================================================

    const operacionesUnicas = new Set();
    cartera.forEach(c => {

        const prestamo = String(
            c["Prestamo"] || ""
        ).trim();

        if(prestamo){

            operacionesUnicas.add(prestamo);

        }

    });

    const operacionesActuales =
        operacionesUnicas.size;
    // ==================================================
    // CALCULAR REDUCCIÓN
    // ==================================================

    const reduccionSaldo =
        SALDO_INICIAL - saldoActual;

    const reduccionOperaciones =
        OPERACIONES_INICIALES - operacionesActuales;


    // ==================================================
    // CUMPLIMIENTO DE META
    // ==================================================

    const cumplimientoSaldo =

        META_REDUCCION_SALDO > 0

        ? Math.max(
            0,
            (reduccionSaldo / META_REDUCCION_SALDO) * 100
        )

        : 0;


    const cumplimientoOperaciones =

        META_REDUCCION_OPERACIONES > 0

        ? Math.max(
            0,
            (reduccionOperaciones /
            META_REDUCCION_OPERACIONES) * 100
        )

        : 0;


    // ==================================================
    // BARRAS DE PROGRESO
    // ==================================================

    const progresoSaldo = Math.min(
        100,
        Math.max(0,cumplimientoSaldo)
    );


    const progresoOperaciones = Math.min(
        100,
        Math.max(0,cumplimientoOperaciones)
    );


    // ==================================================
    // FORMATO MONETARIO
    // ==================================================

    const moneda = valor => {

        return "S/ " + Number(valor || 0)
            .toLocaleString("es-PE",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            });

    };


    // ==================================================
    // ESTADO
    // ==================================================

    const colorSaldo =
        cumplimientoSaldo >= 100
        ? "#16A34A"
        : cumplimientoSaldo >= 80
        ? "#F59E0B"
        : "#DC2626";


    const colorOperaciones =
        cumplimientoOperaciones >= 100
        ? "#16A34A"
        : cumplimientoOperaciones >= 80
        ? "#F59E0B"
        : "#DC2626";


  // ==================================================
// HTML KPI - COMPACTO Y PROFESIONAL
// ==================================================

return `

<style>

/* ==========================================
   KPI COBRANZA - CREDICOMPANY
   DISEÑO COMPACTO
========================================== */

#kpiCobranzaCompacto{
    margin-top:6px !important;
    padding:8px !important;
    border-radius:10px !important;
    box-shadow:0 1px 4px rgba(0,0,0,.04) !important;
    box-sizing:border-box !important;
    width:100% !important;
}

/* ENCABEZADO */

#kpiCobranzaCompacto .cob-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:5px;
    margin-bottom:8px !important;
}

#kpiCobranzaCompacto .cob-titulo{
    margin:0 !important;
    color:#123F63;
    font-size:13px !important;
    font-weight:700;
    line-height:1.2 !important;
}

#kpiCobranzaCompacto .cob-subtitulo{
    margin-top:2px !important;
    color:#64748B;
    font-size:9px !important;
    line-height:1.2 !important;
}

#kpiCobranzaCompacto .cob-badge{
    background:#FEE2E2;
    color:#991B1B;
    padding:3px 6px !important;
    border-radius:20px;
    font-size:8px !important;
    font-weight:bold;
    white-space:nowrap;
}

/* TARJETAS */

#kpiCobranzaCompacto .cob-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
    gap:5px !important;
}

#kpiCobranzaCompacto .cob-card{
    min-width:0 !important;
    width:100% !important;
    padding:6px !important;
    border-radius:7px !important;
    box-sizing:border-box !important;
    overflow:hidden !important;
}

#kpiCobranzaCompacto .cob-label{
    font-size:8px !important;
    line-height:1.15 !important;
    color:#64748B;
    margin:0 !important;
}

#kpiCobranzaCompacto .cob-value{
    font-size:11px !important;
    font-weight:700 !important;
    line-height:1.15 !important;
    margin-top:2px !important;
    letter-spacing:-0.3px !important;
    white-space:nowrap !important;
    overflow:hidden !important;
    display:block !important;
    max-width:100% !important;
}

/* PROGRESO */

#kpiCobranzaCompacto .cob-progreso{
    margin-top:7px !important;
}

#kpiCobranzaCompacto .cob-progreso-titulo{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:4px !important;
    font-size:8px !important;
    font-weight:600;
    margin-bottom:3px !important;
}

#kpiCobranzaCompacto .cob-barra{
    height:4px !important;
    background:#E5E7EB;
    border-radius:20px;
    overflow:hidden;
}

#kpiCobranzaCompacto .cob-barra-interna{
    height:100%;
    border-radius:20px;
    transition:width .3s;
}

/* BASE INICIAL */

#kpiCobranzaCompacto .cob-base{
    margin-top:7px !important;
    padding:6px !important;
    background:#F8FAFC;
    border-radius:7px !important;
    color:#64748B;
    font-size:8px !important;
    line-height:1.25 !important;
}

/* ==========================================
   CELULAR
========================================== */

@media(max-width:600px){

    #kpiCobranzaCompacto{
        margin:4px 0 !important;
        padding:6px !important;
        border-radius:8px !important;
    }

    #kpiCobranzaCompacto .cob-header{
        margin-bottom:5px !important;
        gap:3px !important;
    }

    #kpiCobranzaCompacto .cob-titulo{
        font-size:12px !important;
    }

    #kpiCobranzaCompacto .cob-subtitulo{
        font-size:8px !important;
    }

    #kpiCobranzaCompacto .cob-badge{
        font-size:7px !important;
        padding:2px 5px !important;
    }

    #kpiCobranzaCompacto .cob-grid{
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        gap:4px !important;
    }

    #kpiCobranzaCompacto .cob-card{
        padding:5px !important;
        border-radius:6px !important;
    }

    #kpiCobranzaCompacto .cob-label{
        font-size:7px !important;
        line-height:1.1 !important;
    }

    #kpiCobranzaCompacto .cob-value{
        font-size:10px !important;
        margin-top:2px !important;
        line-height:1.1 !important;
    }

    #kpiCobranzaCompacto .cob-progreso{
        margin-top:5px !important;
    }

    #kpiCobranzaCompacto .cob-progreso-titulo{
        font-size:7px !important;
        margin-bottom:2px !important;
    }

    #kpiCobranzaCompacto .cob-barra{
        height:3px !important;
    }

    #kpiCobranzaCompacto .cob-base{
        margin-top:5px !important;
        padding:5px !important;
        font-size:7px !important;
        line-height:1.2 !important;
    }

}
</style>


<div id="kpiCobranzaCompacto" style="
    background:#FFFFFF;
    border:1px solid #DCE5ED;
">


    <!-- ENCABEZADO -->

    <div class="cob-header">

        <div>

            <h2 class="cob-titulo">
                📉 KPI DE COBRANZA
            </h2>

            <div class="cob-subtitulo">
                Usuario: <b>SLOPEZ</b>
                · Cartera de 31 días a más
            </div>

        </div>

        <div class="cob-badge">
            🔴 COBRANZA PESADA
        </div>

    </div>


    <!-- TARJETAS -->

    <div class="cob-grid">


        <!-- META SALDO -->

        <div class="cob-card" style="
            background:#EFF6FF;
            border:1px solid #DBEAFE;
        ">

            <div class="cob-label">
                🎯 Meta reducción saldo
            </div>

            <div class="cob-value" style="
                color:#1D4ED8;
            ">
                ${moneda(META_REDUCCION_SALDO)}
            </div>

        </div>


        <!-- REDUCCIÓN SALDO -->

        <div class="cob-card" style="
            background:#F0FDF4;
            border:1px solid #DCFCE7;
        ">

            <div class="cob-label">
                📉 Reducción saldo
            </div>

            <div class="cob-value" style="
                color:${colorSaldo};
            ">
                ${moneda(reduccionSaldo)}
            </div>

        </div>


        <!-- SALDO ACTUAL -->

        <div class="cob-card" style="
            background:#FFF7ED;
            border:1px solid #FED7AA;
        ">

            <div class="cob-label">
                🔴 Saldo actual 31+
            </div>

            <div class="cob-value" style="
                color:#C2410C;
            ">
                ${moneda(saldoActual)}
            </div>

        </div>


        <!-- META OPERACIONES -->

        <div class="cob-card" style="
            background:#F5F3FF;
            border:1px solid #DDD6FE;
        ">

            <div class="cob-label">
                🎯 Meta reducción operaciones
            </div>

            <div class="cob-value" style="
                color:#6D28D9;
            ">
                ${META_REDUCCION_OPERACIONES}
            </div>

        </div>


        <!-- REDUCCIÓN OPERACIONES -->

        <div class="cob-card" style="
            background:#F0FDF4;
            border:1px solid #DCFCE7;
        ">

            <div class="cob-label">
                ✅ Reducción operaciones
            </div>

            <div class="cob-value" style="
                color:${colorOperaciones};
            ">
                ${reduccionOperaciones}
            </div>

        </div>


        <!-- OPERACIONES ACTUALES -->

        <div class="cob-card" style="
            background:#FEF2F2;
            border:1px solid #FECACA;
        ">

            <div class="cob-label">
                📋 Operaciones actuales
            </div>

            <div class="cob-value" style="
                color:#B91C1C;
            ">
                ${operacionesActuales}
            </div>

        </div>


    </div>


    <!-- PROGRESO SALDO -->

    <div class="cob-progreso">

        <div class="cob-progreso-titulo">

            <span>
                📉 Cumplimiento reducción saldo
            </span>

            <span style="color:${colorSaldo}">
                ${cumplimientoSaldo.toFixed(1)}%
            </span>

        </div>

        <div class="cob-barra">

            <div class="cob-barra-interna" style="
                width:${progresoSaldo}%;
                background:${colorSaldo};
            "></div>

        </div>

    </div>


    <!-- PROGRESO OPERACIONES -->

    <div class="cob-progreso">

        <div class="cob-progreso-titulo">

            <span>
                🎯 Cumplimiento reducción operaciones
            </span>

            <span style="color:${colorOperaciones}">
                ${cumplimientoOperaciones.toFixed(1)}%
            </span>

        </div>

        <div class="cob-barra">

            <div class="cob-barra-interna" style="
                width:${progresoOperaciones}%;
                background:${colorOperaciones};
            "></div>

        </div>

    </div>


    <!-- BASE INICIAL -->

    <div class="cob-base">

        <b>📌 Base inicial de octubre</b>

        <br>

        Saldo inicial:
        ${moneda(SALDO_INICIAL)}

        <br>

        Operaciones iniciales:
        ${OPERACIONES_INICIALES}

        <br><br>

        <b>📌 Filtro aplicado:</b>

        <br>

        Usuario SLOPEZ ·
        31 días de atraso a más

    </div>


</div>

`;

}
// ======================================================
// HISTÓRICO MENSUAL KPI CREDICOMPANY
// ======================================================

function cerrarKPIHistorico(){

    const resumen = document.getElementById("kpiResumen");

    if(!resumen){
        alert("No se encontró el cuadro KPI.");
        return;
    }

  const fecha = new Date();

const periodo = localStorage.getItem("periodoProduccionKPI");

if(!periodo || !/^\d{4}-\d{2}$/.test(periodo)){

    alert("No se encontró un periodo válido de producción. Vuelve a cargar el Excel.");

    return;

}

const [anio, mes] = periodo.split("-");

    const confirmar = confirm(
        `¿Deseas guardar el cierre KPI del periodo ${periodo}?`
    );

    if(!confirmar) return;

    const tabla = resumen.querySelector(".kpi-asesor-card");

    if(!tabla){
        alert("No se encontró la tabla KPI por asesor.");
        return;
    }

    const datos = {
        periodo: periodo,
        fechaCierre: fecha.toISOString(),
        html: tabla.outerHTML
    };

    db.ref("kpiHistoricoMensual/" + periodo)
    .once("value")
    .then(snapshot=>{

       if(snapshot.exists()){

    alert(
        "ATENCIÓN: El periodo " + periodo +
        " ya tiene un cierre registrado.\n\n" +
        "No se permitirá modificar el histórico existente."
    );

    return;

}

        return db.ref("kpiHistoricoMensual/" + periodo)
        .set(datos);

    })
    .then(resultado=>{

        if(resultado === undefined) return;

        alert("Cierre KPI guardado correctamente.");

        cargarSelectorHistoricoKPI();

    })
    .catch(error=>{

        console.error("ERROR HISTÓRICO KPI:",error);

        alert("No se pudo guardar el histórico. Revisa Firebase.");

    });

}


// ======================================================
// CARGAR MESES DISPONIBLES
// ======================================================

function cargarSelectorHistoricoKPI(){

    const selector =
        document.getElementById("selectorHistoricoKPI");

    if(!selector) return;

    db.ref("kpiHistoricoMensual")
    .once("value")
    .then(snapshot=>{

        const historicos = snapshot.val() || {};

        selector.innerHTML =
        '<option value="">Consultar histórico mensual</option>';

        Object.keys(historicos)
        .sort()
        .reverse()
        .forEach(periodo=>{

            const opcion = document.createElement("option");

            opcion.value = periodo;
            opcion.textContent = periodo;

            selector.appendChild(opcion);

        });

    })
    .catch(error=>{

        console.error("ERROR CARGANDO HISTÓRICO:",error);

    });

}


// ======================================================
// CONSULTAR UN MES GUARDADO
// ======================================================

function consultarKPIHistorico(periodo){

    if(!periodo) return;

    db.ref("kpiHistoricoMensual/" + periodo)
    .once("value")
    .then(snapshot=>{

        const datos = snapshot.val();

        if(!datos || !datos.html){

            alert("No se encontró información de ese periodo.");
            return;

        }

        const resumen = document.getElementById("kpiResumen");

        if(!resumen) return;

        resumen.innerHTML = datos.html;

    })
    .catch(error=>{

        console.error("ERROR CONSULTANDO HISTÓRICO:",error);

        alert("No se pudo consultar el histórico.");

    });

}


// ======================================================
// VOLVER AL KPI ACTUAL
// ======================================================

function volverKPIActual(){

    const selector =
        document.getElementById("selectorHistoricoKPI");

    if(selector){
        selector.value = "";
    }

    cargarGerencialFirebase();

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
        
cargarSelectorHistoricoKPI();
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
    // Se carga únicamente cuando exista información válida
    try{
        cargarFinancieroFirebase();
    }catch(error){
        console.error(
            "❌ ERROR INICIANDO KPI FINANCIERO:",
            error
        );
    }

}
// ======================================================
// KPI FINANCIERO
// CARGAR DATA GENERAL
// ======================================================

function cargarExcelFinanciero(){

    const input =
        document.getElementById("excelFinanciero");

    if(!input || !input.files.length){

        alert("Seleccione el archivo financiero.");

        return;
    }

    const archivo = input.files[0];

    const lector = new FileReader();

    lector.onload = function(e){

        try{

            const data =
                new Uint8Array(
                    e.target.result
                );

            const wb =
                XLSX.read(
                    data,
                    {
                        type:"array"
                    }
                );

            const hoja =
                wb.Sheets[
                    wb.SheetNames[0]
                ];

            /*
            ==================================================
            LEER TODO EL EXCEL COMO MATRIZ
            ==================================================
            */

            const filas =
                XLSX.utils.sheet_to_json(
                    hoja,
                    {
                        header:1,
                        defval:""
                    }
                );

            console.log(
                "📊 FILAS LEÍDAS:",
                filas.length
            );

            /*
            ==================================================
            BUSCAR AUTOMÁTICAMENTE LA FILA DE ENCABEZADOS
            ==================================================
            */

            let filaEncabezado = -1;

            for(
                let i = 0;
                i < filas.length;
                i++
            ){

                const fila =
                    filas[i];

                const existeFecha =
                    fila.some(
                        celda =>
                        String(celda)
                        .trim()
                        .toLowerCase()
                        ===
                        "fecha desembolso"
                    );

                if(existeFecha){

                    filaEncabezado = i;

                    break;
                }

            }

            console.log(
                "📌 FILA ENCABEZADOS:",
                filaEncabezado + 1
            );

            /*
            ==================================================
            SI NO ENCUENTRA FECHA DE DESEMBOLSO
            ==================================================
            */

            if(filaEncabezado === -1){

                console.error(
                    "❌ No se encontró 'Fecha Desembolso'."
                );

                console.log(
                    "Primeras filas del Excel:",
                    filas.slice(0,10)
                );

                alert(
                    "❌ No se encontró la columna 'Fecha Desembolso' en el Excel."
                );

                return;
            }

            /*
            ==================================================
            CONVERTIR DESDE LA FILA CORRECTA
            ==================================================
            */

            const json =
                XLSX.utils.sheet_to_json(
                    hoja,
                    {
                        range:filaEncabezado,
                        defval:""
                    }
                );

            console.log(
                "📊 REGISTROS FINANCIEROS:",
                json.length
            );

            console.log(
                "📋 ENCABEZADOS ENCONTRADOS:",
                Object.keys(
                    json[0] || {}
                )
            );

            /*
            ==================================================
            VALIDAR ENCABEZADOS NECESARIOS
            ==================================================
            */

            if(!json.length){

                alert(
                    "❌ El Excel no contiene registros."
                );

                return;
            }

            const encabezados =
                Object.keys(
                    json[0]
                );

            const tieneFecha =
                encabezados.some(
                    x =>
                    String(x)
                    .trim()
                    .toLowerCase()
                    ===
                    "fecha desembolso"
                );

            if(!tieneFecha){

                console.error(
                    "❌ ENCABEZADOS:",
                    encabezados
                );

                alert(
                    "❌ No se encontró la columna Fecha Desembolso."
                );

                return;
            }

            /*
            ==================================================
            NORMALIZAR NOMBRE DE COLUMNA
            ==================================================
            */

            json.forEach(fila => {

                const claveFecha =
                    Object.keys(fila)
                    .find(
                        x =>
                        String(x)
                        .trim()
                        .toLowerCase()
                        ===
                        "fecha desembolso"
                    );

                if(
                    claveFecha &&
                    claveFecha !== "Fecha Desembolso"
                ){

                    fila["Fecha Desembolso"] =
                        fila[claveFecha];

                    delete fila[claveFecha];

                }

            });

            /*
            ==================================================
            VALIDAR FECHAS
            ==================================================
            */

            let fechasValidas = 0;

            json.forEach(c => {

                const valor =
                    c["Fecha Desembolso"];

                if(
                    valor !== undefined &&
                    valor !== null &&
                    valor !== ""
                ){

                    if(
                        typeof valor === "number"
                    ){

                        if(!isNaN(valor)){
                            fechasValidas++;
                        }

                    }
                    else{

                        const fecha =
                            new Date(valor);

                        if(
                            !isNaN(
                                fecha.getTime()
                            )
                        ){

                            fechasValidas++;

                        }

                    }

                }

            });

            console.log(
                "📅 FECHAS VÁLIDAS:",
                fechasValidas
            );

            if(!fechasValidas){

                alert(
                    "❌ El Excel tiene la columna Fecha Desembolso, pero no contiene fechas válidas."
                );

                return;
            }

            /*
            ==================================================
            GUARDAR LOCALMENTE
            ==================================================
            */

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

            /*
            ==================================================
            ACTUALIZAR ARCHIVO ACTIVO
            ==================================================
            */

            const archivoActivo =
                document.getElementById(
                    "archivoFinancieroActivo"
                );

            if(archivoActivo){

                archivoActivo.innerHTML =
                    "📂 Archivo vigente: " +
                    archivo.name;

            }

            /*
            ==================================================
            GENERAR KPI
            ==================================================
            */

            mostrarResumenFinanciero();

            /*
            ==================================================
            GUARDAR DATA COMPLETA EN FIREBASE
            ==================================================
            */

            guardarDatosFinancieros(
                json
            );

            /*
            ==================================================
            GUARDAR RESUMEN EN FIREBASE
            ==================================================
            */

            setTimeout(
                () => {

                    guardarFinancieroFirebase();

                },
                1000
            );

            alert(
                "✅ Excel financiero cargado y actualizado correctamente."
            );

        }
        catch(error){

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
function cargarFinancieroFirebase(){

    db.ref("kpiFinanciero")
    .once("value")
    .then(snapshot => {

        const datos =
            snapshot.val();

        const divFinanciero =
            document.getElementById(
                "resumenFinanciero"
            );

        if(!datos){
            return;
        }

        /*
        ============================================
        VALIDAR DATOS DE FIREBASE
        ============================================
        */

        if(
            Array.isArray(datos.datos) &&
            datos.datos.length > 0
        ){

            const primeraFila =
                datos.datos[0];

            /*
            Solo procesar si la data tiene
            la estructura correcta.
            */

            if(
                primeraFila &&
                Object.keys(
                    primeraFila
                ).some(
                    clave =>
                    String(clave)
                    .trim()
                    .toLowerCase()
                    ===
                    "fecha desembolso"
                )
            ){

                localStorage.setItem(
                    "financiero",
                    JSON.stringify(
                        datos.datos
                    )
                );

                mostrarResumenFinanciero();

                console.log(
                    "✅ KPI FINANCIERO RESTAURADO DESDE FIREBASE"
                );

            }
            else{

                console.warn(
                    "⚠️ Firebase contiene datos financieros antiguos. No se procesarán."
                );

            }

        }
        else if(
            divFinanciero &&
            datos.html
        ){

            divFinanciero.innerHTML =
                datos.html;

        }

    })
    .catch(error => {

        console.error(
            "❌ ERROR CARGANDO KPI FINANCIERO:",
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

// ==========================================
// GUARDAR PERIODO DE PRODUCCIÓN PARA HISTÓRICO
// ==========================================

localStorage.setItem(
    "periodoProduccionKPI",
    ultimaFecha.getUTCFullYear() + "-" +
    String(ultimaFecha.getUTCMonth() + 1).padStart(2, "0")
);
    
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
border:1px solid #DEE4EA;
font-size:14px;
font-weight:500;
box-shadow:0 2px 7px rgba(18,63,99,.06);
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
border:1px solid #E8EEF3;
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
? "#159447"
: mora <= 10
? "#D99A1A"
: "#D64545";

let fondo =
mora <= 5
? "#F2FAF4"
: mora <= 10
? "#FFF9EF"
: "#FFF3F3";

let borde =
mora <= 5
? "#22C55E"
: mora <= 10
? "#D99A1A"
: "#EF4444";
moraProductoHTML += `
<div
onclick="mostrarDetalleProducto('${r[0]}')"
style="
background:${fondo};
color:#243746;
border-left:5px solid ${borde};
padding:14px;
margin:10px 0;
border-radius:12px;
box-shadow:0 3px 10px rgba(18,63,99,.07);
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
border:1px solid #DEE4EA;
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
color:#667783;
">
👤 ${c["Asesor(a)"] || "SIN ASESOR"}
</span>

<span style="
font-size:11px;
color:#667783;
">
📦 ${c["Producto"] || ""}
</span>

</div>

<div style="
text-align:right;
font-weight:bold;
color:#159447;
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
border:1px solid #DEE4EA;
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
border:1px solid #DEE4EA;
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

<style>
/* =========================================
   KPI FINANCIERO - DISEÑO COMPACTO
   ESCRITORIO Y CELULAR
========================================= */

#resumenFinanciero {
    width: 100%;
    box-sizing: border-box;
}

/* BOTONES DE NAVEGACIÓN */

#resumenFinanciero .card-resumen {
    min-height: 65px !important;
    height: auto !important;
    padding: 9px 5px !important;
    margin: 0 !important;
    border-radius: 11px !important;
    font-size: 12px !important;
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 2px 6px rgba(18,63,99,.06) !important;
}

/* TARJETAS DE INDICADORES */

#panelResumen > div:first-child {
    gap: 7px !important;
    margin-bottom: 8px !important;
}

#panelResumen > div:first-child > div {
    min-height: 65px !important;
    height: auto !important;
    padding: 8px 5px !important;
    border-radius: 10px !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

/* ICONOS */

#panelResumen > div:first-child > div > div:first-child {
    font-size: 17px !important;
    margin-bottom: 2px !important;
}

/* VALORES PRINCIPALES */

#panelResumen > div:first-child > div > div:last-child {
    font-size: 16px !important;
    line-height: 1.15 !important;
    font-weight: 800 !important;
}

/* TARJETAS CARTERA SANA Y VENCIDA */

#panelResumen > div:nth-child(2) {
    gap: 7px !important;
    margin-top: 8px !important;
}

#panelResumen > div:nth-child(2) > div {
    padding: 9px !important;
    border-radius: 10px !important;
}

/* CONTENEDORES GENERALES */

#panelResumen > div {
    box-sizing: border-box;
}

/* AJUSTES PARA CELULARES */

@media screen and (max-width: 768px) {

    #resumenFinanciero {
        padding: 0 !important;
    }

    #resumenFinanciero .card-resumen {
        min-height: 58px !important;
        padding: 7px 4px !important;
        font-size: 11px !important;
    }

    #panelResumen > div:first-child {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 6px !important;
    }

    #panelResumen > div:first-child > div {
        min-height: 62px !important;
        padding: 6px 4px !important;
    }

    #panelResumen > div:first-child > div > div:first-child {
        font-size: 15px !important;
    }

    #panelResumen > div:first-child > div > div:last-child {
        font-size: 15px !important;
    }

    #panelResumen > div:nth-child(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 6px !important;
    }

    #panelResumen > div:nth-child(2) > div {
        padding: 8px 5px !important;
    }
}

/* =====================================
   TARJETAS COMPACTAS DE BONOS
===================================== */

#bonosTarjetasCompactas {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    margin: 7px 0 9px;
}

.bono-card-compacta {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px;
    border: 1px solid #dbe4ee;
    border-radius: 8px;
    background: #f8fafc;
    min-width: 0;
    box-sizing: border-box;
}

.bono-card-compacta.ganado {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.bono-avatar {
    width: 46px;
    height: 46px;
    min-width: 46px;
    border-radius: 50%;
    overflow: hidden;
    background: #24547b;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
}

.bono-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.bono-info {
    min-width: 0;
    flex: 1;
}

.bono-nombre {
    font-size: 8px;
    font-weight: 800;
    color: #123B63;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bono-monto {
    font-size: 12px;
    font-weight: 900;
    color: #64748b;
    margin-top: 2px;
    white-space: nowrap;
}

.bono-card-compacta.ganado .bono-monto {
    color: #15803d;
}

.bono-etiqueta {
    font-size: 7px;
    color: #64748b;
    margin-top: 1px;
}

/* CELULAR */
@media screen and (max-width: 600px) {

    #bonosTarjetasCompactas {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5px;
    }

    .bono-card-compacta {
        padding: 5px;
        gap: 5px;
    }

    .bono-avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
}

    .bono-nombre {
        font-size: 7px;
    }

    .bono-monto {
        font-size: 11px;
    }

    .bono-etiqueta {
        font-size: 7px;
    }
}

</style>

<div style="
display:grid;
grid-template-columns:${esMovil ? "repeat(2,1fr)" : "repeat(3,1fr)"};
gap:${esMovil ? "6px" : "8px"};
margin-bottom:${esMovil ? "10px" : "15px"};
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
grid-template-columns:${esMovil ? "repeat(2,1fr)" : "repeat(2,1fr)"};
gap:${esMovil ? "6px" : "10px"};
">

<div style="
background:#FFFFFF;
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="
font-size:28px;
margin-bottom:5px;
">
💰
</div>
<div>Cartera Total</div>
<div style="font-size:${esMovil ? "16px" : "22px"};;font-weight:bold;">
S/${carteraTotal.toLocaleString()}
</div>
</div>

<div style="
background:#FFFFFF;
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="font-size:${esMovil ? "16px" : "22px"};">💵</div>
<div>Capital Vencido</div>
<div style="font-size:${esMovil ? "16px" : "22px"};font-weight:bold;">
S/${capitalVencido.toLocaleString()}
</div>
</div>
<div style="
background:#FFFFFF;
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="font-size:${esMovil ? "16px" : "22px"};">💸</div>
<div>Costo Desembolso</div>
<div style="font-size:${esMovil ? "16px" : "22px"};font-weight:bold;">
S/${costoDesembolsoTotal.toLocaleString()}
</div>
</div>
<div style="
background:#FFFFFF;
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
padding:10px;
border-radius:12px;
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="font-size:${esMovil ? "16px" : "22px"};">📉</div>
<div>% Mora</div>
<div style="font-size:${esMovil ? "16px" : "22px"};font-weight:bold;">
${moraPorcentaje}%
</div>
</div>
<div style="
background:#FFFFFF;
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
padding:10px;
border-radius:12px;
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="font-size:${esMovil ? "16px" : "22px"};">🚨</div>
<div>Clientes +30</div>
<div style="font-size:${esMovil ? "16px" : "22px"};font-weight:bold;">
${clientesCriticos}
</div>
</div>

<div style="
background:#FFF7F7;
color:#991B1B;
border:1px solid #F1C1C1;
box-shadow:0 3px 10px rgba(18,63,99,.07);
padding:10px;
border-radius:12px;
text-align:center;
min-height:80px;min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};">

<div style="font-size:${esMovil ? "16px" : "22px"};">🔴</div>

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
color:#243746;
border:1px solid #DEE4EA;
box-shadow:0 3px 10px rgba(18,63,99,.07);
text-align:center;
min-height:${esMovil ? "62px" : "80px"};
padding:${esMovil ? "6px" : "10px"};
">
<div style="font-size:${esMovil ? "16px" : "22px"};;">📈</div>
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
background:#159447;
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
font-size:${esMovil ? "16px" : "22px"};
font-weight:bold;
">
S/${carteraSana.toLocaleString()}
</div>

</div>

<div style="
background:#D64545;
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
font-size:${esMovil ? "16px" : "22px"};
font-weight:bold;
">
S/${capitalVencido.toLocaleString()}
</div>

</div>

</div>

<div style="
background:#FFFFFF;
border:1px solid #DEE4EA;
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
box-shadow:0 3px 12px rgba(18,63,99,.07);
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

            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data,{type:"array"});
            const hoja = wb.Sheets[wb.SheetNames[0]];

            // Detectar automáticamente la fila real de encabezados.
            const matriz = XLSX.utils.sheet_to_json(hoja,{
                header:1,
                defval:"",
                raw:true
            });

            let filaEncabezado = -1;

            for(let i=0; i<Math.min(matriz.length,30); i++){

                const fila = matriz[i].map(v =>
                    String(v || "").trim().toUpperCase()
                );

                const tieneAsesor = fila.some(v => v.includes("ASESOR"));
                const tieneColocacion = fila.some(v =>
                    v.includes("COLOCACION") || v.includes("COLOCACIÓN")
                );
                const tieneOperaciones = fila.some(v => v.includes("OPERACIONES"));

                if(tieneAsesor && tieneColocacion && tieneOperaciones){
                    filaEncabezado = i;
                    break;
                }
            }

            if(filaEncabezado === -1){
                alert("❌ No se encontraron los encabezados ASESOR, COLOCACIÓN y OPERACIONES en el archivo de metas.");
                console.error("ENCABEZADOS ENCONTRADOS:", matriz.slice(0,15));
                return;
            }

            let json = XLSX.utils.sheet_to_json(hoja,{
                range:filaEncabezado,
                defval:"",
                raw:true
            });

            const normalizarTexto = texto =>
                String(texto || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g,"")
                .replace(/\s+/g," ")
                .trim()
                .toUpperCase();

            json = json.map(fila => {

                const claves = Object.keys(fila);

                const buscarClave = patrones => claves.find(clave => {
                    const n = normalizarTexto(clave);
                    return patrones.some(p => n.includes(p));
                });

                const claveAsesor = buscarClave(["ASESOR"]);
                const claveColocacion = buscarClave(["COLOCACION"]);
                const claveOperaciones = buscarClave(["OPERACIONES"]);
               const claveClientes = claves.find(clave =>
    normalizarTexto(clave) === "CLIENTES"
);

const salida = {...fila};

if (claveAsesor) {
    salida["Asesor (A)"] = String(
        fila[claveAsesor] || ""
    ).trim();
}

if (claveColocacion) {
    salida["COLOCACION"] = fila[claveColocacion];
}

if (claveOperaciones) {
    salida["OPERACIONES"] = fila[claveOperaciones];
}

if (claveClientes) {
    salida["META CLIENTES"] =
        Number(fila[claveClientes]) || 0;
}

return salida;
            }).filter(fila =>
                String(fila["Asesor (A)"] || "").trim() !== ""
            );

            if(!json.length){
                alert("❌ Se encontró la estructura del Excel, pero no se encontraron asesores con datos.");
                return;
            }

            localStorage.setItem("metasKPI",JSON.stringify(json));
            localStorage.setItem("nombreMetaKPI",archivo.name);
            localStorage.setItem("fechaMetaKPI",new Date().toLocaleString());

            // ACTUALIZAR LA TABLA KPI CON LAS METAS RECIÉN CARGADAS
const produccionGuardada = JSON.parse(
    localStorage.getItem("produccionKPI") || "[]"
);

if (
    produccionGuardada.length > 0 &&
    typeof generarKPI === "function"
) {
    generarKPI(produccionGuardada);
}

            const metaActiva = document.getElementById("metaActivaKPI");

            if(metaActiva){
                metaActiva.style.display = "block";
                metaActiva.innerHTML =
                    "🎯 Metas activas: " + archivo.name +
                    " • " + json.length + " asesores";
            }

            console.log("✅ METAS CARGADAS:",json);
            console.log("📌 FILA DE ENCABEZADOS DETECTADA:",filaEncabezado + 1);
            console.log("📌 ASESORES CARGADOS:",json.map(m => m["Asesor (A)"]));

            alert("✅ Metas cargadas correctamente. " + json.length + " asesores detectados.");

        }catch(error){
            console.error("❌ ERROR CARGANDO METAS:",error);
            alert("❌ Error al leer el archivo de metas.");
        }

    };

    lector.readAsArrayBuffer(archivo);

}

// ======================================================
// CARGAR METAS DE COBRANZA
// ACTUALIZA EXCLUSIVAMENTE KPI COBRANZA SLOPEZ
// ======================================================

function cargarMetasCobranza(){

    const input = document.getElementById("excelMetasCobranza");
    const archivo = input.files[0];

    if(!archivo){
        alert("Seleccione el archivo de metas de cobranza.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e){

        try{

            const data = new Uint8Array(e.target.result);

            const wb = XLSX.read(data,{
                type:"array"
            });

            const hoja = wb.Sheets[wb.SheetNames[0]];

            const matriz = XLSX.utils.sheet_to_json(
                hoja,
                {
                    header:1,
                    defval:"",
                    raw:true
                }
            );

            // ==========================================
            // NORMALIZAR ENCABEZADOS
            // ==========================================

            const normalizar = texto => {

                return String(texto || "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g,"")
                    .replace(/\s+/g," ")
                    .trim()
                    .toUpperCase();

            };

            // ==========================================
// DETECTAR ENCABEZADOS DEL EXCEL REAL
// ==========================================

let filaEncabezado = -1;

let columnas = {};

for(let i = 0; i < Math.min(matriz.length,30); i++){

    const fila = matriz[i].map(normalizar);

    const idxUsuario = fila.findIndex(v =>
        v.includes("COBRADOR") ||
        v === "USUARIO" ||
        v === "ASESOR"
    );

    const idxMetaSaldo = fila.findIndex(v =>
        v.includes("REDUCCION SALDO VENCIDO") ||
        v.includes("META REDUCCION SALDO")
    );

    const idxMetaOperaciones = fila.findIndex(v =>
        v.includes("REDUCCION OPERACIONES VENCIDAS") ||
        v.includes("META REDUCCION OPERACIONES")
    );

    const idxSaldoInicial = fila.findIndex(v =>
        v.includes("MORA OCTUBRE") ||
        v.includes("SALDO INICIAL")
    );

    const idxOperacionesIniciales = fila.findIndex(v =>
        v.includes("CLIENTES OCTUBRE") ||
        v.includes("OPERACIONES INICIALES")
    );

    if(
        idxUsuario !== -1 &&
        idxMetaSaldo !== -1 &&
        idxMetaOperaciones !== -1 &&
        idxSaldoInicial !== -1 &&
        idxOperacionesIniciales !== -1
    ){

        filaEncabezado = i;

        columnas = {
            usuario:idxUsuario,
            metaSaldo:idxMetaSaldo,
            metaOperaciones:idxMetaOperaciones,
            saldoInicial:idxSaldoInicial,
            operacionesIniciales:idxOperacionesIniciales
        };

        break;
    }
}

if(filaEncabezado === -1){

    alert(
        "❌ No se reconocieron los encabezados del Excel de metas de cobranza."
    );

    console.error("ENCABEZADOS:",matriz);

    return;
}

// ==========================================
// LEER FILAS DIRECTAMENTE POR POSICIÓN
// ==========================================

const metas = [];

for(let i = filaEncabezado + 1; i < matriz.length; i++){

    const fila = matriz[i];

    const usuario = String(
        fila[columnas.usuario] || ""
    ).trim().toUpperCase();

    if(!usuario){
        continue;
    }

    const numero = valor => {

        if(valor == null || valor === ""){
            return 0;
        }

        return Number(
            String(valor)
                .replace(/,/g,"")
                .replace(/S\/?/gi,"")
                .trim()
        ) || 0;
    };

    metas.push({

        "Usuario":usuario,

        "Meta Reduccion Saldo":
            numero(fila[columnas.metaSaldo]),

        "Meta Reduccion Operaciones":
            numero(fila[columnas.metaOperaciones]),

        "Saldo Inicial":
            numero(fila[columnas.saldoInicial]),

        "Operaciones Iniciales":
            numero(fila[columnas.operacionesIniciales])

    });
}

            // ==========================================
            // VALIDAR USUARIO SLOPEZ
            // ==========================================

            const metaSLOPEZ = metas.find(m =>
                m["Usuario"] === "SLOPEZ"
            );

            if(!metaSLOPEZ){

                alert(
                    "❌ El archivo no contiene metas para SLOPEZ."
                );

                console.error("METAS LEÍDAS:",metas);

                return;

            }

            // ==========================================
            // GUARDAR METAS DE COBRANZA
            // ==========================================

            localStorage.setItem(
                "metasCobranza",
                JSON.stringify(metas)
            );

            localStorage.setItem(
                "nombreMetaCobranza",
                archivo.name
            );

            localStorage.setItem(
                "fechaMetaCobranza",
                new Date().toLocaleString("es-PE")
            );

            // ==========================================
            // ACTUALIZAR SOLO KPI COBRANZA
            // ==========================================

            const contenedor =
                document.getElementById("kpiCobranzaWrapper");

            if(contenedor){

                contenedor.innerHTML =
                    generarKpiCobranza();

            }else{

                console.warn(
                    "No se encontró kpiCobranzaWrapper. " +
                    "Primero cargue o actualice el KPI."
                );

            }

            // ==========================================
            // CONFIRMAR
            // ==========================================

            alert(
                "✅ METAS DE COBRANZA CARGADAS\n\n" +
                "Usuario: " + metaSLOPEZ["Usuario"] +
                "\nMeta reducción saldo: S/ " +
                metaSLOPEZ["Meta Reduccion Saldo"].toLocaleString("es-PE") +
                "\nMeta reducción operaciones: " +
                metaSLOPEZ["Meta Reduccion Operaciones"] +
                "\nSaldo inicial: S/ " +
                metaSLOPEZ["Saldo Inicial"].toLocaleString("es-PE") +
                "\nOperaciones iniciales: " +
                metaSLOPEZ["Operaciones Iniciales"] +
                "\n\n📉 Solo se actualizó el KPI de Cobranza."
            );

            console.log(
                "✅ METAS DE COBRANZA:",
                metas
            );

            input.value = "";

        }catch(error){

            console.error(
                "❌ ERROR METAS COBRANZA:",
                error
            );

            alert(
                "❌ Error al procesar las metas de cobranza.\n\n" +
                error.message
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
XLSX.utils.sheet_to_json(
    hoja,
    {
        range: 6,
        defval: ""
    }
);

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
<button onclick="volverProductos()" style="width:100%;padding:14px;border:none;border-radius:12px;background:#123F63;color:#fff;font-weight:bold;cursor:pointer">
← Volver a Productos
</button>
</div>

<div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #DEE4EA">
<h2 style="margin:0;text-align:center;color:#123F63">${producto}</h2>
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
// ==========================================================

// ==========================================================

// CREDICOMPANY - DESEMBOLSOS POR ASESOR DE LUNES A SABADO

// Agrupa por asesor y suma los desembolsos de cada dia.

// Usa la semana (lunes-sabado) que contiene la fecha mas reciente

// presente en los datos recibidos desde Cargar Produccion.

// ==========================================================

 

function generarCuadroDesembolsosAsesor(produccion) {

    const filas = Array.isArray(produccion) ? produccion : [];

 

    const normalizar = valor => String(valor ?? "")

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "")

        .replace(/\s+/g, " ")

        .trim()

        .toUpperCase();

 

    const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, c => ({

        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"

    }[c]));

 

    const buscarColumna = (fila, opciones) => {

        const claves = Object.keys(fila || {});

        for (const opcion of opciones) {

            const exacta = claves.find(k => normalizar(k) === normalizar(opcion));

            if (exacta) return exacta;

        }

        for (const opcion of opciones) {

            const parcial = claves.find(k => normalizar(k).includes(normalizar(opcion)));

            if (parcial) return parcial;

        }

        return null;

    };

 

    const convertirFecha = valor => {

        if (valor instanceof Date && !isNaN(valor.getTime())) {

            return new Date(Date.UTC(valor.getFullYear(), valor.getMonth(), valor.getDate()));

        }

 

        // Numero serial de fecha de Excel.

        if (typeof valor === "number" && Number.isFinite(valor)) {

            const fecha = new Date(Date.UTC(1899, 11, 30) + Math.floor(valor) * 86400000);

            return isNaN(fecha.getTime()) ? null : fecha;

        }

 

        if (valor == null || String(valor).trim() === "") return null;

        const texto = String(valor).trim();

        let m = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);

        let fecha;

 

        if (m) {

            fecha = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));

        } else {

            // Maneja cadenas ISO y formatos que el navegador pueda interpretar.

            fecha = new Date(texto);

            if (!isNaN(fecha.getTime())) {

                fecha = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));

            }

        }

        return !fecha || isNaN(fecha.getTime()) ? null : fecha;

    };

 

    const convertirNumero = valor => {

        if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;

        let texto = String(valor ?? "").trim().replace(/[S\/\s]/g, "");

        // Ejemplo: 1,805.00 -> 1805.00

        texto = texto.replace(/,/g, "");

        const n = Number(texto);

        return Number.isFinite(n) ? n : 0;

    };

 

    const formatoSoles = valor => Number(valor || 0).toLocaleString("es-PE", {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    });

 

    const mostrarAviso = mensaje => `

        <section id="cuadroDesembolsosAsesor" class="desembolsos-panel">

            <h3>DESEMBOLSOS POR ASESOR · LUNES A SÁBADO</h3>

            <p>${escapar(mensaje)}</p>

        </section>`;

 

    if (!filas.length) {

        return mostrarAviso("No se recibieron registros. Verifica que Cargar Producción haya cargado la data.");

    }

 

    const muestra = filas.find(f => f && typeof f === "object") || {};

 

    // Columnas esperadas en DATA GENERAL / Cargar Produccion.

    const colFecha = buscarColumna(muestra, ["Fecha Desembolso", "Fecha de Desembolso"]);

    const colMonto = buscarColumna(muestra, [

        "Monto Otorgado", "Monto Desembolsado", "Total Desembolsado", "Monto"

    ]);

    const colAsesor = buscarColumna(muestra, ["Asesor(a)", "Asesor"]);

    const colCliente = buscarColumna(muestra, ["Cliente", "Apellidos y Nombres", "Nombre Cliente"]);

    const colCodigo = buscarColumna(muestra, [

        "Cod Cliente", "Código Cliente", "Codigo Cliente", "DNI", "Documento"

    ]);

 

    if (!colFecha || !colMonto || !colAsesor) {

        return mostrarAviso(

            "No se reconocieron las columnas de fecha de desembolso, monto y asesor. Revisa los encabezados del Excel."

        );

    }

 

    const registros = filas.map(f => {

        const fecha = convertirFecha(f[colFecha]);

        const asesor = String(f[colAsesor] ?? "").trim() || "SIN ASESOR";

        const nombreCliente = colCliente ? String(f[colCliente] ?? "").trim() : "";

        const codigoCliente = colCodigo ? String(f[colCodigo] ?? "").trim() : "";

        const llaveCliente = normalizar(codigoCliente || nombreCliente);

 

        return {

            fecha,

            asesor,

            llaveAsesor: normalizar(asesor),

            llaveCliente,

            monto: convertirNumero(f[colMonto])

        };

    }).filter(r => r.fecha && r.llaveAsesor && r.llaveCliente);

 

    if (!registros.length) {

        return mostrarAviso("No se encontraron registros con fecha, asesor y cliente válidos.");

    }

 

    // La semana mostrada es la semana calendario (lunes-sabado)

    // que contiene la fecha mas reciente disponible en la data.

    const fechaMasReciente = registros.reduce(

        (max, r) => !max || r.fecha > max ? r.fecha : max,

        null

    );

 

    const inicioSemana = new Date(fechaMasReciente);

    const diaSemana = inicioSemana.getUTCDay(); // domingo=0, lunes=1

    const retroceso = diaSemana === 0 ? 6 : diaSemana - 1;

    inicioSemana.setUTCDate(inicioSemana.getUTCDate() - retroceso);

    inicioSemana.setUTCHours(0, 0, 0, 0);

 

    const dias = [];

    for (let i = 0; i < 6; i++) {

        const fecha = new Date(inicioSemana);

        fecha.setUTCDate(inicioSemana.getUTCDate() + i);

        dias.push(fecha);

    }

 

    const fechaFinSemana = dias[5];

    const claveFecha = fecha => [

        fecha.getUTCFullYear(),

        String(fecha.getUTCMonth() + 1).padStart(2, "0"),

        String(fecha.getUTCDate()).padStart(2, "0")

    ].join("-");

 

    const fechaEnRango = registros.filter(r =>

        claveFecha(r.fecha) >= claveFecha(inicioSemana) &&

        claveFecha(r.fecha) <= claveFecha(fechaFinSemana)

    );

 

    const nombresDias = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

    const fechaCorta = fecha => `${String(fecha.getUTCDate()).padStart(2, "0")}/${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`;

    const fechaCompleta = fecha => `${fechaCorta(fecha)}/${fecha.getUTCFullYear()}`;

 

    const grupos = new Map();

 

    fechaEnRango.forEach(r => {

        if (!grupos.has(r.llaveAsesor)) {

            grupos.set(r.llaveAsesor, {

                asesor: r.asesor,

                clientes: new Set(),

                operaciones: 0,

               dias: [0, 0, 0, 0, 0, 0],
                operacionesDias: [0, 0, 0, 0, 0, 0]

            });

        }

 

        const grupo = grupos.get(r.llaveAsesor);

        grupo.clientes.add(r.llaveCliente);

        grupo.operaciones += 1;

 

        const indiceDia = Math.round((r.fecha - inicioSemana) / 86400000);

       if (indiceDia >= 0 && indiceDia <= 5) {
    grupo.dias[indiceDia] += r.monto;
    grupo.operacionesDias[indiceDia] += 1;
}

    });

 

    const gruposOrdenados = [...grupos.values()].sort(

        (a, b) => a.asesor.localeCompare(b.asesor, "es")

    );

 

    let totalGeneralDias = [0, 0, 0, 0, 0, 0];

    let totalClientes = 0;

    let totalOperaciones = 0;

 

    const rangoTexto = `${fechaCorta(inicioSemana)} al ${fechaCorta(fechaFinSemana)}/${fechaFinSemana.getUTCFullYear()}`;

 

    let html = `

    <style>

        #cuadroDesembolsosAsesor {

            margin-top: 9px;

            padding: 8px;

            width: 100%;

            box-sizing: border-box;

            background: #fff;

            border: 1px solid #dbe4ee;

            border-radius: 10px;

            box-shadow: 0 2px 8px rgba(18,59,99,.06);

            font-family: Arial, sans-serif;

        }

        #cuadroDesembolsosAsesor h3 {

            text-align: center;

            color: #123B63;

            font-size: 15px;

            font-weight: 800;

            margin: 2px 0 5px;

        }

        #cuadroDesembolsosAsesor .meta {

            text-align: right;

            color: #526579;

            font-size: 10px;

            margin: 0 0 6px;

        }

        #cuadroDesembolsosAsesor .scroll {

            width: 100%;

            overflow-x: auto;

            -webkit-overflow-scrolling: touch;

        }

        #cuadroDesembolsosAsesor table {

            width: 100%;

            min-width: 790px;

            border-collapse: collapse;

            font-size: 10px;

            color: #17212b;

        }

        #cuadroDesembolsosAsesor th {

            background: #24547b;

            color: #fff;

            border: 1px solid #d6dee7;

            padding: 6px 4px;

            text-align: center;

            white-space: normal;

            font-size: 9px;

        }

        #cuadroDesembolsosAsesor td {

            border: 1px solid #d6dee7;

            padding: 5px 4px;

            line-height: 1.15;

        }

        #cuadroDesembolsosAsesor tbody tr:nth-child(even) {

            background: #f7fafc;

        }

        #cuadroDesembolsosAsesor .asesor {

            color: #123B63;

            font-weight: 800;

            white-space: nowrap;

            text-align: center;

        }

        #cuadroDesembolsosAsesor .clientes,

        #cuadroDesembolsosAsesor .operaciones {

            text-align: center;

            white-space: nowrap;

            font-weight: 700;

        }

        #cuadroDesembolsosAsesor .monto {

            text-align: right;

            white-space: nowrap;

            font-variant-numeric: tabular-nums;

        }

        #cuadroDesembolsosAsesor .total-semana {

            background: #edf3fb;

            font-weight: 800;

        }

        #cuadroDesembolsosAsesor tfoot td {

            background: #dce6f7;

            font-weight: 800;

            border-top: 2px solid #123B63;

        }

        @media screen and (max-width: 600px) {

            #cuadroDesembolsosAsesor {

                margin-top: 6px;

                padding: 5px;

                border-radius: 8px;

            }

            #cuadroDesembolsosAsesor h3 {

                font-size: 12px;

            }

            #cuadroDesembolsosAsesor .meta {

                font-size: 9px;

            }

            #cuadroDesembolsosAsesor table {

                min-width: 740px;

                font-size: 9px;

            }

            #cuadroDesembolsosAsesor th {

                padding: 5px 3px;

                font-size: 8px;

            }

            #cuadroDesembolsosAsesor td {

                padding: 4px 3px;

            }

        }

    </style>

    <section id="cuadroDesembolsosAsesor" class="desembolsos-panel">

        <h3>CUADRO DE DESEMBOLSOS POR ASESOR · LUNES A SÁBADO</h3>

        <p class="meta">Semana: <b>${rangoTexto}</b> · Asesores: ${gruposOrdenados.length}</p>

<!-- TARJETAS COMPACTAS DE BONOS -->
<div id="bonosTarjetasCompactas">
    <!--BONOS_CARDS-->
</div>

<div class="scroll">

            <table>

                <thead>

                    <tr>

                        <th>ASESOR</th>

                        <th>CLIENTES</th>

                        ${dias.map((d, i) => `<th>${nombresDias[i]}<br>${fechaCorta(d)}</th>`).join("")}

                        <th>TOTAL SEMANAL</th>
                          <th>OPERACIONES</th>
                            <th>DÍAS</th>
                            <th>BONO CONSTANCIA</th>
                            <th>BONO PRODUCCIÓN</th>
                            <th>TOTAL BONO</th>
                            <th>MENSAJE</th>

                    </tr>

                </thead>

                <tbody>`;

 
let totalBonoConstancia = 0;
let totalBonoProduccion = 0;
let totalBonosSemana = 0;

// DATOS PARA LAS TARJETAS COMPACTAS DE BONOS
const tarjetasBonos = [];
    
    gruposOrdenados.forEach(g => {

        const cantidadClientes = g.clientes.size;

        totalClientes += cantidadClientes;

        totalOperaciones += g.operaciones;

 

        const sumaSemanal = g.dias.reduce((s, n) => s + n, 0);

        // ======================================
// BONOS SEMANALES CREDICOMPANY
// ======================================

const diasCumplidos = g.operacionesDias.filter(n => n > 0).length;

// BONO 1: CONSTANCIA
const bonoConstancia = diasCumplidos === 6 ? 50 : 0;

// BONO 2: PRODUCCIÓN
let bonoProduccion = 0;

if (sumaSemanal >= 25000) {
    bonoProduccion = 120;
} else if (sumaSemanal >= 20000) {
    bonoProduccion = 80;
} else if (sumaSemanal >= 15000) {
    bonoProduccion = 50;
} else if (sumaSemanal >= 10000) {
    bonoProduccion = 30;
}

const bonoTotal = bonoConstancia + bonoProduccion;

        // REGISTRAR BONOS PARA LAS TARJETAS VISUALES
tarjetasBonos.push({
    asesor: g.asesor,
    bonoConstancia: bonoConstancia,
    bonoProduccion: bonoProduccion,
    bonoTotal: bonoTotal,
    sumaSemanal: sumaSemanal,
    diasCumplidos: diasCumplidos
});
        
        totalBonoConstancia += bonoConstancia;
        totalBonoProduccion += bonoProduccion;
        totalBonosSemana += bonoTotal;

// ======================================
// MENSAJE MOTIVACIONAL DINÁMICO
// ======================================
let mensajeBono = "";

if (bonoTotal > 0) {

    mensajeBono = `🏆 ¡GANASTE S/ ${bonoTotal}!`;

} else if (diasCumplidos === 5) {

    mensajeBono = "🔥 ¡A UN DÍA DE GANAR S/50!";

} else if (diasCumplidos === 4) {

    mensajeBono = "💪 ¡SOLO FALTAN 2 DÍAS!";

} else if (diasCumplidos >= 3) {

    mensajeBono = "🚀 ¡VAS POR BUEN CAMINO!";

} else if (diasCumplidos >= 1) {

    mensajeBono = "⚡ ¡CADA DÍA CUENTA!";

} else {

    mensajeBono = "📈 ¡EMPIEZA TU RACHA!";
}

        g.dias.forEach((n, i) => totalGeneralDias[i] += n);

        html += `

            <tr>

                <td class="asesor">${escapar(g.asesor)}</td>

                <td class="clientes">${String(cantidadClientes).padStart(2, "0")}</td>

                ${g.dias.map(n => `<td class="monto">${formatoSoles(n)}</td>`).join("")}

                <td class="monto total-semana">${formatoSoles(sumaSemanal)}</td>
<td class="operaciones">${g.operaciones}</td>

<td class="operaciones">
${diasCumplidos}/6
</td>

<td class="monto">
S/ ${formatoSoles(bonoConstancia)}
</td>

<td class="monto">
S/ ${formatoSoles(bonoProduccion)}
</td>

<td class="monto total-semana">
S/ ${formatoSoles(bonoTotal)}
</td>

<td style="
    text-align:center;
    font-weight:800;
    color:#123B63;
    white-space:nowrap;
">
${mensajeBono}
</td>

            </tr>`;

    });

 

    const totalGeneral = totalGeneralDias.reduce((s, n) => s + n, 0);

 

    html += `

                </tbody>

                <tfoot>

                    <tr>

                        <td class="asesor">TOTAL GENERAL</td>

                        <td class="clientes">${String(totalClientes).padStart(2, "0")}</td>

                        ${totalGeneralDias.map(n => `<td class="monto">${formatoSoles(n)}</td>`).join("")}

                        <td class="monto">${formatoSoles(totalGeneral)}</td>

                       <td class="operaciones">${totalOperaciones}</td>

<td class="operaciones">—</td>

<td class="monto">
S/ ${formatoSoles(totalBonoConstancia)}
</td>

<td class="monto">
S/ ${formatoSoles(totalBonoProduccion)}
</td>

<td class="monto total-semana">
S/ ${formatoSoles(totalBonosSemana)}
</td>

<td class="operaciones">
🏆 BONOS
</td>

                    </tr>

                </tfoot>

            </table>

        </div>

    </section>`;

 // ======================================
// GENERAR TARJETAS COMPACTAS DE BONOS
// ======================================
// OBTENER USUARIOS Y SUS FOTOGRAFÍAS
const usuariosBonos = JSON.parse(
    localStorage.getItem("usuarios")
) || [];
const tarjetasBonosHTML = tarjetasBonos
    .slice()
    .sort((a, b) => b.bonoTotal - a.bonoTotal)
    .map(item => {

        const nombre = String(item.asesor || "").trim();

// BUSCAR PERFIL DEL COLABORADOR
const usuarioPerfil = usuariosBonos.find(u =>
    String(u.user || u.usuario || u.nombre || "")
        .trim()
        .toUpperCase() === nombre.toUpperCase()
);

// OBTENER FOTO DEL PERFIL
const foto = usuarioPerfil?.foto || "";

// INICIALES SI NO TIENE FOTO
const iniciales = nombre
    .split(/\s+/)
    .map(p => p.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

const tieneBono = item.bonoTotal > 0;

        return `
            <div class="bono-card-compacta ${tieneBono ? "ganado" : ""}">

               <div class="bono-avatar">
    ${
        foto
        ? `<img src="${foto}" alt="${nombre}"
             onerror="this.style.display='none'">`
        : iniciales
    }
</div>

                <div class="bono-info">

                    <div class="bono-nombre">
                        ${escapar(nombre)}
                    </div>

                    <div class="bono-monto">
                        S/ ${formatoSoles(item.bonoTotal)}
                    </div>

                    <div class="bono-etiqueta">
                        ${tieneBono ? "🏆 BONO GANADO" : "BONO EN PROGRESO"}
                    </div>

                </div>

            </div>
        `;
    })
    .join("");

// Insertar tarjetas en el espacio reservado

html = html.replace(
    "<!--BONOS_CARDS-->",
    tarjetasBonosHTML
);

    return html;

}
