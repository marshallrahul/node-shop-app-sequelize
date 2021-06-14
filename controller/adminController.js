const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/add-product',
    editingMode: '',
    prod: '',
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    })
    .then((result) => {
      res.redirect('/admin/admin-product');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAdminProduct = (req, res, next) => {
  Product.findAll()
    .then((product) => {
      res.render('admin/admin-products', {
        pageTitle: 'Admin Product',
        path: '/admin-product',
        prods: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne({where: {id: prodId}})
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      res.redirect('/admin/admin-product');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const params = req.params.productId;
  const query = req.query.edit;
  Product.findByPk(params)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        prod: product,
        editingMode: query,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findOne({where: {id: prodId}})
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then((result) => {
      res.redirect('/admin/admin-product');
    })
    .catch((err) => {
      console.log(err);
    });
};
