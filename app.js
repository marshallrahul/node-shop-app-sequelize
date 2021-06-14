const path = require('path');

const express = require('express');

const app = express();

const PORT = 8080;

const sequelize = require('./utils/database');

const adminRouter = require('./router/adminRouter');
const shopRouter = require('./router/shopRouter');
const errorController = require('./controller/errorController');

// Models
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      // console.log(user);
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(errorController.get404page);

// SQL Association
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
// Product.belongsToMany(Cart, {through: CartItem});
Cart.belongsToMany(Product, {through: CartItem});     //* cart.getProducts is not a function without this relation
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({force: true})
  .sync()
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({name: 'marshall', email: 'test@test.com'});
    }
    return user;
  })
  .then((user) => {
    user.createCart();
    return user.createOrder();
  })
  .then((result) => {
    app.listen(PORT, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is listening on PORT', PORT);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
