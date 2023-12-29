'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigDependenciaUserSchema extends Schema {
  up () {
    this.create('config_entity_dependencias', (table) => {
      table.increments()
      table.integer('config_entity_id').notNullable();
      table.integer('dependencia_id').notNullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('config_entity_dependencias')
  }
}

module.exports = ConfigDependenciaUserSchema
