
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
document.querySelector(".headerNuevo").style.display="none";
document.getElementById("rankingContainer").style.display="none";
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
"historialDiv",
"historialGestionesDiv",
"historialClienteDiv"
].forEach(id=>{
let el = document.getElementById(id);
if(el) el.style.display="none";
});

document.getElementById(p).style.display="block";
  
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

    document.getElementById("rankingContainer").style.display="none";

    setTimeout(function(){

        actualizarResumen();
        filtrarMora(0,1000);

    },50);

}
  if(p==="kpiFinanciero"){
    mostrarResumenFinanciero();
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
"historialDiv",
"historialGestionesDiv",
"historialClienteDiv"
].forEach(id=>{
let el=document.getElementById(id);
if(el) el.style.display="none";
});

document.querySelector(".resumen").style.display = "grid";

document.getElementById("historialDiv").style.display="none";

document.getElementById("rankingContainer").style.display="flex";


dashboard.style.display="block";
document.querySelector(".headerNuevo").style.display="block";
document.getElementById("rankingContainer").style.display="flex";
if(asesor === "slopez"){
document.getElementById("panelAsesores").style.display="grid";
}

}
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
