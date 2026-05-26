const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/productos.json");

// Leer productos
function leerProductos() {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// Guardar productos
function guardarProductos(productos) {
  fs.writeFileSync(filePath, JSON.stringify(productos, null, 2));
}

// ==========================
// GET
exports.getProductos = (req, res) => {
  try {
    const productos = leerProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al leer productos" });
  }
};

// ==========================
// POST
exports.addProducto = (req, res) => {
  try {
    const productos = leerProductos();

    const nuevo = {
      id: Date.now(), // ID único
      nombre: req.body.nombre,
      marca: req.body.marca,
      imagen: req.body.imagen
    };

    productos.push(nuevo);
    guardarProductos(productos);

    res.json(nuevo);

  } catch (error) {
    res.status(500).json({ error: "Error al guardar producto" });
  }
};

// ==========================
// DELETE
exports.deleteProducto = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let productos = leerProductos();

    productos = productos.filter(p => p.id !== id);

    guardarProductos(productos);

    res.json({ mensaje: "Producto eliminado" });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};