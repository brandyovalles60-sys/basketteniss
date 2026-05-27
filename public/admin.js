console.log("🔥 ADMIN JS CONECTADO 🔥");

let productos = [];

const API_URL = "https://basketteniss-api.onrender.com";

let ADMIN_USER = localStorage.getItem("ADMIN_USER");
let ADMIN_PASS = localStorage.getItem("ADMIN_PASS");

function loginAdmin() {
  ADMIN_USER = document.getElementById("adminUser").value;
  ADMIN_PASS = document.getElementById("adminPass").value;

  localStorage.setItem("ADMIN_USER", ADMIN_USER);
  localStorage.setItem("ADMIN_PASS", ADMIN_PASS);

  alert("✅ Acceso guardado");

  document.getElementById("login-admin").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  
}
// =========================
// 🔄 CARGAR PRODUCTOS
// =========================
async function cargarProductos() {

  try {

    const res = await fetch(`${API_URL}/productos`);

    if (!res.ok) {
      throw new Error("Error al cargar productos");
    }

    productos = await res.json();

    renderProductos();

  } catch (error) {

    console.error(error);

    alert("❌ No se pudieron cargar productos");
  }
}

// =========================
// 🎨 MOSTRAR PRODUCTOS
// =========================
function renderProductos() {

  const lista = document.getElementById("lista");

  if (!lista) return;

  lista.innerHTML = "";

  productos.forEach((p) => {

    const card = document.createElement("div");

    card.className = "producto-card";

    const precioFormateado = new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP"
    }).format(p.precio);

    card.innerHTML = `

      <img src="${p.imagen}" width="150">

      <h3>${p.nombre}</h3>

      <p>${p.marca}</p>

      <p><strong>${precioFormateado}</strong></p>

      <p>${p.categoria}</p>

      <p>${p.descripcion || ""}</p>

      <button class="btn-eliminar">
        Eliminar
      </button>

    `;

    card
      .querySelector(".btn-eliminar")
      .addEventListener("click", () => {

        eliminarProducto(p.id);

      });

    lista.appendChild(card);

  });
}

// =========================
// ➕ AGREGAR PRODUCTO
// =========================
async function agregarProducto(e) {

  e.preventDefault();

  try {

    console.log("🚀 AGREGANDO PRODUCTO");

    const nombre = document.getElementById("nombre").value;

    const marca = document.getElementById("marca").value;

    const precio = document.getElementById("precio").value;

    const categoria = document.getElementById("categoria").value;

    const descripcion = document.getElementById("descripcion").value;

    const tipo = document.getElementById("tipo").value;

    const imagen = document.getElementById("imagen").files[0];

    if (!imagen) {
      alert("❌ Debes seleccionar una imagen");
      return;
    }

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("marca", marca);
    formData.append("precio", precio);
    formData.append("categoria", categoria);
    formData.append("descripcion", descripcion);
    formData.append("tipo", tipo);
    formData.append("imagen", imagen);

    const res = await fetch(`${API_URL}/productos`, {

      method: "POST",

      headers: {
        "admin-user": ADMIN_USER,
        "admin-pass": ADMIN_PASS
    },

      body: formData

    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {

      throw new Error(data.error || "Error");

    }

    alert("✅ PRODUCTO AGREGADO");

    limpiarInputs();

    cargarProductos();

  } catch (error) {

    console.error(error);

    alert("❌ ERROR AL AGREGAR PRODUCTO");
  }
}

// =========================
// ❌ ELIMINAR
// =========================
async function eliminarProducto(id) {

  try {

    const res = await fetch(`${API_URL}/productos/${id}`, {

      method: "DELETE",

      headers: {
        "admin-user": ADMIN_USER,
        "admin-pass": ADMIN_PASS
      }

    });

    if (!res.ok) {

      throw new Error("Error al eliminar");

    }

    cargarProductos();

  } catch (error) {

    console.error(error);

    alert("❌ Error al eliminar");
  }
}

// =========================
// 🧹 LIMPIAR
// =========================
function limpiarInputs() {

  document.getElementById("nombre").value = "";

  document.getElementById("marca").value = "";

  document.getElementById("precio").value = "";

  document.getElementById("categoria").value = "";

  document.getElementById("descripcion").value = "";

  document.getElementById("imagen").value = "";
}

// =========================
// 🚀 INICIO
// =========================
document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("formulario")
    .addEventListener("submit", agregarProducto)
    cargarProductos();

});

document.getElementById("imagen").addEventListener("change", function () {
  const archivo = this.files[0];
  const preview = document.getElementById("preview-img");

  if (!archivo) {
    preview.src = "";
    return;
  }

  preview.src = URL.createObjectURL(archivo);
});