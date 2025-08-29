// src/controllers/productsController.js
import Products from "../models/products.js"; 

const productsController = {};

// GET /api/products
productsController.getProducts = async (_req, res) => {
  try {
    const products = await Products.find();
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error listando productos", error: err.message });
  }
};

// POST /api/products
productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body; 
    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: "name, price y stock son obligatorios" });
    }
    const newProduct = await Products.create({ name, description, price, stock });
    return res.status(201).json({ message: "product saved", data: newProduct });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error creando producto", error: err.message });
  }
};

// DELETE /api/products/:id
productsController.deleteProducts = async (req, res) => {
  try {
    const deletedProduct = await Products.findByIdAndDelete(req.params.id); 
    if (!deletedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    return res.json({ message: "product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error eliminando producto", error: err.message });
  }
};

// PUT /api/products/:id
productsController.updateProducts = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body; 

    // Actualización parcial: solo campos enviados
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (stock !== undefined) update.stock = stock;

    const updated = await Products.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true } 
    );

    if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
    return res.json({ message: "product updated", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error actualizando producto", error: err.message });
  }
};

// GET /api/products/:id
productsController.getSingleProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error obteniendo producto", error: err.message });
  }
};

export default productsController;
