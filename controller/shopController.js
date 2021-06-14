const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/products', {
        pageTitle: 'Products',
        path: '/products',
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const id = req.params.productId;
  Product.findByPk(id)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCarts = (req, res, next) => {
  req.user
    .getCart()
    .then((carts) => {
      carts
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            pageTitle: 'Cart',
            path: '/cart',
            prods: products,
            // total: total.toFixed(2),
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  let newQuantity = 1;
  let fetchedCart;
  return req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = parseInt(oldQuantity) + 1;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: {
          title: product.title,
          imageUrl: product.imageUrl,
          price: parseFloat(product.price) * parseFloat(newQuantity),
          description: product.description,
          quantity: newQuantity,
        },
      });
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.cartId;
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts({ where: { id: prodId } })
        .then((products) => {
          const product = products[0];
          return product.cartItem.destroy();
        })
        .then((result) => {
          res.redirect('/cart');
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrderItem = (req, res, next) => {
  res.render("shop/order", {
    pageTitle: 'Order',
    path: '/order',
  });
}

exports.postOrderItem = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProduct(
            products.map(product => {
              product.orderItem = {
                title: product.cartItem.title,
                imageUrl: product.cartItem.imageUrl,
                price: product.cartItem.price,
                description: product.cartItem.description,
                quantity: product.cartItem.quantity
              };
              return product;
            })
          )
        })
        .then((result) => {
          return fetchedCart.setProducts(null);
        })
        .catch(err => {
          console.log(err);
        })
    })
    .then((result) => {
      res.redirect("/order");
    })
    .catch((err) => {
      console.log(err);
    });
};
