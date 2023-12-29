'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMethodsSchema extends Schema {
  up () {
    this.table('methods', (table) => {
      table.dropUnique('name');
      table.unique(['name', 'system_id']);
    })
  }

  down () {
    this.table('methods', (table) => {
      table.dropUnique(['name', 'system_id']);
      table.unique(['name']);
    })
  }
}

module.exports = AlterMethodsSchema
