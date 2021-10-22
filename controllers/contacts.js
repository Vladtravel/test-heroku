const Contacts = require("../repository/contacts");
const { HttpCode } = require("../service/constants");

const listContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { docs: contacts, totalDocs: total, page, limit } = await Contacts.listContacts(userId, req.query);
    return res.status(HttpCode.OK).json({
      status: "Success",
      code: HttpCode.OK,
      data: { contacts, limit, page, total },
    });
  } catch (e) {
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.getContactById(req.params.contactId, userId);

    if (contact) {
      return res.json({
        status: "Success",
        code: HttpCode.OK,
        data: {
          contact,
        },
      });
    } else {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: "Error",
        code: HttpCode.BAD_REQUEST,
        message: "Not found",
      });
    }
  } catch (e) {
    next(e);
  }
};

const addContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.addContact(req.body, userId);

    return res.status(HttpCode.CREATED).json({
      status: "Success",
      code: HttpCode.CREATED,
      message: "New contact has been added",
      data: {
        contact,
      },
    });
  } catch (e) {
    next(e);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.removeContact(req.params.contactId, userId);

    if (contact) {
      return res.json({
        status: "Success",
        code: HttpCode.OK,
        message: "Contact has been deleted",
        data: {
          contact,
        },
      });
    } else {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: "Error",
        code: HttpCode.BAD_REQUEST,
        message: "Not found",
      });
    }
  } catch (e) {
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.updateContact(req.params.contactId, req.body, userId);

    if (contact) {
      return res.json({
        status: "Success",
        code: HttpCode.OK,
        message: "Contact has been updated",
        data: {
          contact,
        },
      });
    } else {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: "Error",
        code: HttpCode.BAD_REQUEST,
        message: "Not found",
      });
    }
  } catch (e) {
    next(e);
  }
};

const updateStatusContact = async (req, res, next) => {
  const { favorite } = req.body;
  const { contactId } = req.params;
  const userId = req.user.id;
  try {
    const contact = await Contacts.updateStatusContact(userId, contactId, favorite);

    if (contact) {
      return res.json({
        status: "Success",
        code: HttpCode.OK,
        message: "Contact favorite has been updated",
        data: {
          contact,
        },
      });
    } else {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: "Error",
        code: HttpCode.BAD_REQUEST,
        message: "missing field favorite",
      });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};
