'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeSchema extends Schema {
  up () {
    this.create('badges', (table) => {
      table.increments()
      table.string('cod_ubi');
      table.string('cod_dep');
      table.string('departamento');
      table.string('cod_pro');
      table.string('provincia');
      table.string('cod_dis');
      table.string('distrito');
      table.timestamps()
    })
  }

  down () {
    this.drop('badges')
  }
}

module.exports = BadgeSchema
