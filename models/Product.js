const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  productName: String,
  price: String,
  instructions: String,
  description: String,
  photo: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

productSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Product = model("Product", productSchema);

module.exports = Product;
