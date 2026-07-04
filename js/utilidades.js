// ======================================
// UTILIDADES CREDICOMPANY
// ======================================

console.log("✅ utilidades.js conectado");

// ---------- LocalStorage ----------

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

// ---------- Moneda ----------

function moneda(valor){

    return "S/ " + Number(valor||0).toLocaleString("es-PE",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });

}

// ---------- Enteros ----------

function entero(valor){

    return Number(valor||0).toLocaleString("es-PE");

}

// ---------- Fecha ----------

function hoy(){

    return new Date().toISOString().slice(0,10);

}
