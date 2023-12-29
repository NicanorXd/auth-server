'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BlockMethodAppSchema extends Schema {
  up () {
    this.create('block_method_apps', (table) => {
      table.increments()
      table.integer('method_id');
      table.integer('app_id');
      table.timestamps()
    })
  }

  down () {
    this.drop('block_method_apps')
  }
}

module.exports = BlockMethodAppSchema
