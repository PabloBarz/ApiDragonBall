document.addEventListener("DOMContentLoaded", () => {
  let todosLosPersonajes = [];
  let transformacionesActuales = [];

  const traducciones = {
    razas: {
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
    },
    generos: {
      Male: "Masculino",
      Female: "Femenino",
      Unknown: "Desconocido",
    },
  };

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

      if (todosLosPersonajes.length === 0) {
        select.innerHTML =
          '<option value="">No se encontraron personajes</option>';
        return;
      }

      const razas = [
        ...new Set(todosLosPersonajes.map((p) => p.race).filter(Boolean)),
      ];

      select.innerHTML = '<option value="">— Elige una raza —</option>';
      razas.forEach((raza) => {
        const traduccion = traducciones.razas[raza] || raza;
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

    const personajesFiltrados = todosLosPersonajes.filter(
      (p) => p.race === raza,
    );

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
          <th>Ki Base</th>
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
        <td class="tabla__celda">${traducciones.generos[p.gender] || p.gender || "—"}</td>
        <td class="tabla__celda">
          <button
            class="btn-imagen"
            data-imagen="${p.image}"
            data-nombre="${p.name}"
            aria-label="Ver imagen de ${p.name}">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
          <img
            src="${p.image}"
            alt="${p.name}"
            class="tabla__imagen"
            onerror="this.style.display='none'"
           />
        </td>
        <td class="tabla__celda">
          <a href="#seccion-detalle" class="btn btn--small" data-id="${p.id}">Ver</a>
        </td>
      </tr>
    `,
      );
    });

    const botonesVer = document.querySelectorAll(".btn--small[data-id]");
    botonesVer.forEach((boton) => {
      boton.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        verDetalle(id);
      });
    });

    botonImagen = document.querySelectorAll(".btn-imagen[data-imagen]");
    botonImagen.forEach((boton) => {
      boton.addEventListener("click", (e) => {
        const imagen = e.currentTarget.dataset.imagen;
        const nombre = e.currentTarget.dataset.nombre;
        toggleModal(imagen, nombre);
      });
    });
  }

  // ================================
  // MODAL
  // ================================

  function toggleModal(imagen = "", nombre = "") {
    const modal = document.getElementById("modal");
    const modalImagen = document.getElementById("modal-imagen");
    const modalNombre = document.getElementById("modal-nombre");

    const estaAbierto = modal.classList.contains("modal--activo");

    if (estaAbierto) {
      modal.classList.remove("modal--activo");
      document.body.classList.remove("body--sin-scroll");
      setTimeout(() => {
        modalImagen.src = "";
      }, 300);
      return;
    }

    modalImagen.src = imagen;
    modalImagen.alt = nombre;
    modalNombre.textContent = nombre;
    modal.classList.add("modal--activo");
    document.body.classList.add("body--sin-scroll");
  }

  // ================================
  // DETALLE
  // ================================

  async function verDetalle(id) {
    const seccionDetalle = document.getElementById("seccion-detalle");
    const contenedorDetalle = document.getElementById("contenedor-detalle");

    seccionDetalle.classList.add("seccion");
    contenedorDetalle.innerHTML = `
    <p class="mensaje-vacio">
      <i class="fa-solid fa-spinner fa-spin"></i> Cargando...
    </p>
  `;

    try {
      const respuesta = await fetch(
        `https://dragonball-api.com/api/characters/${id}`,
      );

      if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

      const personaje = await respuesta.json();
      transformacionesActuales = personaje.transformations || [];

      mostrarDetalle(personaje);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      contenedorDetalle.innerHTML = `
      <p class="mensaje-vacio">Error al cargar el detalle.</p>
    `;
    }
  }

  function mostrarDetalle(personaje) {
    const contenedorDetalle = document.getElementById("contenedor-detalle");
    const tieneTransformaciones = transformacionesActuales.length > 0;

    const selectHTML = tieneTransformaciones
      ? `
    <div class="detalle__filtro">
      <select id="select-transformacion" class="filtro__select">
        <option value="-1">${personaje.name} (base)</option>
        ${transformacionesActuales
          .map(
            (t, i) => `
          <option value="${i}">${t.name}</option>
        `,
          )
          .join("")}
      </select>
    </div>
  `
      : "";

    contenedorDetalle.innerHTML = "";

    contenedorDetalle.insertAdjacentHTML(
      "beforeend",
      `
    <div class="detalle">

      <div class="detalle__izquierda">
        ${selectHTML}
        <img
          src="${personaje.image}"
          alt="${personaje.name}"
          class="detalle__imagen"
          id="detalle-imagen"
        />
      </div>

      <div class="detalle__derecha">
        <h2 class="detalle__nombre" id="detalle-nombre">${personaje.name}</h2>
        <p class="detalle__dato" >
          <span class="detalle__label">Ki:</span>
          <span id="detalle-ki">${personaje.ki || "—"}</span>
        </p>
        <p class="detalle__dato">
          <span class="detalle__label">Max Ki:</span>
          ${personaje.maxKi || "—"}
        </p>
        <p class="detalle__dato">
          <span class="detalle__label">Descripción:</span>
          ${personaje.description || "—"}
        </p>
        <p class="detalle__dato">
          <span class="detalle__label">Afiliación:</span>
          ${personaje.affiliation || "—"}
        </p>
        <p class="detalle__dato">
          <span class="detalle__label">Planeta de origen:</span>
          ${personaje.originPlanet.name || "—"}
        </p>
      </div>

    </div>
  `,
    );

    if (tieneTransformaciones) {
      document
        .getElementById("select-transformacion")
        .addEventListener("change", (e) => {
          const idx = e.target.value;
          cambiarTransformacion(idx, personaje);
        });
    }
  }

  function cambiarTransformacion(idx, personaje) {
    const imagen = document.getElementById("detalle-imagen");
    const nombre = document.getElementById("detalle-nombre");
    const ki = document.getElementById("detalle-ki");

    if (idx == -1) {
      imagen.src = personaje.image;
      imagen.alt = personaje.name;
      nombre.textContent = personaje.name;
      ki.textContent = personaje.ki || "—";
      return;
    }

    const t = transformacionesActuales[idx];
    if (!t) return;

    imagen.src = t.image;
    imagen.alt = t.name;
    nombre.textContent = t.name;
    ki.textContent     = t.ki || "—";
  }

  cargarRazas();

  document
    .getElementById("modal-cerrar")
    .addEventListener("click", () => toggleModal());
  document
    .getElementById("modal-overlay")
    .addEventListener("click", () => toggleModal());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("modal");
      const estaAbierto = modal.classList.contains("modal--activo");

      if (!estaAbierto) return;

      toggleModal();
    }
  });

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
