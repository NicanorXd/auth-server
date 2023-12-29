'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MetodoSchema extends Schema {
  up () {
    this.create('methods', (table) => {
      table.increments()
      table.string("name").unique()
      table.string("description").nullable()
      table.integer("system_id").unsigned()
      table.string("url");
      table.enum('action_type', ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'OTRO']).comment('describir el tipo de accion que realiza el metodo');
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('methods')
  }
}

module.exports = MetodoSchema
