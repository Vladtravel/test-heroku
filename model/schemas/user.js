const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const SALT_FACTOR = 6;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: ["true", "This fild is required"],
    },
    email: {
      type: String,
      required: ["true", "This fild is required"],
      unique: true,
      validate(value) {
        const reg = /\S+@\S+\.\S+/;
        return reg.test(String(value).toLowerCase());
      },
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },

    token: {
      type: String,
      default: null,
    },

    avatarURL: {
      type: String,
      default: function () {
        return gravatar.url(this.email, { s: "250" }, true);
      },
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

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(String(password), this.password);
};

const User = model("user", userSchema);

module.exports = User;

