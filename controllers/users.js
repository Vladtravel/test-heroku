const jwt = require("jsonwebtoken");
const Users = require("../repository/users");
const { HttpCode } = require("../service/constants");
const jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { promisify } = require("util");
const cloudinary = require("cloudinary").v2;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});

const ff = async (req, res, next) => {
  try {
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        user: {
          massage: "ПРИВЕТТТТТТТТТТТ",
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const uploadToCloud = promisify(cloudinary.uploader.upload);

const signup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findByEmail(email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "conflict",
        code: HttpCode.CONFLICT,
        message: "Email in use",
      });
    }

    const newUser = await Users.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    const isValidPassword = await user.validPassword(password);

    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "Error",
        code: HttpCode.UNAUTHORIZED,
        message: "Email or password is wrong",
      });
    }
    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "4h" });
    await Users.updateToken(id, token);
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    if (e.name === "TypeError") {
      return next({
        status: HttpCode.BAD_REQUEST,
        message: "Bad request",
      });
    }
    next(e);
  }
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({});
};

const currentUser = async (req, res, next) => {
  const id = req.user.id;
  try {
    const user = await Users.findById(id);

    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const updateSub = async (req, res, next) => {
  const id = req.user.id;
  try {
    await Users.updateSubUser(id, req.body.subscription);
    const user = await Users.findById(id);
    return res.json({
      status: "success",
      code: HttpCode.OK,
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    if (e.name === "CastError") {
      return next({
        status: HttpCode.NOT_FOUND,
        message: "Not Found",
      });
    }
    next(e);
  }
};

const updateAvatar = async (req, res, next) => {
  const { id } = req.user;

  const { idCloudAvatar, avatarUrl } = await saveAvatarUserToCloud(req);

  await Users.updateAvatar(id, avatarUrl, idCloudAvatar);
  return res.status(HttpCode.OK).json({
    status: HttpCode.OK,
    ContentType: res.ContentType,
    ResponseBody: {
      avatarUrl,
    },
  });
};

// const saveAvatarUser = async (req) => {
//   const FOLDER_AVATARS = process.env.FOLDER_AVATARS;
//   const pathFile = req.file.path;
//   const newNameAvatar = `${Date.now().toString()}-${req.file.originalname}`;
//   const img = await jimp.read(pathFile);
//   await img
//     .autocrop()
//     .cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
//     .writeAsync(pathFile);
//   try {
//     await fs.rename(pathFile, path.join(process.cwd(), "public", FOLDER_AVATARS, newNameAvatar));
//   } catch (e) {
//     console.log(e.message);
//   }

//   const oldAvatar = req.user.avatarURL;
//   console.log("oldAvatar", oldAvatar);
//   if (oldAvatar.includes(`${FOLDER_AVATARS}/`)) {
//     await fs.unlink(path.join(process.cwd(), "public", oldAvatar));
//   }

//   return path.join(FOLDER_AVATARS, newNameAvatar).replace("\\", "/");
// };

const saveAvatarUserToCloud = async (req) => {
  const pathFile = req.file.path;
  const { public_id: idCloudAvatar, secure_url: avatarUrl } = await uploadToCloud(pathFile, {
    public_id: req.user.idCloudAvatar?.replace("Avatars/", ""),
    folder: "Avatars",
    transformation: { width: 250, height: 250, crop: "pad" },
  });
  await fs.unlink(pathFile);
  return { idCloudAvatar, avatarUrl };
};

module.exports = {
  signup,
  login,
  logout,
  currentUser,
  updateSub,
  updateAvatar,
  ff,
  // saveAvatarUser,
  // saveAvatarUserToCloud,
};
