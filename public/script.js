console.log("🔥 TIENDA CARGADA");

const API_URL = "https://basketteniss-api.onrender.com";

let productos = [];
let cart = [];
let productoSeleccionado = null;
let tallaSeleccionada = "";

async function cargarProductos() {
  const res = await fetch(`${API_URL}/productos`);
  productos = await res.json();

  console.log("PRODUCTOS CARGADOS:", productos);
}

function mostrarProductos(lista) {
  const seccion = document.getElementById("productos");
  const grid = document.getElementById("grid-productos");

  if (!seccion || !grid) {
    console.error("No existe la sección productos o grid-productos");
    return;
  }

  seccion.style.display = "block";
  grid.innerHTML = "";

  if (!lista || lista.length === 0) {
    grid.innerHTML = "<p style='text-align:center;'>No hay productos disponibles.</p>";
    return;
  }

  lista.forEach(p => {
    grid.innerHTML += `
      <div class="card" onclick="abrirProducto(${p.id})">
        <div class="card-img">
          <img src="${p.imagen}" alt="${p.nombre}">
        </div>

        <div class="card-body">
          <h3>${p.nombre}</h3>
          <p>${p.marca}</p>
          <p class="price">RD$ ${p.precio}</p>
        </div>
      </div>
    `;
  });
}

function filtrarMarca(marca) {
  const filtrados = productos.filter(
    p => p.marca && p.marca.trim().toLowerCase() === marca.trim().toLowerCase()
  );

  mostrarProductos(filtrados);

  document.getElementById("productos").scrollIntoView({
    behavior: "smooth"
  });
}

function filtrarTipo(tipo, boton) {
  document.querySelectorAll(".mini-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  boton.classList.add("active");

  if (tipo === "Todos") {
    mostrarProductos(productos);
    return;
  }

  const filtrados = productos.filter(
    p => p.tipo && p.tipo.trim().toLowerCase() === tipo.trim().toLowerCase()
  );

  mostrarProductos(filtrados);
}

function scrollToSection(id) {
  const seccion = document.getElementById(id);

  if (!seccion) return;

  if (id === "productos") {
    const productosSection = document.getElementById("productos");
    productosSection.style.display = "block";
    mostrarProductos(productos);
  }

  seccion.scrollIntoView({
    behavior: "smooth"
  });
}

function abrirProducto(id) {
  productoSeleccionado = productos.find(p => p.id === id);
  tallaSeleccionada = "";

  if (!productoSeleccionado) return;

  document.getElementById("popup-img").src = productoSeleccionado.imagen;
  document.getElementById("popup-nombre").textContent = productoSeleccionado.nombre;
  document.getElementById("popup-marca").textContent = productoSeleccionado.marca;
  document.getElementById("popup-precio").textContent = "RD$ " + productoSeleccionado.precio;

  const tallasBox = document.getElementById("popup-tallas");
  tallasBox.innerHTML = "";

  const tallas = productoSeleccionado.tallas
    ? productoSeleccionado.tallas.split(",").map(t => t.trim()).filter(t => t !== "")
    : [];

  if (tallas.length === 0) {
    tallasBox.innerHTML = "<p>No hay tallas registradas</p>";
  } else {
    tallas.forEach(talla => {
      tallasBox.innerHTML += `
        <button class="talla-btn" onclick="seleccionarTalla('${talla}', this)">
          ${talla}
        </button>
      `;
    });
  }

  document.getElementById("popup-add-btn").onclick = function () {
    if (!tallaSeleccionada) {
      alert("⚠️ Selecciona una talla primero");
      return;
    }

    addCart(productoSeleccionado.id, tallaSeleccionada);
    cerrarProducto();
  };

  document.getElementById("product-popup").classList.add("open");
}

function seleccionarTalla(talla, boton) {
  tallaSeleccionada = talla;

  document.querySelectorAll(".talla-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  boton.classList.add("active");
}

function cerrarProducto() {
  document.getElementById("product-popup").classList.remove("open");
}

function addCart(id, talla) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existe = cart.find(item => item.id === id && item.talla === talla);

  if (existe) {
    existe.qty++;
  } else {
    cart.push({
      ...producto,
      talla,
      qty: 1
    });
  }

  updateCartUI();
}

function removeCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const total = cart.reduce((acc, item) => acc + Number(item.precio) * item.qty, 0);

  document.getElementById("cart-count").textContent = count;
  document.getElementById("total").textContent = "RD$ " + total.toLocaleString();

  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  cartItems.innerHTML = cart.map(item => `
  <div class="cart-item premium-cart-item">

    <img class="cart-product-img" src="${item.imagen}" alt="${item.nombre}">

    <div class="cart-product-info">
      <strong>${item.nombre}</strong>
      <p>${item.marca}</p>
      <p><strong>Talla:</strong> ${item.talla}</p>
      <p>RD$ ${item.precio} x ${item.qty}</p>

      <button onclick="removeCart(${item.id})">
        Quitar
      </button>
    </div>

  </div>
`).join("");
}

function openCart() {
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

function sendWA() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  let msg = "🏀 Hola BasketTeniss.%0A%0AMe interesa este pedido:%0A%0A";

  cart.forEach(item => {
    msg += `👟 Producto: ${item.nombre}%0A`;
    msg += `📏 Talla: ${item.talla}%0A`;
    msg += `💰 Precio: RD$ ${item.precio}%0A`;
    msg += `🏷️ Marca: ${item.marca}%0A`;
    msg += `Cantidad: ${item.qty}%0A%0A`;
  });

  msg += "¿Está disponible?%0A%0AGracias.";

  window.open(`https://wa.me/18494250473?text=${msg}`, "_blank");
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
});
