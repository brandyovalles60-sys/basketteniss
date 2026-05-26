const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json());

// ==========================
// 📁 SERVIR FRONTEND
// ==========================
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// 📤 CONFIGURAR MULTER (ANTES DE USAR)
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// servir imágenes subidas
app.use("/uploads", express.static("uploads"));

// ==========================
// 📂 ARCHIVO JSON
// ==========================
const FILE = path.join(__dirname, "data", "productos.json");

function leerProductos() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8") || "[]");
  } catch {
    return [];
  }
}

function guardarProductos(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ==========================
// GET
// ==========================
app.get("/productos", (req, res) => {
  res.json(leerProductos());
});

// ==========================
// POST (CON IMAGEN + DATOS)
// ==========================
app.post("/productos", upload.single("imagen"), (req, res) => {
  console.log("🔥 SERVER RECIBIÓ PETICIÓN");
  console.log(req.body);
  console.log(req.file);
  const { nombre, marca, precio, categoria, descripcion, tipo } = req.body;

  if (!nombre || !marca || !precio || !categoria || !tipo) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const productos = leerProductos();

  const nuevo = {
    id: Date.now(),
    nombre,
    marca,
    precio,
    categoria,
    tipo,
    descripcion: descripcion || "",
    imagen: req.file ? `/uploads/${req.file.filename}` : ""
  };

  productos.push(nuevo);
  guardarProductos(productos);

  res.json(nuevo);
});

// ==========================
// DELETE (BIEN HECHO)
// ==========================
app.delete("/productos/:id", (req, res) => {
  const id = Number(req.params.id);

  const productos = leerProductos().filter(p => p.id !== id);

  guardarProductos(productos);

  res.json({ mensaje: "Producto eliminado" });
});

// ==========================
app.listen(3000, () => {
  console.log("Servidor listo en puerto 3000");
});

