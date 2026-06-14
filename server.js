const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const app = express();


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);




app.use(cors({
  origin: [
    "https://basketteniss.netlify.app",
    "https://basketteniss-api.onrender.com"
  ],
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
app.get("/productos", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
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
// ==========================
// POST GUARDAR PRODUCTO EN SUPABASE
// ==========================
app.post("/productos", verificarAdmin, upload.single("imagen"), async (req, res) => {
  try {
    console.log("🔥 SERVER RECIBIÓ PETICIÓN SUPABASE");
    console.log(req.body);
    console.log(req.file);

    const { nombre, marca, precio, categoria, descripcion, tipo, tallas } = req.body;

    if (!nombre || !marca || !precio || !categoria || !tipo) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const nuevo = {
      nombre,
      marca,
      precio,
      categoria,
      tipo,
      tallas: tallas || "",
      descripcion: descripcion || "",
      imagen: req.file
        ? `https://basketteniss-api.onrender.com/uploads/${req.file.filename}`
        : ""
    };

    const { data, error } = await supabase
      .from("productos")
      .insert([nuevo])
      .select()
      .single();

    if (error) {
      console.log("❌ ERROR SUPABASE:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    console.log("❌ ERROR SERVER:", error);
    res.status(500).json({ error: error.message });
  }
});


// ==========================
// PUT EDITAR PRODUCTO EN SUPABASE
// ==========================
app.put("/productos/:id", verificarAdmin, upload.single("imagen"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, marca, precio, categoria, descripcion, tipo, tallas } = req.body;

    const actualizado = {
      nombre,
      marca,
      precio,
      categoria,
      tipo,
      tallas: tallas || "",
      descripcion: descripcion || ""
    };

    if (req.file) {
      actualizado.imagen = `https://basketteniss-api.onrender.com/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from("productos")
      .update(actualizado)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================
// DELETE (BIEN HECHO)
// ==========================
// ==========================
// DELETE BORRAR PRODUCTO EN SUPABASE
// ==========================
app.delete("/productos/:id", verificarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ mensaje: "Producto eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor listo en puerto " + PORT);
});


