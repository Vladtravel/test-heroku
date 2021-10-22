const Contact = require("../model/schemas/contact");

const listContacts = async (userId, { sortBy, sortByDesc, filter, limit = 10, page = 1, favorite }) => {
  const result = await Contact.paginate(
    { owner: userId },
    {
      limit,
      page,
      sort: {
        ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
        ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
      },
      select: filter ? filter.split("|").join(" ") : "",
      populate: { path: "owner", select: "subscription email " },
    }
  );
  if (favorite) {
    const findFavorite = await Contact.find({ favorite }).populate({
      path: "owner",
      select: "subscription email ",
    });
    return { docs: findFavorite };
  }
  return result;
};

const getContactById = async (contactId, userId) => {
  const result = await Contact.findOne({
    _id: contactId,
    owner: userId,
  }).populate({
    path: "owner",
    select: "name email subscription -_id",
  });

  return result;
};

const removeContact = async (contactId, userId) => {
  const result = await Contact.findByIdAndRemove({
    _id: contactId,
    owner: userId,
  });
  return result;
};

const addContact = async (body, userId) => {
  const result = await Contact.create({ ...body, owner: userId });
  return result;
};

const updateContact = async (contactId, body, userId) => {
  const result = await Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true }
  );
  return result;
};

const updateStatusContact = async (userId, contactId, favorite) => {
  const result = await Contact.findByIdAndUpdate({ _id: contactId, owner: userId }, { favorite });
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};

