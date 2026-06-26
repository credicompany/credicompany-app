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

firebase.database().ref("resultadoMensual").set({

    ingresos:
    Number(localStorage.getItem("rmInteres") || 0) +
    Number(localStorage.getItem("rmMoraReal") || 0),

    interes:
    Number(localStorage.getItem("rmInteres") || 0),

    moraReal:
    Number(localStorage.getItem("rmMoraReal") || 0),

    gastos:
    Number(localStorage.getItem("rmGastos") || 0),

    utilidadOperativa:
    (Number(localStorage.getItem("rmInteres") || 0) +
     Number(localStorage.getItem("rmMoraReal") || 0))
     -
     Number(localStorage.getItem("rmGastos") || 0),

    utilidadNeta:
    (Number(localStorage.getItem("rmInteres") || 0) +
     Number(localStorage.getItem("rmMoraReal") || 0))
     -
     Number(localStorage.getItem("rmGastos") || 0),

    fecha:
    new Date().toLocaleString("es-PE")

});

}
