'use strict'

const PersonHook = exports = module.exports = {}

PersonHook.toLowerCase = async (person) => {
    person.ape_pat = `${person.ape_pat}`.toLowerCase();
    person.ape_mat = `${person.ape_mat}`.toLowerCase();
    person.name = `${person.name}`.toLowerCase();
    person.profession = `${person.profession}`.toLowerCase();
    person.fullname = `${person.ape_pat} ${person.ape_mat} ${person.name}`;
}
