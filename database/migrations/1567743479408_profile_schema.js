'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PerfilSchema extends Schema {
  up () {
    this.create('profiles', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.integer('system_id').unsigned()
      table.integer('module_id').unsigned()
      table.integer('method_id').unsigned()
      table.text('observation')
      table.timestamps()
    })
  }

  down () {
    this.drop('profiles')
  }
}

module.exports = PerfilSchema
