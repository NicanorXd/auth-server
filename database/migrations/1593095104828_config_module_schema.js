'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigModuleSchema extends Schema {
  up () {
    this.create('config_modules', (table) => {
      table.increments()
      table.string('slug')
      table.string('icon')
      table.integer('module_id')
      table.integer('app_id')
      table.unique(['module_id', 'app_id'])
      table.timestamps()
    })
  }

  down () {
    this.drop('config_modules')
  }
}

module.exports = ConfigModuleSchema
