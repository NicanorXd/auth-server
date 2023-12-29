'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMethodsSchema extends Schema {
  up () {
    this.table('methods', (table) => {
      table.string('image').default('find_file_public?path=img/notification.png');
    })
  }

  down () {
    this.table('methods', (table) => {
      table.dropColumn('image');
    })
  }
}

module.exports = AlterMethodsSchema
