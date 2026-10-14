// =====================================
// CARGAR RESULTADO MENSUAL
// =====================================

function cargarResultadoMensual(){

recuperarIngresos();

recuperarGastos();

actualizarResultadoMensual();

}
// =====================================
// ACTUALIZAR RESULTADO MENSUAL
// =====================================

function actualizarResultadoMensual(){
    let ingresos = 0;
    let gastos = 0;

    let datosGastos =
    JSON.parse(localStorage.getItem("resultadoGastos")) || [];
// =====================================
// LEER TOTALES GUARDADOS
// =====================================

let totalInteres =
parseFloat(localStorage.getItem("rmInteres")) || 0;

let totalMoraReal =
parseFloat(localStorage.getItem("rmMoraReal")) || 0;

ingresos =
totalInteres + totalMoraReal; 

    // =====================================
// SUMAR SOLO LA COLUMNA MONTO
// =====================================

gastos =
Number(localStorage.getItem("rmGastos")) || 0;

    let utilidadOperativa = ingresos - gastos;

    let utilidadNeta = utilidadOperativa;
document.getElementById("rmIngresos").innerHTML =
"S/ " + ingresos.toLocaleString("es-PE",{
minimumFractionDigits:2
});

    document.getElementById("rmGastos").innerHTML =
    "S/ " + gastos.toLocaleString("es-PE", {
        minimumFractionDigits:2
    });

    document.getElementById("rmOperativa").innerHTML =
    "S/ " + utilidadOperativa.toLocaleString("es-PE", {
        minimumFractionDigits:2
    });

    document.getElementById("rmNeta").innerHTML =
    "S/ " + utilidadNeta.toLocaleString("es-PE", {
        minimumFractionDigits:2
    });
document.getElementById("rmInteres").innerHTML =
"S/ " + totalInteres.toLocaleString("es-PE", {
minimumFractionDigits:2
});

document.getElementById("rmMoraReal").innerHTML =
"S/ " + totalMoraReal.toLocaleString("es-PE", {
minimumFractionDigits:2
});

document.getElementById("rmTotalIngresos").innerHTML =
"S/ " + ingresos.toLocaleString("es-PE", {
minimumFractionDigits:2
});

}
// =====================================
// CARGAR EXCEL INGRESOS
// =====================================

function cargarExcelIngresos(){

let archivo =
document.getElementById("excelIngresos").files[0];

if(!archivo){

alert("Seleccione el archivo de ingresos");

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
XLSX.utils.sheet_to_json(hoja,{
    range:3
});

 // =====================================
// OBTENER PERÍODO DEL EXCEL
// =====================================

let primeraFila = json[0];

let nombreFecha =
Object.keys(primeraFila).find(c =>
c.toUpperCase().includes("FECHA")
);

let periodo =
obtenerPeriodoExcel(
primeraFila[nombreFecha]
);

if(!periodo){

    alert("No se pudo obtener el período del archivo de ingresos.");

    return;

}

localStorage.setItem(
"rmPeriodo",
periodo
);
    
    // =====================================
// OBTENER FILA TOTAL
// =====================================

let ultimaFila =
json.find(f => String(f["CUOTA"]).trim() === "TOTAL");

if(!ultimaFila){

    alert("No se encontró la fila TOTAL.");

    return;

}

let totalInteres =
parseFloat(ultimaFila["INTERES"]) || 0;

let totalMoraReal =
parseFloat(ultimaFila["MORA REAL"]) || 0;

localStorage.setItem(
"rmInteres",
totalInteres
);

localStorage.setItem(
"rmMoraReal",
totalMoraReal
);
localStorage.setItem(
"resultadoIngresos",
JSON.stringify(json)
);
// =====================================
// RENTABILIDAD POR ASESOR
// =====================================

let rankingAsesor = {};

json.forEach(f=>{

    // Ignorar fila TOTAL
    if(String(f["CUOTA"]).trim().toUpperCase()=="TOTAL") return;

    let asesor = (f["ASESOR"] || "SIN ASESOR").toString().trim();

    let interes = Number(f["INTERES"]) || 0;

    let moraReal = Number(f["MORA REAL"]) || 0;

    if(!rankingAsesor[asesor]){

        rankingAsesor[asesor]={
            interes:0,
            moraReal:0
        };

    }

    rankingAsesor[asesor].interes += interes;

    rankingAsesor[asesor].moraReal += moraReal;

});

localStorage.setItem(
"rankingRentabilidadAsesor",
JSON.stringify(rankingAsesor)
);
    localStorage.setItem(
"nombreResultadoIngresos",
archivo.name
);

document.getElementById(
"archivoIngresosActivo"
).innerHTML =
"📂 " + archivo.name;

actualizarResultadoMensual();
mostrarRentabilidadAsesor();
guardarResultadoMensualFirebase();

cargarHistoricoResultado();

alert("✅ Archivo de ingresos cargado");

};

lector.readAsArrayBuffer(archivo);

}
// =====================================
// CARGAR EXCEL GASTOS
// =====================================

function cargarExcelGastos(){

let archivo =
document.getElementById("excelGastos").files[0];

if(!archivo){

alert("Seleccione el archivo de gastos");

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
XLSX.utils.sheet_to_json(hoja,{
    range:3
});

// =====================================
// PERÍODO DEL EXCEL GASTOS
// =====================================

let primeraFila = json[0];

let nombreFecha =
Object.keys(primeraFila).find(c =>
c.toUpperCase().includes("FECHA")
);

let periodo =
obtenerPeriodoExcel(
primeraFila[nombreFecha]
);

if(!periodo){

    alert("No se pudo obtener el período del archivo de gastos.");

    return;

}
let periodoIngresos =
localStorage.getItem("rmPeriodo");

if(periodoIngresos && periodoIngresos !== periodo){

    alert(
    "Los archivos de ingresos y gastos pertenecen a meses diferentes."
    );

    return;

}
// =====================================
// SUMAR COLUMNA MONTO
// =====================================

let totalGastos = 0;

json.forEach(f=>{

    console.log("FILA GASTOS:", f);

    totalGastos +=
    Number(f["Monto"]) || 0;

});

localStorage.setItem(
"rmGastos",
totalGastos
);
localStorage.setItem(
"resultadoGastos",
JSON.stringify(json)
);
localStorage.setItem(
"nombreResultadoGastos",
archivo.name
);

alert("LLEGUÉ AQUÍ");

document.getElementById(
"archivoGastosActivo"
).innerHTML =
"📂 " + archivo.name;

actualizarResultadoMensual();
console.log("TOTAL GASTOS:", totalGastos);
console.log("ARCHIVO:", archivo.name);
console.log("PERIODO:", periodo);
    
    
guardarResultadoMensualFirebase();

cargarHistoricoResultado();

alert("✅ Archivo de gastos cargado");
};

lector.readAsArrayBuffer(archivo);

}
// =====================================
// RECUPERAR INGRESOS
// =====================================

function recuperarIngresos(){

let nombre =
localStorage.getItem(
"nombreResultadoIngresos"
);

if(nombre){

document.getElementById(
"archivoIngresosActivo"
).innerHTML =
"📂 " + nombre;

}

}

// =====================================
// RECUPERAR GASTOS
// =====================================

function recuperarGastos(){

let nombre =
localStorage.getItem(
"nombreResultadoGastos"
);

if(nombre){

document.getElementById(
"archivoGastosActivo"
).innerHTML =
"📂 " + nombre;

}

}

// =====================================
// GUARDAR RESULTADO MENSUAL FIREBASE
// =====================================

function guardarResultadoMensualFirebase(){
const datosGuardar = {

    ingresos:
    Number(localStorage.getItem("rmInteres") || 0) +
    Number(localStorage.getItem("rmMoraReal") || 0),

    interes:
    Number(localStorage.getItem("rmInteres") || 0),

    moraReal:
    Number(localStorage.getItem("rmMoraReal") || 0),

    gastos:
    Number((Number(localStorage.getItem("rmGastos") || 0)).toFixed(2)),

   utilidadOperativa:
Number((
    (Number(localStorage.getItem("rmInteres") || 0) +
    Number(localStorage.getItem("rmMoraReal") || 0))
    -
    Number(localStorage.getItem("rmGastos") || 0)
).toFixed(2)),

utilidadNeta:
Number((
    (Number(localStorage.getItem("rmInteres") || 0) +
    Number(localStorage.getItem("rmMoraReal") || 0))
    -
    Number(localStorage.getItem("rmGastos") || 0)
).toFixed(2)),

    nombreResultadoIngresos:
    localStorage.getItem("nombreResultadoIngresos") || "",

    nombreResultadoGastos:
    localStorage.getItem("nombreResultadoGastos") || "",

    rankingRentabilidadAsesor:
    JSON.parse(localStorage.getItem("rankingRentabilidadAsesor")) || {},

    fecha:
    new Date().toLocaleString("es-PE")

};

console.log("===== RESULTADO MENSUAL =====");
console.log(datosGuardar);

    Object.entries(datosGuardar).forEach(([k,v])=>{

    if(v===undefined){

        console.error("❌ UNDEFINED:",k);

    }

});
firebase.database()
.ref("resultadoMensual/actual")
.set(datosGuardar)
.then(()=>{

    console.log("✅ Resultado mensual guardado");

})
.catch(err=>{

    console.error("❌ Error:", err);

});
    
// =====================================
// OBTENER PERÍODO DEL MES CARGADO
// =====================================

let periodo =
localStorage.getItem("rmPeriodo");
    if(!periodo){

    alert("No se pudo determinar el período del archivo.");

    return;

}
console.log("=== HISTORICO ===");
console.log("Periodo:", periodo);
console.log("Ingresos:", Number(localStorage.getItem("rmInteres") || 0) +
Number(localStorage.getItem("rmMoraReal") || 0));
console.log("Gastos:", Number(localStorage.getItem("rmGastos") || 0));
firebase.database()
.ref("resultadoMensual/historico/" + periodo)
.set({

    periodo: periodo,

    ingresos:
    Number(localStorage.getItem("rmInteres") || 0) +
    Number(localStorage.getItem("rmMoraReal") || 0),

    interes:
    Number(localStorage.getItem("rmInteres") || 0),

    moraReal:
    Number(localStorage.getItem("rmMoraReal") || 0),

    gastos:
    Number(localStorage.getItem("rmGastos") || 0),

    utilidad:
    Number((
        (Number(localStorage.getItem("rmInteres") || 0) +
        Number(localStorage.getItem("rmMoraReal") || 0))
        -
        Number(localStorage.getItem("rmGastos") || 0)
    ).toFixed(2)),

    fecha:
    new Date().toLocaleString("es-PE")

});
}
// =====================================
// RECUPERAR RESULTADO MENSUAL FIREBASE
// =====================================

function recuperarResultadoMensualFirebase(){

firebase.database()
.ref("resultadoMensual/actual")
.once("value")
.then((snapshot)=>{

    console.log("===== SNAPSHOT RESULTADO =====");
    console.log(snapshot.exists());

    if(!snapshot.exists()){
        console.log("❌ No existe resultadoMensual/actual");
        return;
    }

    let datos = snapshot.val();

    console.log("===== DATOS FIREBASE =====");
    console.log(datos);

localStorage.setItem(
"rmInteres",
datos.interes || 0
);

localStorage.setItem(
"rmMoraReal",
datos.moraReal || 0
);

localStorage.setItem(
"rmGastos",
datos.gastos || 0
);

localStorage.setItem(
"nombreResultadoIngresos",
datos.nombreResultadoIngresos || ""
);

localStorage.setItem(
"nombreResultadoGastos",
datos.nombreResultadoGastos || ""
);
    localStorage.setItem(
"rankingRentabilidadAsesor",
JSON.stringify(datos.rankingRentabilidadAsesor || {})
);
recuperarIngresos();

recuperarGastos();

mostrarRentabilidadAsesor();

actualizarResultadoMensual();

cargarHistoricoResultado();
});

}
// =====================================
// CARGAR HISTÓRICO RESULTADO MENSUAL
// =====================================

function cargarHistoricoResultado(){

firebase.database()
.ref("resultadoMensual/historico")
.once("value")
.then((snapshot)=>{

let tabla =
document.getElementById("tablaHistoricoResultado");

if(!tabla) return;

tabla.innerHTML = "";

if(!snapshot.exists()){

tabla.innerHTML = `
<tr>
<td colspan="4" style="padding:20px;text-align:center;">
No existen registros
</td>
</tr>
`;

return;

}

let datos = snapshot.val();

Object.keys(datos)
.sort()
.reverse()
.forEach(periodo=>{

let r = datos[periodo];

tabla.innerHTML += `

<tr>

<td style="padding:8px 10px;vertical-align:middle;">
${periodo}
</td>

<td style="padding:8px 10px;text-align:right;vertical-align:middle;">
S/ ${(r.ingresos || 0).toLocaleString("es-PE",{
minimumFractionDigits:2
})}
</td>

<td style="padding:8px 10px;text-align:right;vertical-align:middle;">
S/ ${(r.gastos || 0).toLocaleString("es-PE",{
minimumFractionDigits:2
})}
</td>

<td style="
padding:8px 10px;
text-align:right;
vertical-align:middle;
font-weight:bold;
color:${(r.utilidad || 0) >= 0 ? "#16a34a" : "#dc2626"};
">
S/ ${(r.utilidad || 0).toLocaleString("es-PE",{
minimumFractionDigits:2
})}
</td>

</tr>

`;

});

});

}
// =====================================
// RENTABILIDAD POR ASESOR - HORIZONTAL
// =====================================



function mostrarRentabilidadAsesor(){

    let datos = JSON.parse(
        localStorage.getItem("rankingRentabilidadAsesor")
    ) || {};

    let div = document.getElementById(
        "rankingRentabilidadAsesor"
    );

    if(!div) return;

    let asesores = Object.entries(datos)
        .map(([nombre, valores]) => {
            let interes = Number(valores.interes) || 0;
            let moraReal = Number(valores.moraReal) || 0;

            return {
                nombre,
                interes,
                moraReal,
                ingreso: interes + moraReal
            };
        })
        .sort((a,b) => b.ingreso - a.ingreso);

    if(asesores.length === 0){
        div.innerHTML = `
            <div style="text-align:center;padding:20px;color:#888;">
                No existen datos de rentabilidad
            </div>
        `;
        return;
    }

    let maxIngreso = Math.max(
        ...asesores.map(a => a.ingreso),
        1
    );

    let totalIngresos = asesores.reduce(
        (total, a) => total + a.ingreso, 0
    );

    let formatoSoles = valor => valor.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    let html = `
        <div style="
            display:flex;
            flex-direction:column;
            gap:12px;
            width:100%;
        ">

        <div style="
            display:flex;
            flex-wrap:wrap;
            gap:14px;
            font-size:12px;
            color:#475569;
            margin-bottom:4px;
        ">
            <span>
                <span style="display:inline-block;width:10px;height:10px;
                background:#2585C5;border-radius:2px;"></span>
                Interés
            </span>

            <span>
                <span style="display:inline-block;width:10px;height:10px;
                background:#16A34A;border-radius:2px;"></span>
                Mora real
            </span>
        </div>
    `;

    asesores.forEach((asesor, index) => {

        let medalla = "🥉";
        if(index === 0) medalla = "🥇";
        if(index === 1) medalla = "🥈";

        let anchoInteres =
            Math.max(0, asesor.interes / maxIngreso * 100);

        let anchoMora =
            Math.max(0, asesor.moraReal / maxIngreso * 100);

        let participacion = totalIngresos > 0
            ? asesor.ingreso / totalIngresos * 100
            : 0;

        html += `
            <div style="
                padding:12px;
                background:#F8FAFC;
                border:1px solid #E2E8F0;
                border-radius:12px;
                width:100%;
                box-sizing:border-box;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-bottom:9px;
                ">
                    <strong style="color:#123B63;font-size:14px;">
                        ${medalla} ${asesor.nombre}
                    </strong>

                    <strong style="color:#123B63;font-size:14px;">
                        S/ ${formatoSoles(asesor.ingreso)}
                    </strong>
                </div>

                <div style="
                    display:flex;
                    width:100%;
                    height:18px;
                    background:#E2E8F0;
                    border-radius:5px;
                    overflow:hidden;
                ">
                    <div title="Interés: S/ ${formatoSoles(asesor.interes)}"
                        style="
                            width:${anchoInteres}%;
                            height:100%;
                            background:#2585C5;
                            flex-shrink:0;
                        ">
                    </div>

                    <div title="Mora real: S/ ${formatoSoles(asesor.moraReal)}"
                        style="
                            width:${anchoMora}%;
                            height:100%;
                            background:#16A34A;
                            flex-shrink:0;
                        ">
                    </div>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    flex-wrap:wrap;
                    gap:6px;
                    margin-top:8px;
                    font-size:12px;
                    color:#475569;
                ">
                    <span>
                        Interés: S/ ${formatoSoles(asesor.interes)}
                    </span>

                    <span>
                        Mora real: S/ ${formatoSoles(asesor.moraReal)}
                    </span>

                    <strong style="color:#123B63;">
                        ${participacion.toLocaleString("es-PE",{
                            minimumFractionDigits:1,
                            maximumFractionDigits:1
                        })}%
                    </strong>
                </div>

            </div>
        `;
    });

    html += `</div>`;

    div.innerHTML = html;
}


// =====================================
// OBTENER PERÍODO DEL EXCEL
// =====================================

function obtenerPeriodoExcel(valorFecha){

    if(valorFecha === undefined || valorFecha === null){
        return null;
    }

    if(typeof valorFecha === "number"){

        let fecha = XLSX.SSF.parse_date_code(valorFecha);

        let mes = String(fecha.m).padStart(2,"0");

        return fecha.y + "-" + mes;

    }

    let texto = String(valorFecha).trim();

    if(texto.includes("/")){

        let p = texto.split("/");

        if(p.length >= 3){

            return p[2] + "-" + p[1];

        }

    }

    let fecha = new Date(texto);

    if(!isNaN(fecha)){

        let mes =
        String(fecha.getMonth()+1).padStart(2,"0");

        return fecha.getFullYear()+"-"+mes;

    }

    return null;

}
