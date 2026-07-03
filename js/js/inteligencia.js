// =====================================================
// CENTRO DE INTELIGENCIA CREDICOMPANY
// =====================================================

function cargarCentroInteligencia(){

    console.log("🧠 Centro de Inteligencia iniciado");

    cargarIngresoMes();

}

// ====================================
// INGRESO DEL MES
// ====================================

function cargarIngresoMes(){

    let origen =
    document.getElementById("rmTotalIngresos");

    let destino =
    document.getElementById("intelIngreso");

    if(origen && destino){

        destino.innerHTML =
        origen.innerHTML;

    }

}
