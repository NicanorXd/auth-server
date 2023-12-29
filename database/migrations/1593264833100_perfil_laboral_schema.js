'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PerfilLaboralSchema extends Schema {
  up () {
    this.create('perfil_laborals', (table) => {
      table.increments()
      table.string('slug').unique();
      table.string('nombre').notNullable();
      table.string('descripcion');
      table.string('icon');
      table.string('image');
      table.boolean('estado').defaultTo(1);
      table.timestamps()
    })
  }

  down () {
    this.drop('perfil_laborals')
  }
}

module.exports = PerfilLaboralSchema
