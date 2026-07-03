console.log("✅ app.js cargado correctamente");
// QR
function abrirQR(el){
imgQR.src=el.querySelector("img").src;
modalQR.style.display="flex";
}
function cerrarQR(){modalQR.style.display="none";}
function abrirTarifario(){

document.getElementById("modalTarifario").style.display = "block";

}

function cerrarTarifario(){

document.getElementById("modalTarifario").style.display = "none";

}
// UI
function mostrar(p){
if(
p === "admin" &&
asesor !== "admin" &&
asesor !== "operaciones"
){
alert("Acceso restringido");
return;
}
dashboard.style.display="none";

document.querySelector(".resumen").style.display = "none";

app.style.display="block";

[
"simulador",
"clientes",
"pagos",
"admin",
"kpi",
"kpiFinanciero",
"resultadoMensual",
  "inteligencia",
"historialDiv",
"historialGestionesDiv",
"historialClienteDiv"
].forEach(id=>{
let el = document.getElementById(id);
if(el) el.style.display="none";
});

document.getElementById(p).style.display="block";

  if(p==="inteligencia"){

    cargarCentroInteligencia();

}
  if(p==="kpi"){

    if(
        asesor !== "admin" &&
        asesor !== "operaciones"
    ){

        document.getElementById(
            "panelCargaKPI"
        ).style.display="none";

    }else{

        document.getElementById(
            "panelCargaKPI"
        ).style.display="block";

    }

}
if(p==="clientes"){

    filtrarMora(0,1000);

    actualizarResumen();
}
if(p==="admin") renderUsuarios();
}
function volver(){

app.style.display="none";
[
"simulador",
"clientes",
"pagos",
"admin",
"kpi",
"kpiFinanciero",
"resultadoMensual",
  "inteligencia",
"historialDiv",
"historialGestionesDiv",
"historialClienteDiv"
].forEach(id=>{
let el=document.getElementById(id);
if(el) el.style.display="none";
});

document.querySelector(".resumen").style.display = "grid";

document.getElementById("historialDiv").style.display="none";

dashboard.style.display="block";
  if(asesor === "slopez"){
    document.getElementById("panelAsesores").style.display="grid";
}
}
// =====================================
// INICIALIZACIÓN DEL SISTEMA
// =====================================

function iniciarSistema(){

    console.log("🚀 Iniciando CREDICOMPANY...");

}
