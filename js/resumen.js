// ======================================
// RESUMEN GENERAL
// ======================================
function actualizarResumen(){

  let data = JSON.parse(localStorage.getItem("cartera")) || [];

  let total = 0;
  let mora = 0;
  let saldoCapitalVencido = 0;
  let hoy = 0;
  let vencenHoy = 0;
  let criticos = 0;
  let moraVencida30 = 0;
  let moraRecuperada = 0;
  let miMora = 0;
  let misMorosos = 0;
  let ranking = {};
let operaciones = {};
let temPromedio = {};
let clientes = {};
  let control = {};
  let bonos = {};
  let hoyFecha = new Date().toLocaleDateString();
let hoyCount = 0;
let moraCount = 0;
let criticoCount = 0;
  data.forEach(c=>{

let retraso = parseFloat(c.retraso) || 0;
let monto = parseFloat(c.monto) || 0;

if(retraso === 0 && !c.pagado_hoy){
    hoyCount++;
}

if(retraso >= 1 && retraso <= 8 && !c.pagado_hoy){
    moraCount++;
}

if(retraso >= 9 && !c.pagado_hoy){
    criticoCount++;

}
let pagado = parseFloat(c.pagado_monto) || 0;
let cuota = parseFloat(c.monto) || 0;


// mora recuperada
if(retraso > 0 && pagado > 0){
    moraRecuperada += pagado;
}

// ranking asesor
let asesorNombre = c.asesor || "Sin asesor";

if(!ranking[asesorNombre]){
    ranking[asesorNombre] = 0;
}
ranking[asesorNombre] += pagado;

// CONTROL GERENCIAL
if(!control[asesorNombre]){
    control[asesorNombre] = {
        total: 0,
        pagados: 0
    };
}
// 🔥 META DEL DÍA
if(retraso === 0 || c.eraHoy){

    control[asesorNombre].total++;

}

// 🔥 PAGOS REALIZADOS
if(c.pagado_hoy){

    control[asesorNombre].pagados++;

}
if(retraso >= 1){

    mora++;

    saldoCapitalVencido += parseFloat(c.saldoCapital) || 0;

    let asesorCliente = (c.asesor || "")
    .toLowerCase()
    .trim();

    let asesorActual = (asesor || "")
    .toLowerCase()
    .trim();

    if(
        asesorActual &&
        asesorCliente === asesorActual
    ){

        miMora += parseFloat(c.saldoCapital) || 0;
        misMorosos++;

    }

}
if(retraso > 30){

    criticos++;

    moraVencida30 +=
    parseFloat(c.saldoCapital) || 0;

}
    let saldo = parseFloat(c.saldo || c.monto) || 0;
     
    // 🔥 CLIENTES AL DÍA
    if(retraso === 0 && !c.pagado_hoy){
    hoy += saldo;
      
    vencenHoy++;
    }

    });

  let totalClientes = data.filter(c => !c.pagado_hoy).length;

 let porcentajeMora =
saldoCapitalVencido.toFixed(2);

  document.getElementById("totalCartera").innerText = "S/ " + total.toFixed(2);
  document.getElementById("porcentajeMora").innerText =
"S/ " + porcentajeMora;
  document.getElementById("cobradoHoy").innerText = "S/ " + hoy.toFixed(2);
  document.getElementById("vencenHoy").innerText = vencenHoy;
  document.getElementById("criticos").innerText = criticos;
  document.getElementById("totalClientes").innerText = totalClientes;

document.getElementById("moraRecuperada").innerText =
"S/ " + moraRecuperada.toFixed(2);
document.getElementById("miMora").innerText =
"S/ " + miMora.toFixed(2);

document.getElementById("misMorosos").innerText =
misMorosos;
let divMora =
document.getElementById("moraVencidaTotal");

if(divMora){

    divMora.innerText =
    "S/ " +
    moraVencida30.toLocaleString();

}
  Object.keys(control).forEach(a=>{

let t = control[a].total;
let p = control[a].pagados;

// 🔥 BONO SOLO SI CUMPLE META COMPLETA
if(t > 0 && p === t){
    bonos[a] = 15;
}else{
    bonos[a] = 0;
}

});
  let bonosHoy = JSON.parse(localStorage.getItem("bonosHoy")) || {};

Object.keys(bonos).forEach(a=>{
  if(!bonosHoy[a]) bonosHoy[a] = 0;

  if(bonos[a] > 0){
    bonosHoy[a] = bonos[a];
  }
});

localStorage.setItem("bonosHoy", JSON.stringify(bonosHoy));
  console.log(ranking);
  let rankingHTML = "";

Object.entries(ranking)
.filter(([asesor]) => asesor !== "admin") // 👈 línea nueva
.sort((a,b)=>b[1]-a[1])
.forEach((item,index)=>{

let medalla = "🥉";

if(index === 0) medalla = "🥇";
if(index === 1) medalla = "🥈";
let bono = bonos[item[0]] || 0;
let bonosHoy = JSON.parse(localStorage.getItem("bonosHoy")) || {};
let bonoAcumulado = bonosHoy[item[0]] || 0;  
let prog = control[item[0]] 
? `${control[item[0]].pagados}/${control[item[0]].total}`
: "0/0";

rankingHTML += `
<div style="font-size:12px;margin-top:4px;">
${medalla} ${item[0]} → S/${item[1].toFixed(2)}
<br>🎯 ${prog} | 💰 Bono: S/${bono}
</div>
`;
});

document.getElementById("rankingAsesores").innerHTML = rankingHTML; 
let btnHoy = document.getElementById("btnHoy");
let btnMora = document.getElementById("btnMora");
let btnCriticos = document.getElementById("btnCriticos");
if(btnHoy){
btnHoy.innerHTML =
`🟢 Clientes al día (${hoyCount})`;
}

if(btnMora){
btnMora.innerHTML =
`🟡 Mora leve (${moraCount})`;
}

if(btnCriticos){
btnCriticos.innerHTML =
`🔴 Mora crítica (${criticoCount})`;
}

}

