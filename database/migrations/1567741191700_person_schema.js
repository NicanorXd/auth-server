'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PersonaSchema extends Schema {
  up () {
    this.create('people', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('ape_pat').notNullable()
      table.string('ape_mat').notNullable()
      table.string('profession', 50).notNullable()
      table.string('fullname').notNullable()
      table.enu('document_type', ['01', '04', '07', '09']).defaultTo('01');
      table.string('document_number').notNullable().unique()
      table.string('date_of_birth', 40).notNullable()
      table.enu('gender', ['M', 'F', 'I']).defaultTo('M')
      table.string("address")
      table.string('phone')
      table.string('badge_id').notNullable().comment('relación con el ubigeo')
      table.enu('marital_status', ['S', 'C', 'D', 'V', 'O']).default('S');
      table.string('email_contact');
      table.string('image');
      table.boolean("state").defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('people')
  }
}

module.exports = PersonaSchema
