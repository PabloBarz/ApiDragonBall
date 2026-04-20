document.addEventListener("DOMContentLoaded", () => {
  let todosLosPersonajes = [];
  let transformacionesActuales = [];

  // ================================
  // Cargar todos los personajes
  // ================================
  async function fetchTodos(endpoint) {
    let pagina = 1;
    let todos = [];

    while (true) {
      try {
        const response = await fetch(
          `https://dragonball-api.com/api/${endpoint}?page=${pagina}&limit=50`,
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const items = data.items || [];

        todos = todos.concat(items);

        if (pagina >= data.meta.totalPages) break;

        pagina++;
      } catch (error) {
        console.error(`fetchTodos falló en página ${pagina}:`, error);
        break;
      }
    }

    return todos;
  }

  // ================================
  // Cargar todas las razas
  // ================================

  async function cargarRazas() {
    const select = document.getElementById("select-raza");
    const btnMostrar = document.getElementById("btn-mostrar");

    select.disabled = true;
    btnMostrar.disabled = true;

    try {
      todosLosPersonajes = await fetchTodos("characters");
      console.log(todosLosPersonajes)

      if (todosLosPersonajes.length === 0) {
        select.innerHTML =
          '<option value="">No se encontraron personajes</option>';
        return;
      }

      const traducciones = {
        Human: "Humano",
        Saiyan: "Saiyajin",
        Namekian: "Namekiano",
        Android: "Androide",
        Majin: "Majin",
        "Frieza Race": "Raza de Freezer",
        "Jiren Race": "Raza de Jiren",
        Angel: "Ángel",
        God: "Dios",
        Evil: "Maligno",
        Nucleico: "Nucleico",
        "Nucleico benigno": "Nucleico Benigno",
        Unknown: "Desconocido",
      };

      const razas = [
        ...new Set(todosLosPersonajes.map((p) => p.race).filter(Boolean)),
      ];

      select.innerHTML = '<option value="">— Elige una raza —</option>';
      razas.forEach((raza) => {
        const traduccion = traducciones[raza] || raza;
        select.insertAdjacentHTML(
          "beforeend",
          `
            <option value="${raza}">${traduccion}</option>
        `,
        );
      });
    } catch (error) {
      console.error("Error al cargar razas:", error);
      select.innerHTML = '<option value="">Error al cargar razas</option>';
    } finally {
      select.disabled = false;
      btnMostrar.disabled = false;
    }
  }

  // ================================
  // Mostrar tabla de personajes
  // ================================

  function mostrarTabla(raza) {
    const seccionTabla = document.getElementById("seccion-tabla");
    const contenedor = document.getElementById("contenedor-tabla");
    const seccionDetalle = document.getElementById("seccion-detalle");
    const contenedorDetalle = document.getElementById("contenedor-detalle");

    seccionDetalle.classList.remove("seccion");
    contenedorDetalle.innerHTML = "";

    const personajesFiltrados = todosLosPersonajes.filter((p) => p.race === raza,);

    if (personajesFiltrados.length === 0) {
      seccionTabla.classList.add("seccion");
      contenedor.innerHTML = `
      <p class="mensaje-vacio">No se encontraron personajes de esta raza.</p>
    `;
      return;
    }

    seccionTabla.classList.add("seccion");
    contenedor.innerHTML = "";

    contenedor.insertAdjacentHTML(
      "beforeend",
      `
    <table class="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Ki</th>
          <th>Ki Máx</th>
          <th>Género</th>
          <th>Imagen</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody id="cuerpo-tabla"></tbody>
    </table>
  `,
    );

    const cuerpo = document.getElementById("cuerpo-tabla");

    personajesFiltrados.forEach((p) => {
      cuerpo.insertAdjacentHTML(
        "beforeend",
        `
      <tr class="tabla__fila">
        <td class="tabla__celda">${p.id}</td>
        <td class="tabla__celda tabla__celda--nombre">${p.name}</td>
        <td class="tabla__celda">${p.ki === "unknown" ? "Desconocido" : p.ki}</td>
        <td class="tabla__celda">${p.maxKi === "unknown" ? "Desconocido" : p.maxKi}</td>
        <td class="tabla__celda">${p.gender === "unknown" ? "Desconocido" : p.gender}</td>
        <td class="tabla__celda">
          <img
            src="${p.image}"
            alt="${p.name}"
            class="tabla__imagen"
          />
        </td>
        <td class="tabla__celda">
          <button class="btn btn--small"${p.id}">
            Ver
          </button>
        </td>
      </tr>
    `,
      );
    });
  }

  cargarRazas();

  document.getElementById("btn-mostrar").addEventListener("click", () => {
    const raza = document.getElementById("select-raza").value;
    if (!raza) return;
    mostrarTabla(raza);
  });

  document.getElementById("select-raza").addEventListener("change", (e) => {
    if (!e.target.value) return;
    mostrarTabla(e.target.value);
  });
});
