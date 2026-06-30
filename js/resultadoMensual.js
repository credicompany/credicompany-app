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

localStorage.setItem(
"nombreResultadoIngresos",
archivo.name
);

document.getElementById(
"archivoIngresosActivo"
).innerHTML =
"📂 " + archivo.name;

actualizarResultadoMensual();

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

document.getElementById(
"archivoGastosActivo"
).innerHTML =
"📂 " + archivo.name;

actualizarResultadoMensual();

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
// GUARDAR RESULTADO MENSUAL FIREBASE
// =====================================

function guardarResultadoMensualFirebase(){

firebase.database().ref("resultadoMensual/actual").set({

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

    fecha:
    new Date().toLocaleString("es-PE")

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

if(!snapshot.exists()) return;

let datos = snapshot.val();

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

<td style="padding:4px 10px;"
${periodo}
</td>

<td style="padding:4px 10px;text-align:right;"
S/ ${(r.ingresos || 0).toLocaleString("es-PE",{
minimumFractionDigits:2
})}
</td>

<td style="padding:4px 10px;text-align:right;"
S/ ${(r.gastos || 0).toLocaleString("es-PE",{
minimumFractionDigits:2
})}
</td>

<td style="padding:4px 10px;text-align:right;"
font-weight:bold;
color:${(r.utilidad||0)>=0 ? "#16a34a" : "#dc2626"};
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
