'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IntitutionSchema extends Schema {
  up () {
    this.create('intitutions', (table) => {
      table.increments()
      table.string('code').notNullable().unique();
      table.string('name').notNullable();
      table.string('badge_id').notNullable().comment('relación con el ubigeo');
      table.string('address');
      table.boolean('is_private').defaultTo(false);
      table.enum('type', ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'SUPERIOR', 'EMPRESA', 'OTROS']).default();
      table.string('image');
      table.boolean('state').defaultTo(true);
      table.timestamps();
    })
  }

  down () {
    this.drop('intitutions')
  }
}

module.exports = IntitutionSchema
