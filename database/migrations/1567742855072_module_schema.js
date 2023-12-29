'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ModuloSchema extends Schema {
  up () {
    this.create('modules', (table) => {
      table.increments()
      table.string('name').unique()
      table.string('alias').unique()
      table.integer('system_id').notNullable().unsigned()
      table.timestamps()
    })
  }

  down () {
    this.drop('modules')
  }
}

module.exports = ModuloSchema
