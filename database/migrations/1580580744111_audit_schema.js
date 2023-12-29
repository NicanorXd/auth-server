'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AuditSchema extends Schema {
  up () {
    this.create('audits', (table) => {
      table.increments()
      table.integer('token_id').notNullable();
      table.integer('method_id').notNullable();
      table.string('ip');
      table.string('observation');
      table.string('table');
      table.text('dirty');
      table.text('obj');
      table.enum('action_type', ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'OTRO']).comment('describir el tipo de accion que realiza el sistema');
      table.timestamps()
    })
  }

  down () {
    this.drop('audits')
  }
}

module.exports = AuditSchema
