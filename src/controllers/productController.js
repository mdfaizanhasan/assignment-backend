const db = require('../config/database');

const getAllProducts = (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(products);
  });
};

const getProductById = (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
};

const createProduct = (req, res) => {
  const { name, description, price, category, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, category, image_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating product' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        description,
        price,
        category,
        image_url
      });
    }
  );
};

const updateProduct = (req, res) => {
  const { name, description, price, category, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?',
    [name, description, price, category, image_url, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({
        id: req.params.id,
        name,
        description,
        price,
        category,
        image_url
      });
    }
  );
};

const deleteProduct = (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};