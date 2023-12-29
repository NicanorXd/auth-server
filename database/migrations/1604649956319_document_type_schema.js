'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DocumentTypeSchema extends Schema {
  up () {
    this.create('document_types', (table) => {
      table.increments()
      table.string('code').notNullable().unique();
      table.string('name').notNullable();
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('document_types')
  }
}

module.exports = DocumentTypeSchema
