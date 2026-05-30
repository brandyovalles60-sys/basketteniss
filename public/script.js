console.log("🔥 TIENDA CARGADA");

const API_URL = "https://basketteniss-api.onrender.com";

let productos = [];
let cart = [];
let productoSeleccionado = null;

async function cargarProductos() {
  const res = await fetch(`${API_URL}/productos`);
  productos = await res.json();

  console.log("PRODUCTOS CARGADOS:", productos);
}

function mostrarProductos(lista) {
  const seccion = document.getElementById("productos");
  const grid = document.getElementById("grid-productos");

  seccion.style.display = "block";
  grid.innerHTML = "";

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

  seccion.scrollIntoView({ behavior: "smooth" });
}

function filtrarMarca(marca) {
  const filtrados = productos.filter(
    p => p.marca && p.marca.trim().toLowerCase() === marca.trim().toLowerCase()
  );

  mostrarProductos(filtrados);
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
  if (id === "productos") {
    mostrarProductos(productos);
    return;
  }

  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function abrirProducto(id) {
  productoSeleccionado = productos.find(p => p.id === id);

  if (!productoSeleccionado) return;

  document.getElementById("popup-img").src = productoSeleccionado.imagen;
  document.getElementById("popup-nombre").textContent = productoSeleccionado.nombre;
  document.getElementById("popup-marca").textContent = productoSeleccionado.marca;
  document.getElementById("popup-precio").textContent = "RD$ " + productoSeleccionado.precio;

  document.getElementById("popup-add-btn").onclick = function () {
    addCart(productoSeleccionado.id);
    cerrarProducto();
  };

  document.getElementById("product-popup").classList.add("open");
}

function cerrarProducto() {
  document.getElementById("product-popup").classList.remove("open");
}

function addCart(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existe = cart.find(item => item.id === id);

  if (existe) {
    existe.qty++;
  } else {
    cart.push({ ...producto, qty: 1 });
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
    <div class="cart-item">
      <strong>${item.nombre}</strong>
      <p>${item.marca}</p>
      <p>RD$ ${item.precio} x ${item.qty}</p>
      <button onclick="removeCart(${item.id})">Quitar</button>
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
  const msg = "Hola, quiero hacer un pedido en BasketTeniss.";
  window.open(`https://wa.me/18494250473?text=${encodeURIComponent(msg)}`, "_blank");
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
});
