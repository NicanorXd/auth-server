'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DependenciaSchema extends Schema {
  up () {
    this.create('dependencias', (table) => {
      table.increments()
      table.string("nombre").unique();
      table.string("descripcion");
      table.string('ubicacion');
      table.enum('type', ['OTRO', 'ESCUELA', 'FACULTAD', 'OFICINA']).defaultTo('OTRO');
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('dependencias')
  }
}

module.exports = DependenciaSchema
