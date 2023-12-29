'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigEntitySchema extends Schema {
  up () {
    this.create('config_entities', (table) => {
      table.increments()
      table.integer('entity_id');
      table.integer('user_id');
      table.timestamps()
    })
  }

  down () {
    this.drop('config_entities')
  }
}

module.exports = ConfigEntitySchema
