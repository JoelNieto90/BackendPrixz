const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  name: String,
  passwordHash: String,
  direction: String,
  city: String,
  country: String,
  phone: String,
  email: {
    type: String,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  photo: String,
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash;
  }
})

userSchema.plugin(uniqueValidator)

const User = model('User', userSchema)

module.exports = User
