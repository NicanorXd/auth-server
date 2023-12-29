'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CodeAuthorizationSchema extends Schema {
  up () {
    this.create('code_authorizations', (table) => {
      table.increments()
      table.string('code').notNullable();
      table.string('description').notNullable();
      table.timestamp('expiration_at').notNullable();
      table.boolean('is_revoked').defaultTo(false);
      table.boolean('is_authorize').defaultTo(false);
      table.integer('person_id').notNullable();
      table.integer('token_id').notNullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('code_authorizations')
  }
}

module.exports = CodeAuthorizationSchema
