// LOGIN
function login(){
let user=usuario.value.trim();
let pass=clave.value.trim();

if(
(user==="admin" && pass==="1234") ||
(user==="operaciones" && pass==="1234")
){

asesor = user.toLowerCase().trim();

window.esAdmin = true;

cargarPerfilAsesor(asesor);

loginDiv.style.display="none";
dashboard.style.display="block";

document.getElementById("boxAdmin").style.display="flex";
document.getElementById("panelExcel").style.display="block";
document.getElementById("panelAsesores").style.display="grid";
document.getElementById("boxKpiFinanciero").style.display="flex";
document.getElementById("boxResultadoMensual").style.display="flex";
document.getElementById("boxInteligencia").style.display="flex";
actualizarResumen();

return;
}

let usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

let encontrado = usuarios.find(
    u =>
    (u.user || "").toLowerCase().trim() === user.toLowerCase().trim() &&
    (u.pass || "").trim() === pass.trim()
);

if(encontrado){

    asesor = user.toLowerCase().trim();
if(asesor==="ebenites"){

document.getElementById("boxKpiFinanciero").style.display="flex";

document.getElementById("boxResultadoMensual").style.display="flex";

document.getElementById("boxInteligencia").style.display="flex";

}else{

document.getElementById("boxKpiFinanciero").style.display="none";

document.getElementById("boxResultadoMensual").style.display="none";

document.getElementById("boxInteligencia").style.display="none";

}
    nombreAsesor.innerText = asesor;

    cargarPerfilAsesor(asesor);

    loginDiv.style.display="none";
    dashboard.style.display="block";

    document.getElementById("boxAdmin").style.display="none";

    if(asesor === "slopez"){
        document.getElementById("panelAsesores").style.display="grid";
    }else{
        document.getElementById("panelAsesores").style.display="none";
    }

    document.getElementById("panelExcel").style.display="none";

    actualizarResumen();

}else{

    alert("❌ Usuario o clave incorrectos");

}
}
