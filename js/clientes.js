// EXCEL MEJORADO
function cargarExcel(){

let file=document.getElementById("excelFile").files[0];
if(!file)return alert("Selecciona archivo");

let reader=new FileReader();

reader.onload=function(e){

let data=new Uint8Array(e.target.result);
let workbook=XLSX.read(data,{type:'array'});
let hoja=workbook.Sheets[workbook.SheetNames[0]];
let raw=XLSX.utils.sheet_to_json(hoja,{header:1});

let headerIndex=0;

for(let i=0;i<raw.length;i++){
let row=(raw[i]||[]).join(" ").toLowerCase();
if(row.includes("nombre") && row.includes("producto")){
headerIndex=i;
break;
}
}

let headers=raw[headerIndex];
let dataRows=raw.slice(headerIndex+1);

let json=dataRows.map(r=>{

let obj={
 dni:"",
nombre:"",
asesor:"",
monto:"",
retraso:0,
cuotasVencidas:0,
celular:"",
producto:"",
direccion:"",
distrito:"",

nombreAval:"",
apellidoPAval:"",
apellidoMAval:"",
direccionAval:"",
telefonoAval:""
};

headers.forEach((h,i)=>{
if(!h)return;

let key=h.toString().toLowerCase().replace(/\s+/g,"");
 let val = r[i] || "";
 /* DNI */
if(
    key==="dni" ||
    key.includes("dni") ||
    key.includes("documento")
){
    obj.dni = String(val).trim();
}

// NOMBRE TITULAR
if(
   key.includes("nombreyapellido")
){
   obj.nombre = val;
}

// NOMBRE AVAL
if(
   key.includes("nombreaval")
){
   obj.nombreAval = val;
}
if(key.includes("asesor")){
    let nombre = (val || "").toLowerCase().trim();

    if(nombre.includes("benites")) nombre = "ebenites";
    if(nombre.includes("medina")) nombre = "emedina";
    if(nombre.includes("leon")) nombre = "tleon";
    if(nombre.includes("huerta")) nombre = "bhuerta";
    if(nombre.includes("garcia")) nombre = "dgarcia";
    if(nombre.includes("lopez")) nombre = "slopez";
    obj.asesor = nombre;
}
if(key.includes("cuota_mora")) obj.monto=val;
if(key.includes("saldo") && key.includes("capital") && key.includes("vencido")){
    obj.saldoCapital = parseFloat(val) || 0;
}
if(
   key.includes("diasretraso") ||
   key.includes("díasretraso") ||
   (key.includes("dias") && key.includes("retraso"))
){
   obj.retraso = parseFloat(val) || 0;
}
if(key.includes("cuota") && key.includes("venc")) obj.cuotasVencidas = parseFloat(val)||0; 
if(key === "cuotasporpagar" ||
   key.includes("cuotasporpagar")){
    obj.cuotasPorPagar =
    parseFloat(val) || 0;
}
if(key.includes("telefono") || key.includes("celular")) obj.celular=val;
if(key.includes("producto")) obj.producto=val;
// DIRECCION TITULAR
if(
   key.includes("direccion") &&
   !key.includes("aval")
){
   obj.direccion = val;
}

// DIRECCION AVAL
if(
   key.includes("direccionaval")
){
   obj.direccionAval = val;
}
if(key.includes("distrito")) obj.distrito=val;
if(key.includes("nombreaval"))
obj.nombreAval = val;

if(
key.includes("apellidop.") ||
key.includes("apellidop")
)
obj.apellidoPAval = val;

if(
key.includes("apellidom.") ||
key.includes("apellidom")
)
obj.apellidoMAval = val;

if(key.includes("direccionaval"))
obj.direccionAval = val;

if(
    key.includes("aval") &&
    (
      key.includes("telefono") ||
      key.includes("telelfono") ||
      key.includes("celular")
    )
){
    obj.telefonoAval = val;
}

}); // cierre de headers.forEach

return obj;
}); // 🔥 GUARDADO REAL
 console.log(json[0]);
db.ref("cartera")
.set(json)
.then(()=>{

    console.log("✅ Cartera enviada a Firebase");

    alert("✅ Cartera enviada a Firebase");

})
.catch(err=>{

    console.error(
        "❌ Error Firebase:",
        err
    );

    alert(
        "❌ Error Firebase: " +
        err.message
    );

});
localStorage.setItem("cartera", JSON.stringify(json));
localStorage.setItem("cartera_backup", JSON.stringify(json));
// 🔥 RESET DIARIO (LÍNEA 357)
let dataReset = JSON.parse(localStorage.getItem("cartera")) || [];

dataReset.forEach(c=>{
c.pagado_hoy = false;
});

localStorage.setItem("cartera", JSON.stringify(dataReset));
// 🔥 MOSTRAR
filtrarMora(0,1000);
actualizarResumen();
alert("✅ Cartera cargada y guardada correctamente");
};

reader.readAsArrayBuffer(file);
}
// CLIENTES + RESUMEN
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
