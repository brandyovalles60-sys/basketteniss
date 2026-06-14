console.log("🔥 TIENDA CARGADA");

const API_URL = "https://basketteniss-api.onrender.com";

let productos = [];
let cart = [];
let productoSeleccionado = null;
let tallaSeleccionada = "";
let cantidadSeleccionada = 1;

async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);

    if (!res.ok) {
      throw new Error("No se pudieron cargar productos");
    }

    productos = await res.json();

    console.log("PRODUCTOS CARGADOS:", productos);

  } catch (error) {
    console.error("ERROR CARGANDO PRODUCTOS:", error);
    productos = [];
  }
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

async function scrollToSection(id) {
  const seccion = document.getElementById(id);

  if (!seccion) return;

  if (id === "productos") {
    if (!productos || productos.length === 0) {
      await cargarProductos();
    }

    mostrarProductos(productos);
  }

  seccion.scrollIntoView({
    behavior: "smooth"
  });
}

function abrirProducto(id) {
  
  productoSeleccionado = productos.find(p => p.id === id);
  tallaSeleccionada = "";

  cantidadSeleccionada = 1;

  document.getElementById("popup-cantidad").textContent = "1";

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

    addCart(productoSeleccionado.id, tallaSeleccionada, cantidadSeleccionada);
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

function addCart(id, talla, cantidad) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existe = cart.find(item => item.id === id && item.talla === talla);

  if (existe) {
    existe.qty += cantidad;
  } else {
    cart.push({
      ...producto,
      talla,
      qty: cantidad
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

  let totalPedido = cart.reduce((acc, item) => {
    return acc + Number(item.precio) * item.qty;
  }, 0);

  let msg = `🏀 *BASKETTENISS*
━━━━━━━━━━━━━━

Hola, me interesa el siguiente pedido:

`;

  cart.forEach((item, index) => {
    const subtotal = Number(item.precio) * item.qty;

    msg += `📦 *Producto ${index + 1}*
`;

    msg += `🔹 Modelo: ${item.nombre}
`;
    msg += `🔹 Marca: ${item.marca}
`;
    msg += `🔹 Talla: ${item.talla}
`;
    msg += `🔹 Cantidad: ${item.qty}
`;
    msg += `🔹 Precio: RD$ ${Number(item.precio).toLocaleString()}
`;
    msg += `🔹 Subtotal: RD$ ${subtotal.toLocaleString()}

`;

    if (item.imagen) {
      msg += `🖼️ Imagen:
${item.imagen}

`;
    }
  });

  msg += `━━━━━━━━━━━━━━

💰 *TOTAL ESTIMADO: RD$ ${totalPedido.toLocaleString()}*

¿Está disponible?

Muchas gracias.`;

  window.open(
    `https://wa.me/18494250473?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}


function cambiarCantidad(valor) {
  cantidadSeleccionada += valor;

  if (cantidadSeleccionada < 1) {
    cantidadSeleccionada = 1;
  }

  document.getElementById("popup-cantidad").textContent =
    cantidadSeleccionada;
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
});