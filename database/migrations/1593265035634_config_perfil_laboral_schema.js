'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigPerfilLaboralSchema extends Schema {
  up () {
    this.create('config_perfil_laborals', (table) => {
      table.increments()
      table.bigInteger('perfil_laboral_id').notNullable();
      table.bigInteger('dependencia_id').notNullable();
      table.string('observacion');
      table.string('file');
      table.timestamps()
    })
  }

  down () {
    this.drop('config_perfil_laborals')
  }
}

module.exports = ConfigPerfilLaboralSchema
