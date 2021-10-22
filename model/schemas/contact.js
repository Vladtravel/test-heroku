const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema, model, SchemaTypes } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate(value) {
        const reg = /\S+@\S+\.\S+/;
        return reg.test(String(value).toLowerCase());
      },
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

contactSchema
  .plugin(mongoosePaginate)
  .virtual("status")
  .get(function () {
    if (this.favorite) {
      return "favorite contact";
    }

    return "not favorite contact";
  });
const Contact = model("contact", contactSchema);

module.exports = Contact;
