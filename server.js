const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: "https://basketteniss.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "admin-user", "admin-pass"]
}));

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



function verificarAdmin(req, res, next) {
  const user = String(req.headers["admin-user"] || "").trim();
  const pass = String(req.headers["admin-pass"] || "").trim();

  if (user === "brandy" && pass === "BasketTeniss2026*") {
    return next();
  }

  return res.status(401).json({ error: "No autorizado" });
}

// ==========================
// POST (CON IMAGEN + DATOS)
// ==========================
app.post("/productos", verificarAdmin, upload.single("imagen"), (req, res) => {
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
    imagen: req.file
      ? `https://basketteniss-api.onrender.com/uploads/${req.file.filename}`
      : ""
  };

  productos.push(nuevo);
  guardarProductos(productos);

  res.json(nuevo);
});


app.put("/productos/:id", verificarAdmin, upload.single("imagen"), (req, res) => {
  const id = Number(req.params.id);
  const { nombre, marca, precio, categoria, descripcion, tipo } = req.body;

  const productos = leerProductos();
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  productos[index] = {
    ...productos[index],
    nombre,
    marca,
    precio,
    categoria,
    tipo,
    descripcion: descripcion || "",
    imagen: req.file
      ? `https://basketteniss-api.onrender.com/uploads/${req.file.filename}`
      : productos[index].imagen
  };

  guardarProductos(productos);

  res.json(productos[index]);
});

// ==========================
// DELETE (BIEN HECHO)
// ==========================
app.delete("/productos/:id", verificarAdmin, (req, res) => {
  const id = Number(req.params.id);

  const productos = leerProductos().filter(p => p.id !== id);

  guardarProductos(productos);

  res.json({ mensaje: "Producto eliminado" });
});

// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor listo en puerto " + PORT);
});


