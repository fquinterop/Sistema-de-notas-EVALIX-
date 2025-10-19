document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addRowBtn");
  const saveBtn = document.getElementById("saveBtn");
  const exportBtn = document.getElementById("exportBtn");
  const clearBtn = document.getElementById("clearBtn");
  const tbody = document.getElementById("gradesTbody");

  // --- Agregar nueva fila ---
  addBtn.addEventListener("click", () => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td></td>
      <td><input data-k="idEst" class="form-control form-control-sm"></td>
      <td><input data-k="nombre" class="form-control form-control-sm"></td>
      <td><input data-k="asignatura" class="form-control form-control-sm"></td>
      <td><input data-k="n1" type="number" min="0" max="5" step="0.1" class="form-control form-control-sm"></td>
      <td><input data-k="n2" type="number" min="0" max="5" step="0.1" class="form-control form-control-sm"></td>
      <td><input data-k="n3" type="number" min="0" max="5" step="0.1" class="form-control form-control-sm"></td>
      <td><input data-k="n4" type="number" min="0" max="5" step="0.1" class="form-control form-control-sm"></td>
      <td><span class="badge bg-secondary promedio">0.00</span></td>
      <td><button class="btn btn-sm btn-outline-danger eliminar">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
    actualizarNumeros();
  });

  // --- Calcular promedio ---
  function calcularPromedio(fila) {
    const notas = ["n1","n2","n3","n4"].map(k =>
      parseFloat(fila.querySelector(`[data-k="${k}"]`)?.value || 0)
    );
    const promedio = (notas.reduce((a,b)=>a+b,0) / 4) || 0;
    const badge = fila.querySelector(".promedio");
    badge.textContent = promedio.toFixed(2);
    badge.className = `badge ${promedio >= 3 ? "bg-success" : "bg-danger"} promedio`;
    return promedio;
  }

  function actualizarNumeros() {
    tbody.querySelectorAll("tr").forEach((fila, i) => fila.children[0].textContent = i + 1);
  }

  // --- Capturar datos al guardar ---
  saveBtn.addEventListener("click", () => {
    const anio = document.getElementById("anio").value;
    const periodo = document.getElementById("periodo").value;

    // Captura cada fila con todos los datos
    const registros = Array.from(tbody.querySelectorAll("tr")).map(fila => {
      const registro = {};
      fila.querySelectorAll("input").forEach(input => {
        registro[input.dataset.k] = input.value.trim();
      });
      registro.promedio = calcularPromedio(fila).toFixed(2);
      return registro;
    });

    // Resultado completo
    const resultado = {
      anio,
      periodo,
      estudiantes: registros
    };

    // Mostrar datos capturados
    console.table(resultado.estudiantes);
    console.log("📘 Año lectivo:", resultado.anio);
    console.log("📗 Período:", resultado.periodo);
    console.log("📙 Datos capturados:", resultado.estudiantes);
  });

  // --- Eliminar fila ---
  tbody.addEventListener("click", e => {
    if (e.target.classList.contains("eliminar")) {
      e.target.closest("tr").remove();
      actualizarNumeros();
    }
  });

  // --- Recalcular promedio al editar ---
  tbody.addEventListener("input", e => {
    if (["n1","n2","n3","n4"].includes(e.target.dataset.k)) {
      calcularPromedio(e.target.closest("tr"));
    }
  });

  // --- Limpiar todo ---
  clearBtn.addEventListener("click", () => {
    if (confirm("¿Deseas borrar todos los registros?")) {
      tbody.innerHTML = "";
    }
  });
});
