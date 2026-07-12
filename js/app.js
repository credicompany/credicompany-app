// =====================================
// INICIALIZACIÓN DEL SISTEMA
// =====================================

function iniciarSistema(){

    console.log("🚀 Iniciando CREDICOMPANY...");

    iniciarResetDiario();

    setTimeout(()=>{

        sincronizarCartera();

        console.log(
            "Existe recuperarResultadoMensualFirebase:",
            typeof recuperarResultadoMensualFirebase
        );

        if(typeof recuperarResultadoMensualFirebase === "function"){

            recuperarResultadoMensualFirebase();

        }else{

            console.error("❌ No existe recuperarResultadoMensualFirebase");

        }

    },300);

}
// =====================================
// RESET DIARIO
// =====================================

function iniciarResetDiario(){

    let hoy = new Date().toLocaleDateString('en-CA');
    let ultimo = localStorage.getItem("fechaSistema");

    if(ultimo !== hoy){

        let data = JSON.parse(localStorage.getItem("cartera")) || [];

        data.forEach(c=>{
            c.pagado_hoy = false;
            c.pagado_monto = 0;
        });

        localStorage.setItem("cartera", JSON.stringify(data));
        localStorage.setItem("bonosHoy", JSON.stringify({}));
        localStorage.setItem("fechaSistema", hoy);

        console.log("✅ Reset diario ejecutado");

    }

}
// =====================================
// INICIO DEL SISTEMA
// =====================================

window.onload = iniciarSistema;

console.log("✅ app.js cargado");
