const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const filePath = path.join(__dirname, 'products.json');

const readProducts = () => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
};

const writeProducts = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.get('/products', (req, res) => {
  res.json(readProducts());
});

app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }
  const products = readProducts();
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name, price, inStock
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const products = readProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const { name, price, inStock } = req.body;
  if (name !== undefined) products[idx].name = name;
  if (price !== undefined) products[idx].price = price;
  if (inStock !== undefined) products[idx].inStock = inStock;
  writeProducts(products);
  res.json(products[idx]);
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const products = readProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const removed = products.splice(idx, 1);
  writeProducts(products);
  res.json({ message: `Product ${removed[0].name} deleted successfully` });
});

app.get('/products/instock', (req, res) => {
  res.json(readProducts().filter(p => p.inStock === true));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

