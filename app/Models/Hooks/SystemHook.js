'use strict'

const slugify = require('slugify');
const SystemHook = exports = module.exports = {}
const { LINK_PUBLIC } = require('../../../utils');

SystemHook.generarAlias = async (system) => {
    system.icon = system.icon || LINK_PUBLIC(`img/base.png`);
}
