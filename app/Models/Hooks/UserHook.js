'use strict'

const Encrypt = use('Encryption');
const { LINK_PUBLIC } = require('../../../utils');

const UserHook = exports = module.exports = {}

UserHook.hashPassword = async (user) => {
  if (user.dirty.password) {
    user.password = await Encrypt.encrypt(user.password);
  }
};


UserHook.imageDefault = async (user) => {
  user.image = user.image || LINK_PUBLIC(`img/base.png`);
};