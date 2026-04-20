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

      const razas = [...new Set(todosLosPersonajes.map((p) => p.race).filter(Boolean))];    

      select.innerHTML = '<option value="">— Elige una raza —</option>';
      razas.forEach((raza) => {
        const traduccion = traducciones[raza] || raza; 
        select.insertAdjacentHTML("beforeend",
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

  cargarRazas();

  document.getElementById("btn-mostrar").addEventListener("click", () => {
    const raza = document.getElementById("select-raza").value;
    if (!raza) return; 
    console.log("raza seleccionada:", raza);
  });

  document.getElementById("select-raza").addEventListener("change", (e) => {
    if (!e.target.value) return;
    console.log("raza cambiada:", e.target.value);
  });
});
