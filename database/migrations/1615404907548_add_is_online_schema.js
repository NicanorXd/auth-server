'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddIsOnlineSchema extends Schema {
  up () {
    this.table('tokens', (table) => {
      table.boolean('is_online').defaultTo(false);
    })
  }

  down () {
    this.table('tokens', (table) => {
      table.dropColumn('is_online');
    })
  }
}

module.exports = AddIsOnlineSchema
