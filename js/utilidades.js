// ======================================
// UTILIDADES CREDICOMPANY
// ======================================

console.log("✅ utilidades.js cargado");

// LocalStorage
function leerLocal(clave){
    try{
        return JSON.parse(localStorage.getItem(clave)) || [];
    }catch(e){
        return [];
    }
}

function guardarLocal(clave,data){
    localStorage.setItem(clave,JSON.stringify(data));
}

// Formato
function moneda(valor){
    return "S/ " + Number(valor || 0).toLocaleString("es-PE",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

function entero(valor){
    return Number(valor || 0).toLocaleString("es-PE");
}
