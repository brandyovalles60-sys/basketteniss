console.log("🔥 ADMIN JS CONECTADO 🔥");

let productos = [];

const API_URL = "https://basketteniss-api.onrender.com";
const ADMIN_USER = "brandy";
const ADMIN_PASS = "BasketTeniss2026*";



function adminHeaders() {
  return {
    "admin-user": ADMIN_USER,
    "admin-pass": ADMIN_PASS
  };
}




function loginAdmin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    alert("❌ Usuario o contraseña incorrectos");
    return;
  }

  alert("✅ Acceso correcto");

  document.getElementById("login-admin").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";

  cargarProductos();
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
function renderProductos(lista = productos) {

  const contenedor = document.getElementById("lista");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `
      <div class="admin-empty">
        No hay productos para mostrar
      </div>
    `;
    return;
  }

  lista.forEach((p) => {

    const card = document.createElement("div");

    card.className = "admin-product-card";

    const precioFormateado = new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP"
    }).format(Number(p.precio));

    card.innerHTML = `

      <div class="admin-product-img-box">
        <img src="${p.imagen}" alt="${p.nombre}">
      </div>

      <div class="admin-product-info">
        <h3>${p.nombre}</h3>

        <p><strong>Marca:</strong> ${p.marca}</p>
        <p><strong>Tipo:</strong> ${p.tipo || ""}</p>
        <p><strong>Categoría:</strong> ${p.categoria || ""}</p>
        <p class="admin-price">${precioFormateado}</p>
      </div>

      <div class="admin-actions">
        <button class="btn-editar">
          Editar
        </button>

        <button class="btn-eliminar">
          Eliminar
        </button>
      </div>

    `;

    card
      .querySelector(".btn-eliminar")
      .addEventListener("click", () => {
        eliminarProducto(p.id);
      });

    card
      .querySelector(".btn-editar")
      .addEventListener("click", () => {
        prepararEditarProducto(p);
      });

    contenedor.appendChild(card);

  });
}

// =========================
// ➕ AGREGAR PRODUCTO
// =========================
async function agregarProducto(e) {
  e.preventDefault();

  try {
    const productoId = document.getElementById("productoId").value;

    const formData = new FormData();

    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("marca", document.getElementById("marca").value);
    formData.append("precio", document.getElementById("precio").value);
    formData.append("categoria", document.getElementById("categoria").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("tipo", document.getElementById("tipo").value);
    formData.append("tallas", document.getElementById("tallas").value);

    const imagen = document.getElementById("imagen").files[0];

    if (imagen) {
      formData.append("imagen", imagen);
    }

    if (!productoId && !imagen) {
      alert("❌ Debes seleccionar una imagen");
      return;
    }

    const url = productoId
      ? `${API_URL}/productos/${productoId}`
      : `${API_URL}/productos`;

    const metodo = productoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: metodo,
      headers: adminHeaders(),
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error");
    }

    alert(productoId ? "✅ Producto actualizado" : "✅ Producto agregado");

    limpiarInputs();
    cancelarEdicion();
    cargarProductos();

  } catch (error) {
    console.error(error);
    alert("❌ ERROR AL GUARDAR PRODUCTO");
  }
}

// =========================
// ❌ ELIMINAR
// =========================
async function eliminarProducto(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
      headers: adminHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al eliminar");
    }

    alert("✅ Producto eliminado");
    cargarProductos();

  } catch (error) {
    console.error(error);
    alert("❌ Error al eliminar");
  }
}


function prepararEditarProducto(producto) {
  document.getElementById("productoId").value = producto.id;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("marca").value = producto.marca;
  document.getElementById("precio").value = producto.precio;
  document.getElementById("categoria").value = producto.categoria;
  document.getElementById("tipo").value = producto.tipo;
  document.getElementById("descripcion").value = producto.descripcion || "";
  document.getElementById("tallas").value = producto.tallas || "";

  document.getElementById("imagen").required = false;
  document.getElementById("btn-submit").textContent = "Guardar cambios";
  document.getElementById("btn-cancelar-edicion").style.display = "block";

  if (producto.imagen) {
    document.getElementById("preview-img").src = producto.imagen;
  }

  document.getElementById("formulario").scrollIntoView({
    behavior: "smooth"
  });
}

function cancelarEdicion() {
  document.getElementById("productoId").value = "";
  document.getElementById("btn-submit").textContent = "Agregar";
  document.getElementById("btn-cancelar-edicion").style.display = "none";
  document.getElementById("imagen").required = true;
  document.getElementById("preview-img").src = "";
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

  document.getElementById("tallas").value = "";

  document.getElementById("imagen").value = "";

  document.getElementById("productoId").value = "";

  document.getElementById("preview-img").src = "";
}


function buscarProductos() {
  const texto = document
    .getElementById("buscador-productos")
    .value
    .toLowerCase()
    .trim();

  const filtrados = productos.filter((p) => {
    return (
      p.nombre?.toLowerCase().includes(texto) ||
      p.marca?.toLowerCase().includes(texto) ||
      p.categoria?.toLowerCase().includes(texto) ||
      p.tipo?.toLowerCase().includes(texto)
    );
  });

  renderProductos(filtrados);
}

// =========================
// 🚀 INICIO
// =========================
document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("formulario")
    .addEventListener("submit", agregarProducto);

  document
    .getElementById("buscador-productos")
    .addEventListener("input", buscarProductos);

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