'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SedeSchema extends Schema {
  up () {
    this.create('sedes', (table) => {
      table.increments()
      table.string('descripcion').unique()
      table.string('direccion')
      table.timestamps()
    })
  }

  down () {
    this.drop('sedes')
  }
}

module.exports = SedeSchema
