console.log("🔥 TIENDA CARGADA");

let productos = [];

const API_URL = "https://basketteniss-api.onrender.com";

async function cargarProductos() {
  const res = await fetch(`${API_URL}/productos`);
  productos = await res.json();

  renderProductos(productos);
}

function filtrarMarca(marca) {
  const filtrados = productos.filter(
    p => p.marca.toLowerCase() === marca.toLowerCase()
  );

  renderProductos(filtrados);
}

function renderProductos(lista) {
  const grid = document.getElementById("grid-productos");

  grid.innerHTML = "";

  lista.forEach(p => {
    grid.innerHTML += `
      <div class="card">
        <div class="card-img">
          <img src="${p.imagen}">
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
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
}

cargarProductos();
