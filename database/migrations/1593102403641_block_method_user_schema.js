'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BlockMethodUserSchema extends Schema {
  up () {
    this.create('block_method_users', (table) => {
      table.increments()
      table.integer('method_id')
      table.integer('user_id')
      table.timestamps()
    })
  }

  down () {
    this.drop('block_method_users')
  }
}

module.exports = BlockMethodUserSchema
