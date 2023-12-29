'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddMethodIdNotificationSchema extends Schema {
  up () {
    this.table('notifications', (table) => {
      // alter table
      table.dropColumn('image');
      table.dropColumn('actions');
      table.integer('method_id').notNullable();
      table.integer('object_id').notNullable();
    })
  }

  down () {
    this.table('notifications', (table) => {
      // reverse alternations
      table.string('image');
      table.json('actions');
      table.dropColumn('method_id');
      table.dropColumn('object_id');
    })
  }
}

module.exports = AddMethodIdNotificationSchema
