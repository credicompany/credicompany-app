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
console.count("actualizarResultadoMensual");
    let ingresos = 0;
    let gastos = 0;

    // Leer datos guardados
    let datosIngresos =
    JSON.parse(localStorage.getItem("resultadoIngresos")) || [];

    let datosGastos =
    JSON.parse(localStorage.getItem("resultadoGastos")) || [];

   // =====================================
// SUMAR INTERES + MORA REAL
// =====================================

datosIngresos.forEach(f=>{

    let interes =
    parseFloat(f["INTERES"]) || 0;

    let moraReal =
    parseFloat(f["MORA REAL"]) || 0;

    ingresos += interes + moraReal;

});
    // =====================================
// SUMAR SOLO LA COLUMNA MONTO
// =====================================

datosGastos.forEach(f=>{

    gastos += parseFloat(f["Monto"]) || 0;

});

    let utilidadOperativa = ingresos - gastos;

    let utilidadNeta = utilidadOperativa;

    let totalInteres = 0;
let totalMoraReal = 0;

datosIngresos.forEach(f=>{

    totalInteres +=
    parseFloat(f["INTERES"]) || 0;

    totalMoraReal +=
    parseFloat(f["MORA REAL"]) || 0;

});

ingresos =
totalInteres + totalMoraReal;

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
  console.log("Cantidad:", json.length);
console.log("Primer registro:", json[0]);
console.table(json.slice(0,5));
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

alert("✅ Archivo de ingresos cargado");

};

lector.readAsArrayBuffer(archivo);

}
// =====================================
// CARGAR EXCEL GASTOS
// =====================================

function cargarExcelGastos(){

alert("Entró a Gastos");

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
XLSX.utils.sheet_to_json(hoja);
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
