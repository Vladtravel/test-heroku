const express = require("express");
const router = express.Router();

const { validateContact, validateFavorite } = require("../../validation/validation");
const contactsController = require("../../controllers/contacts");
const guard = require("../../service/guard");

router.get("/", guard, contactsController.listContacts);
// .post("/", guard, validateContact, contactsController.addContact);

router
  .get("/:contactId", guard, contactsController.getContactById)
  .delete("/:contactId", guard, contactsController.removeContact)
  .patch("/:contactId", guard, validateContact, contactsController.updateContact)
  .patch("/:contactId/favorite", guard, validateFavorite, contactsController.updateStatusContact);

module.exports = router;
