exports.createProduct = async (req, res) => {

    const image = req.file ? req.file.filename : "";
    
    const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.categoryId,
    stock: req.body.stock,
    status: req.body.status,
    image: image,
    });
    
    await product.save();
    
    res.json(product);
    
    };