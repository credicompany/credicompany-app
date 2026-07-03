// =====================================
// CLIENTES / COBRANZA
// =====================================

console.log("✅ clientes.js cargado");

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
}); 
 
 console.log("========== JSON A FIREBASE ==========");
console.log(json);
console.log(JSON.stringify(json, null, 2));
 // 🔥 GUARDADO REAL
db.ref("cartera")
.set(json)
.then(()=>{

    console.log("✅ Cartera enviada a Firebase");

    localStorage.setItem(
        "cartera",
        JSON.stringify(json)
    );

    localStorage.setItem(
        "cartera_backup",
        JSON.stringify(json)
    );

    let dataReset =
    JSON.parse(localStorage.getItem("cartera")) || [];

    dataReset.forEach(c=>{
        c.pagado_hoy = false;
    });

    localStorage.setItem(
        "cartera",
        JSON.stringify(dataReset)
    );

    filtrarMora(0,1000);

    actualizarResumen();

    alert("✅ Cartera cargada correctamente");

})
.catch(err=>{

    console.error("❌ Error Firebase:",err);

    alert("❌ "+err.message);

});
};

reader.readAsArrayBuffer(file);
}
