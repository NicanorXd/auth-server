'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddObjectTypeNotificationSchema extends Schema {
  up () {
    this.table('notifications', (table) => {
      table.string('object_type');
    })
  }

  down () {
    this.table('notifications', (table) => {
      table.dropColumn('object_type')
    })
  }
}

module.exports = AddObjectTypeNotificationSchema
