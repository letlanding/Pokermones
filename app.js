const tablaTorneos = document.getElementById("tablaTorneos");
const agregarFilaBtn = document.getElementById("agregarFila");
const borrarHistorialBtn = document.getElementById("borrarHistorial");
const balanceGlobalText = document.getElementById("balanceGlobal");

const STORAGE_KEY = "pokermones-torneos";

let torneos = cargarTorneos();

function cargarTorneos() {
  const datos = localStorage.getItem(STORAGE_KEY);
  return datos ? JSON.parse(datos) : [];
}

function guardarTorneos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(torneos));
}

function crearTorneoVacio() {
  return {
    fecha: new Date().toISOString().split("T")[0],
    gasto: "",
    premio: ""
  };
}

function calcularBalance(torneo) {
  const gasto = Number(torneo.gasto) || 0;
  const premio = Number(torneo.premio) || 0;

  return premio - gasto;
}

function obtenerClaseBalance(balance) {
  if (balance < 0) return "negative";
  if (balance < 20) return "low-positive";
  return "high-positive";
}

function formatearDinero(valor) {
  return `$${Number(valor).toFixed(2)}`;
}

function renderizarTabla() {
  tablaTorneos.innerHTML = "";

  if (torneos.length === 0) {
    torneos.push(crearTorneoVacio());
  }

  torneos.forEach((torneo, index) => {
    const balance = calcularBalance(torneo);
    const claseBalance = obtenerClaseBalance(balance);

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        <input 
          type="date" 
          value="${torneo.fecha}" 
          data-index="${index}" 
          data-campo="fecha"
        />
      </td>

      <td>
        <input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          value="${torneo.gasto}" 
          data-index="${index}" 
          data-campo="gasto"
        />
      </td>

      <td>
        <input 
          type="number" 
          step="0.01" 
          placeholder="0.00" 
          value="${torneo.premio}" 
          data-index="${index}" 
          data-campo="premio"
        />
      </td>

      <td class="balance-cell ${claseBalance}">
        ${formatearDinero(balance)}
      </td>

      <td>
        <button class="btn delete-row" data-index="${index}">
          X
        </button>
      </td>
    `;

    tablaTorneos.appendChild(fila);
  });

  actualizarBalanceGlobal();
  guardarTorneos();
}

function actualizarBalanceGlobal() {
  const balanceGlobal = torneos.reduce((total, torneo) => {
    return total + calcularBalance(torneo);
  }, 0);

  balanceGlobalText.textContent = formatearDinero(balanceGlobal);
  balanceGlobalText.className = obtenerClaseBalance(balanceGlobal);
}

function actualizarDato(index, campo, valor) {
  torneos[index][campo] = valor;

  const fila = tablaTorneos.children[index];
  const balance = calcularBalance(torneos[index]);
  const balanceCell = fila.querySelector(".balance-cell");

  balanceCell.textContent = formatearDinero(balance);
  balanceCell.className = `balance-cell ${obtenerClaseBalance(balance)}`;

  actualizarBalanceGlobal();
  guardarTorneos();
}

function agregarFila() {
  torneos.push(crearTorneoVacio());
  renderizarTabla();
}

function eliminarFila(index) {
  torneos.splice(index, 1);

  if (torneos.length === 0) {
    torneos.push(crearTorneoVacio());
  }

  renderizarTabla();
}

function borrarTodo() {
  const confirmar = confirm("¿Seguro que querés borrar toda la planilla?");

  if (!confirmar) return;

  torneos = [crearTorneoVacio()];
  guardarTorneos();
  renderizarTabla();
}

tablaTorneos.addEventListener("input", (event) => {
  const input = event.target;

  if (!input.dataset.campo) return;

  const index = Number(input.dataset.index);
  const campo = input.dataset.campo;
  const valor = input.value;

  actualizarDato(index, campo, valor);
});

tablaTorneos.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-row")) return;

  const index = Number(event.target.dataset.index);
  eliminarFila(index);
});

agregarFilaBtn.addEventListener("click", agregarFila);
borrarHistorialBtn.addEventListener("click", borrarTodo);

renderizarTabla();