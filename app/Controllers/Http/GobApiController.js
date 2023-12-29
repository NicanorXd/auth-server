'use strict'
const Person = use('App/Models/Person');
const Env = use('Env');
const { searchDni } = require('json-essalud');
let axios = require('axios');
  

class GobApiController {

    syncDataReniec = async ({ params }) => {
        try {
            let payload = {};
            let person = await Person.query()
                .where('document_type', '01')
                .where('id', params.id)
                .first();
            // path
            let url = await Env.get('API_RENIEC_HOST');
            // obtener datos de reniec
            await axios.get(`${url}/${parson.document_number}`)
            .then(({ data }) => payload = {
                ape_pat: data.result.paterno,
                ape_mat: data.result.materno,
                name: data.result.nombre,
                date_of_birth: data.result.nacimiento_parse,
                gender: data.result.sexo ? 'M' : 'F'
            });
            // actualizar datos
            await Person.query()
                .where('id', person.id)
                .update(payload);
            // response
            return {
                success: true,
                message: "Los datos se actualizarón correctamente!"
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    essalud = async ({ params }) => {
        try {
            let datos = await searchDni(params.dni);
            return datos;
        } catch (error) {
            return {
                success: false,
                message: 'Error de conexión',
                data: {}
            }
        }
    }

}

module.exports = GobApiController
