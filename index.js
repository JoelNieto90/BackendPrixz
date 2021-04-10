require("dotenv").config();
require("./mongo");

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./models/User");
const Product = require("./models/Product");

const notFound = require("./middleware/notFound.js");
const handleErrors = require("./middleware/handleErrors.js");
const userExtractor = require("./middleware/userExtractor");

const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

app.use(cors());
app.use(express.json());

Sentry.init({
  dsn:
    "https://ac034ebd99274911a8234148642e044c@o537348.ingest.sentry.io/5655435",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.get("/", (request, response) => {
  console.log(request.ip);
  console.log(request.ips);
  console.log(request.originalUrl);
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/products", async (request, response) => {
  const products = await Product.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(products);
});

app.get("/api/products/:id", (request, response, next) => {
  const { id } = request.params;

  Product.findById(id)
    .then((product) => {
      if (product) return response.json(product);
      response.status(404).end();
    })
    .catch((err) => next(err));
});

app.put("/api/products/:id", userExtractor, (request, response, next) => {
  const { id } = request.params;
  const product = request.body;

  const newProductInfo = {
    productName: product.productName,
    price: product.price,
    instructions: product.instructions,
    description: product.description,
    photo: product.photo,
  };

  Product.findByIdAndUpdate(id, newProductInfo, { new: true })
    .then((result) => {
      response.json(result);
    })
    .catch(next);
});

app.delete(
  "/api/products/:id",
  userExtractor,
  async (request, response, next) => {
    const { id } = request.params;

    const res = await Product.findByIdAndDelete(id);
    if (res === null) return response.sendStatus(404);

    response.status(204).end();
  }
);

app.post("/api/products", userExtractor, async (request, response, next) => {
  const { productName, price, instructions, description, photo } = request.body;

  // sacar userId de request
  const { userId } = request;

  const user = await User.findById(userId);

  if (!productName) {
    return response.status(400).json({
      error: 'required "content" field is missing',
    });
  }

  const newProduct = new Product({
    productName,
    price,
    instructions,
    description,
    photo,
    user: user._id,
  });

  try {
    const savedProduct = await newProduct.save();

    user.products = user.products.concat(savedProduct._id);
    await user.save();

    response.json(savedProduct);
  } catch (error) {
    next(error);
  }
});

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(notFound);

app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
