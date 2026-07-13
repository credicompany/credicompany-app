// =====================================
// CLIENTES.JS
// CREDICOMPANY V3
// =====================================

// =====================================
// VARIABLES GLOBALES
// =====================================



// =====================================
// CARGA DE CLIENTES
// =====================================



// =====================================
// FILTROS
// =====================================



// =====================================
// COBRANZA
// =====================================



// =====================================
// GESTIONES
// =====================================



// =====================================
// HISTORIAL
// =====================================



// =====================================
// RENDER
// =====================================



// =====================================
// UTILIDADES
// =====================================
function verHistorialGestiones(){

    document.getElementById("historialDiv").style.display = "none";
    document.getElementById("historialClienteDiv").style.display = "none";
    document.getElementById("dashboard").style.display = "none";

    document.querySelector(".resumen").style.display = "none";

    app.style.display = "block";

    [
        "simulador",
        "clientes",
        "pagos",
        "admin"
    ].forEach(id=>{

        document.getElementById(id).style.display = "none";

    });

    document.getElementById("historialGestionesDiv").style.display = "block";

    let lista = document.getElementById("listaGestiones");

    lista.innerHTML = "";

    db.ref("gestiones").once("value", snap=>{

        let historial = obtenerGestionesVigentes(snap);

        eliminarGestionesAntiguas(snap);

        if(historial.length === 0){

            lista.innerHTML =
            "<p>No existen gestiones registradas</p>";

            return;

        }

        let agrupado =
        agruparGestionesPorUsuario(historial);

        renderHistorialGestiones(
            lista,
            agrupado
        );

    });

}
  function verHistorialCliente(nombre, celular){

document.getElementById("clientes")
.style.display="none";

document.getElementById(
"historialClienteDiv"
).style.display="block";

let historial =
JSON.parse(
localStorage.getItem(
"historialGestiones"
)
) || [];

let lista =
document.getElementById(
"historialClienteContenido"
);

lista.innerHTML = "";

let registros =
historial.filter(g=>

g.cliente === nombre &&
g.celular === celular

);

if(registros.length === 0){

lista.innerHTML = `
<div class="item">
No existen gestiones registradas
</div>
`;

return;
}

registros.forEach(g=>{

lista.innerHTML += `

<div class="item">

<b>📌 ${g.tipo}</b><br>

📝 ${g.comentario}<br>

👤 ${g.asesor || "Sin usuario"}<br>

🕒 ${g.fecha}

</div>

`;

});

}
function volverHistorialCliente(){

document.getElementById(
"historialClienteDiv"
).style.display="none";

document.getElementById(
"clientes"
).style.display="block";

}
// =====================================
// UTILIDADES HISTORIAL
// =====================================

function obtenerGestionesVigentes(snapshot){

    let historial = [];

    let ahora = Date.now();

    let quinceDias = 15 * 24 * 60 * 60 * 1000;

    snapshot.forEach(item=>{

        let g = item.val();

        if(!g.timestamp){

            historial.push(g);

            return;

        }

        if((ahora - g.timestamp) <= quinceDias){

            historial.push(g);

        }

    });

    return historial;

}

function eliminarGestionesAntiguas(snapshot){

    let ahora = Date.now();

    let quinceDias = 15 * 24 * 60 * 60 * 1000;

    snapshot.forEach(item=>{

        let g = item.val();

        if(!g.timestamp){

            item.ref.remove();

            return;

        }

        if(
            g.timestamp &&
            (ahora - g.timestamp) > quinceDias
        ){

            item.ref.remove();

        }

    });

}
// =====================================
// AGRUPAR GESTIONES
// =====================================

function agruparGestionesPorUsuario(historial){

    let agrupado = {};

    historial.reverse().forEach(g=>{

        let usuario = g.asesor || "Sin Usuario";

        if(!agrupado[usuario]){
            agrupado[usuario] = [];
        }

        agrupado[usuario].push(g);

    });

    return agrupado;

}
// =====================================
// RENDER HISTORIAL
// =====================================

function renderHistorialGestiones(lista, agrupado){

    lista.innerHTML = "";

    Object.keys(agrupado).forEach(usuario=>{

        lista.innerHTML += `
        <div style="
        background:#123B63;
        color:white;
        padding:10px;
        border-radius:10px;
        margin-top:15px;
        font-weight:bold;
        font-size:16px;
        ">
        👤 ${usuario.toUpperCase()}
        (${agrupado[usuario].length} gestiones)
        </div>
        `;

        agrupado[usuario].forEach(g=>{

            lista.innerHTML += `
            <div class="item">
                <b>${g.cliente}</b><br>
                📞 ${g.celular}<br>
                📝 ${g.comentario}<br>
                🕒 ${g.fecha}
            </div>
            `;

        });

    });

}
