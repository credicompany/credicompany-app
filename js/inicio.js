function iniciarModuloInicio(){

    let hoy = new Date().toLocaleDateString('en-CA');
    let ultimo = localStorage.getItem("fechaSistema");

    // 🔥 SI ES UN NUEVO DÍA → RESET
    if(ultimo !== hoy){

        let data = JSON.parse(localStorage.getItem("cartera")) || [];

        data.forEach(c=>{
            c.pagado_hoy = false;
            c.pagado_monto = 0;
        });

        localStorage.setItem("cartera", JSON.stringify(data));

        // 🔥 limpiar bonos diarios
        localStorage.setItem("bonosHoy", JSON.stringify({}));

        // guardar fecha actual
        localStorage.setItem("fechaSistema", hoy);
    }

  actualizarResumen();
  db.ref("usuarios").on("value",(snapshot)=>{

    let usuariosFirebase = snapshot.val();

    if(!usuariosFirebase) return;

    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuariosFirebase)
    );

    console.log(
        "✅ Usuarios sincronizados desde Firebase"
    );

});
  // 🔥 SINCRONIZAR KPI FIREBASE
db.ref("kpiGerencial").on("value",(snapshot)=>{

    let data = snapshot.val();

    if(!data) return;

    // KPI completo
    localStorage.setItem(
        "resumenKPI",
        data.resumen || ""
    );

    if(document.getElementById("kpiResumen")){
        document.getElementById("kpiResumen").innerHTML =
        data.resumen || "";
    }

    // Ranking colocación
    if(document.getElementById("rankingKPI")){
        document.getElementById("rankingKPI").innerHTML =
        data.rankingKPIHTML || "";
    }

});
let rankingGuardado =
localStorage.getItem("rankingKPIHTML");

if(
rankingGuardado &&
document.getElementById("rankingKPI")
){
document.getElementById("rankingKPI").innerHTML =
rankingGuardado;
}// 🔥 SINCRONIZAR DESDE FIREBASE
db.ref("cartera").on("value", (snapshot)=>{

    let dataFirebase = snapshot.val();

    if(dataFirebase){

        localStorage.setItem(
            "cartera",
            JSON.stringify(dataFirebase)
        );
document.querySelector(".resumen").style.display = "none";
        actualizarResumen();
document.querySelector(".resumen").style.display = "none";
        if(document.getElementById("listaClientes")){
            filtrarMora(filtroMin, filtroMax);
        }

        console.log("✅ Cartera sincronizada Firebase");
    }

});
  
  recuperarResultadoMensualFirebase();
  
};
