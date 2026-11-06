// ==========================================
// CREDICOMPANY
// ANÁLISIS DE CRECIMIENTO DE CARTERA
// ==========================================

let datosCarteraCrecimiento = [];
let datosAmortizaciones = [];

// Resultado pendiente de guardar como cierre mensual
let resultadoCierreCrecimiento = null;

// Normalizar encabezados
function normalizarCC(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}

// Convertir importes
function numeroCC(valor) {
    if (typeof valor === "number") return valor;

    let texto = String(valor || "")
        .replace(/S\/?/gi, "")
        .replace(/\s/g, "")
        .trim();

    if (!texto) return 0;

    if (texto.includes(",") && texto.includes(".")) {
        texto = texto.replace(/,/g, "");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : 0;
}

// Convertir fechas
function fechaCC(valor) {

    if (valor instanceof Date && !isNaN(valor)) {
        return new Date(
            valor.getFullYear(),
            valor.getMonth(),
            valor.getDate()
        );
    }

    if (typeof valor === "number") {
        const fecha = XLSX.SSF.parse_date_code(valor);

        if (fecha) {
            return new Date(
                fecha.y,
                fecha.m - 1,
                fecha.d
            );
        }
    }

    const texto = String(valor || "").trim();

    let partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (partes) {
        return new Date(
            Number(partes[3]),
            Number(partes[2]) - 1,
            Number(partes[1])
        );
    }

    partes = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (partes) {
        return new Date(
            Number(partes[1]),
            Number(partes[2]) - 1,
            Number(partes[3])
        );
    }

    return null;
}

// Excluir filas TOTAL y subtotales
function filaResumenCC(fila) {

    const texto = fila
        .map(valor => normalizarCC(valor))
        .join(" ");

    return /\bTOTAL\b|\bSUBTOTAL\b|\bSUMA TOTAL\b/.test(texto);
}

// Leer archivo Excel
function leerExcelCC(archivo, callback) {

    const lector = new FileReader();

    lector.onload = function(e) {

        try {

            const libro = XLSX.read(
                e.target.result,
                { type: "array", cellDates: true }
            );

            const hoja = libro.Sheets[libro.SheetNames[0]];

            const filas = XLSX.utils.sheet_to_json(
                hoja,
                {
                    header: 1,
                    defval: "",
                    raw: true
                }
            );

            callback(filas);

        } catch(error) {

            alert("No se pudo leer el archivo Excel.");
            console.error(error);

        }
    };

    lector.readAsArrayBuffer(archivo);
}

// Buscar encabezados
function buscarEncabezadosCC(filas, requeridos) {

    for (let i = 0; i < Math.min(filas.length, 20); i++) {

        const encabezados = filas[i].map(normalizarCC);

        const posiciones = {};

        requeridos.forEach(nombre => {
            posiciones[nombre] = encabezados.indexOf(
                normalizarCC(nombre)
            );
        });

        if (
            requeridos.every(nombre =>
                posiciones[nombre] !== -1
            )
        ) {
            return {
                fila: i,
                columnas: posiciones
            };
        }
    }

    return null;
}

// Cargar DATA GENERAL
document.getElementById("excelCarteraCrecimiento")
.addEventListener("change", function() {

    const archivo = this.files[0];

    if (!archivo) return;

    leerExcelCC(archivo, function(filas) {

        const estructura = buscarEncabezadosCC(
            filas,
            [
    "Fecha Desembolso",
    "Monto Otorgado",
    "Saldo Capital",
    "Dias de retraso"
]
        );

        if (!estructura) {
            alert("No se encontraron las columnas requeridas en DATA GENERAL.");
            return;
        }

        const registros = [];

        filas.slice(estructura.fila + 1).forEach(fila => {

            if (filaResumenCC(fila)) return;

            const fecha = fechaCC(
                fila[estructura.columnas["Fecha Desembolso"]]
            );

            const desembolso = numeroCC(
                fila[estructura.columnas["Monto Otorgado"]]
            );

            const saldo = numeroCC(
                fila[estructura.columnas["Saldo Capital"]]
            );
            const diasAtraso = numeroCC(
    fila[estructura.columnas["Dias de retraso"]]
);

        if (!fecha || desembolso < 0 || saldo < 0) return;

            registros.push({
    fecha,
    desembolso,
    saldo,
    diasAtraso
});

        });

        datosCarteraCrecimiento = registros;

        document.getElementById("estadoExcelCartera").innerText =
            "Archivo cargado: " + registros.length + " registros válidos.";

    });

});

// Cargar INGRESO
document.getElementById("excelAmortizaciones")
.addEventListener("change", function() {

    const archivo = this.files[0];

    if (!archivo) return;

    leerExcelCC(archivo, function(filas) {

        const estructura = buscarEncabezadosCC(
            filas,
            [
                "FECHA DE PAGO",
                "CAPITAL"
            ]
        );

        if (!estructura) {
            alert("No se encontraron las columnas requeridas en INGRESO.");
            return;
        }

        const registros = [];

        filas.slice(estructura.fila + 1).forEach(fila => {

            if (filaResumenCC(fila)) return;

            const fecha = fechaCC(
                fila[estructura.columnas["FECHA DE PAGO"]]
            );

            const capital = numeroCC(
                fila[estructura.columnas["CAPITAL"]]
            );

            if (!fecha || capital <= 0) return;

            registros.push({
                fecha,
                capital
            });

        });

        datosAmortizaciones = registros;

        document.getElementById("estadoExcelAmortizaciones").innerText =
            "Archivo cargado: " + registros.length + " registros válidos.";

    });

});

// Procesar análisis
function procesarCrecimientoCartera() {

    if (!datosCarteraCrecimiento.length) {
        alert("Primero carga el archivo DATA GENERAL.");
        return;
    }

    if (!datosAmortizaciones.length) {
        alert("Primero carga el archivo INGRESO.");
        return;
    }

    // Cartera actual: suma de saldos de los registros individuales
    const carteraActual = datosCarteraCrecimiento.reduce(
        (total, registro) => total + registro.saldo,
        0
    );

    // Saldo de capital con más de 30 días de atraso
const saldoMora30 = datosCarteraCrecimiento.reduce(
    (total, registro) => {
        return registro.diasAtraso > 30
            ? total + registro.saldo
            : total;
    },
    0
);

// Indicador PAR mayor a 30 días
const par30 = carteraActual > 0
    ? (saldoMora30 / carteraActual) * 100
    : 0;

    // Agrupar movimientos por mes
    const mensual = {};

    function obtenerMes(fecha) {

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");

        return anio + "-" + mes;
    }

    datosCarteraCrecimiento.forEach(registro => {

        const periodo = obtenerMes(registro.fecha);

        if (!mensual[periodo]) {
            mensual[periodo] = {
                desembolsos: 0,
                amortizaciones: 0
            };
        }

        mensual[periodo].desembolsos += registro.desembolso;

    });

    datosAmortizaciones.forEach(registro => {

        const periodo = obtenerMes(registro.fecha);

        if (!mensual[periodo]) {
            mensual[periodo] = {
                desembolsos: 0,
                amortizaciones: 0
            };
        }

        mensual[periodo].amortizaciones += registro.capital;

    });

    // Periodo automático según la fecha de la computadora
const ahora = new Date();

const periodoCierre =
    ahora.getFullYear() + "-" +
    String(ahora.getMonth() + 1).padStart(2, "0");

// Mostrar únicamente el mes de cierre
const periodos = mensual[periodoCierre]
    ? [periodoCierre]
    : [];

let totalDesembolsos = 0;
let totalAmortizaciones = 0;

periodos.forEach(periodo => {

    totalDesembolsos = mensual[periodo].desembolsos;
    totalAmortizaciones = mensual[periodo].amortizaciones;

    mensual[periodo].crecimiento =
        totalDesembolsos - totalAmortizaciones;

});

const crecimientoNeto =
    totalDesembolsos - totalAmortizaciones;

    // Evitar cierres sin movimientos del mes
if (totalDesembolsos === 0 && totalAmortizaciones === 0) {
    resultadoCierreCrecimiento = null;

    document.getElementById("btnGuardarCierreCartera").disabled = true;

    alert("No existen desembolsos ni amortizaciones para el mes de cierre.");
    return;
}

    // Datos del cierre mensual
resultadoCierreCrecimiento = {
    periodo: periodoCierre,
    carteraActual,
    desembolsos: totalDesembolsos,
    amortizaciones: totalAmortizaciones,
    crecimientoNeto,
    saldoMora30,
    par30
};

    function soles(valor) {
        return valor.toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        });
    }

    let html = `
        <h3>📊 Resultados del análisis</h3>

        <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
            gap:10px;
        ">

            <div class="card-resumen">
                <div>💼 Cartera actual</div>
                <div>${soles(carteraActual)}</div>
            </div>

            <div class="card-resumen">
                <div>💰 Desembolsos</div>
                <div>${soles(totalDesembolsos)}</div>
            </div>

            <div class="card-resumen">
                <div>📥 Amortización de capital</div>
                <div>${soles(totalAmortizaciones)}</div>
            </div>

            <div class="card-resumen">
                <div>📈 Crecimiento neto del periodo</div>
                <div>${soles(crecimientoNeto)}</div>
            </div>
<div class="card-resumen">
    <div>⚠️ Mora PAR > 30 días</div>
    <div>${par30.toFixed(2)}%</div>
    <small>Saldo: ${soles(saldoMora30)}</small>
</div>
        </div>

        <h3 style="margin-top:25px;">
            📅 Evolución mensual de movimientos
        </h3>

        <div style="overflow-x:auto;">
        <table style="
            width:100%;
            border-collapse:collapse;
            font-size:13px;
        ">

            <thead>
                <tr style="background:#123B63;color:white;">
                    <th style="padding:10px;">Periodo</th>
                    <th>Desembolsos</th>
                    <th>Amortizaciones</th>
                    <th>Crecimiento neto</th>
                </tr>
            </thead>

            <tbody>
    `;

    periodos.forEach(periodo => {

        const dato = mensual[periodo];

        html += `
            <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:10px;text-align:center;">
                    ${periodo}
                </td>

                <td style="padding:10px;text-align:right;">
                    ${soles(dato.desembolsos)}
                </td>

                <td style="padding:10px;text-align:right;">
                    ${soles(dato.amortizaciones)}
                </td>

                <td style="
                    padding:10px;
                    text-align:right;
                    font-weight:bold;
                    color:${dato.crecimiento >= 0 ? "#16A34A" : "#DC2626"};
                ">
                    ${soles(dato.crecimiento)}
                </td>
            </tr>
        `;

    });

    html += `
            </tbody>
        </table>
        </div>

        <p style="
            margin-top:15px;
            padding:12px;
            background:#F1F5F9;
            border-radius:10px;
            font-size:12px;
            color:#475569;
        ">
            El crecimiento neto representa desembolsos menos amortizaciones
            de capital del periodo. No equivale a la variación histórica
            del saldo total de cartera.
        </p>
    `;

document.getElementById("resultadoCrecimientoCartera").innerHTML = html;

    // Habilitar guardado cuando el análisis esté procesado
document.getElementById("btnGuardarCierreCartera").disabled =
    !resultadoCierreCrecimiento;

}

// ==========================================
// GUARDAR CIERRE MENSUAL EN FIREBASE
// ==========================================

function guardarCierreCrecimientoCartera() {

    if (!resultadoCierreCrecimiento) {
        alert("Primero debes procesar el análisis.");
        return;
    }

    // Verificar que solo el administrador pueda cerrar
if (asesor !== "admin") {
    alert("Solo el administrador puede realizar el cierre mensual.");
    return;
}

// Confirmar cierre manual
const confirmar = confirm(
    "¿Confirma guardar el cierre de " +
    resultadoCierreCrecimiento.periodo +
    "?\n\nUna vez guardado, el histórico no podrá sobrescribirse."
);

if (!confirmar) {
    return;
}

    if (typeof db === "undefined") {
        alert("No se encuentra la conexión con Firebase.");
        return;
    }

    const periodo = resultadoCierreCrecimiento.periodo;

    const ruta = "historicoCrecimientoCartera/" + periodo;

    const datosGuardar = {
        ...resultadoCierreCrecimiento,
        fechaGuardado: new Date().toISOString()
    };

    db.ref(ruta).transaction(

        function(actual) {

            // No permitir sobrescribir un cierre existente
            if (actual !== null) {
                return;
            }

            return datosGuardar;
        },

        function(error, committed) {

            if (error) {
                alert("Error al guardar el cierre mensual.");
                console.error(error);
                return;
            }

            if (!committed) {
                alert("Este mes ya tiene un cierre guardado. No se modificó el histórico.");
                return;
            }

            alert("Cierre mensual guardado correctamente.");

            document.getElementById("btnGuardarCierreCartera").disabled = true;
        },

        false
    );
}

// ==========================================
// CONSULTAR CIERRE DEL MES ANTERIOR
// ==========================================

function obtenerCierreMesAnterior(periodo) {

    const [anio, mes] = periodo.split("-").map(Number);

    const fechaAnterior = new Date(anio, mes - 2, 1);

    const periodoAnterior =
        fechaAnterior.getFullYear() + "-" +
        String(fechaAnterior.getMonth() + 1).padStart(2, "0");

    return db.ref(
        "historicoCrecimientoCartera/" + periodoAnterior
    ).once("value").then(snapshot => {

        return snapshot.exists()
            ? snapshot.val()
            : null;

    });
}

// ==========================================
// CUADRO COMPARATIVO MENSUAL
// ==========================================

function mostrarComparativoCrecimiento(actual, anterior) {

    const contenedor = document.getElementById(
        "resultadoComparativoCartera"
    );

    if (!contenedor) return;

    const formatoSoles = valor =>
        Number(valor || 0).toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        });

    const variacion = (actual, anterior) => {

        if (!anterior) return "Sin histórico";

        if (anterior === 0) return "N/A";

        const porcentaje =
            ((actual - anterior) / Math.abs(anterior)) * 100;

        return (porcentaje > 0 ? "+" : "") +
            porcentaje.toFixed(2) + "%";
    };

    const variacionPP = (actual, anterior) => {

        if (!anterior) return "Sin histórico";

        const diferencia = actual - anterior;

        return (diferencia > 0 ? "+" : "") +
            diferencia.toFixed(2) + " pp";
    };

    const filas = [
        ["Cartera total", formatoSoles(actual.carteraActual),
            anterior ? formatoSoles(anterior.carteraActual) : "Sin histórico",
            variacion(actual.carteraActual, anterior?.carteraActual)],

        ["Desembolsos", formatoSoles(actual.desembolsos),
            anterior ? formatoSoles(anterior.desembolsos) : "Sin histórico",
            variacion(actual.desembolsos, anterior?.desembolsos)],

        ["Amortizaciones", formatoSoles(actual.amortizaciones),
            anterior ? formatoSoles(anterior.amortizaciones) : "Sin histórico",
            variacion(actual.amortizaciones, anterior?.amortizaciones)],

        ["Crecimiento neto", formatoSoles(actual.crecimientoNeto),
            anterior ? formatoSoles(anterior.crecimientoNeto) : "Sin histórico",
            variacion(actual.crecimientoNeto, anterior?.crecimientoNeto)],

        ["Mora PAR > 30 días", actual.par30.toFixed(2) + "%",
            anterior ? anterior.par30.toFixed(2) + "%" : "Sin histórico",
            variacionPP(actual.par30, anterior?.par30)]
    ];

    contenedor.innerHTML = `
        <h3>📊 Comparativo mensual de cartera</h3>

        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#123B63;color:white;">
                        <th>Concepto</th>
                        <th>Mes actual</th>
                        <th>Mes anterior</th>
                        <th>Variación</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas.map(fila => `
                        <tr style="border-bottom:1px solid #ddd;">
                            <td style="padding:12px;">${fila[0]}</td>
                            <td style="text-align:right;">${fila[1]}</td>
                            <td style="text-align:right;">${fila[2]}</td>
                            <td style="text-align:right;font-weight:bold;">
                                ${fila[3]}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

