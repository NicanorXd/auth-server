'use strict'

const { validation, ValidatorError } = require('validator-error-adonis');
const Person = use('App/Models/Person');
const Badge = use('App/Models/Badge');
const Api = use('App/Models/Api');
const { LINK_PUBLIC } = require('../../../../utils');
const CustomException = require('../../../Exceptions/CustomException');

class PersonController {

    async store ({ request }) {
        await validation(null, request.all(), {
            document_type_id: "required|min:2|max:5",
            document_number: "required|min:8|max:15",
            name: "required|min:3|max:50",
            ape_pat: "required|min:3|max:100",
            ape_mat: "required|min:3|max:100",
            date_of_birth: "required|dateFormat:YYYY-MM-DD",
            gender: "required|min:1|max:3",
            cod_dep: "required|max:15",
            cod_pro: "required|max:15",
            cod_dis: "required|max:15",
            email_contact: "email|max:100",
            address: 'required|max:255',
            profession: 'required|max:5',
            marital_status: "required|max:1"
        })
        // payload
        let payload = {
            document_type_id: request.input('document_type_id'),
            document_number: request.input('document_number'),
            name: request.input('name'),
            ape_pat: request.input('ape_pat'),
            ape_mat: request.input('ape_mat'),
            date_of_birth: request.input('date_of_birth'),
            gender: request.input('gender'),
            address: request.input('address'),
            email_contact: request.input('email_contact'),
            phone: request.input('phone'),
            profession: request.input('profession'),
            marital_status: request.input('marital_status')
        }
        // validar si existe el usuario
        let person = await Person.query()
            .where('document_number', request.input('document_number'))
            .first();
        if (person) throw new ValidatorError([{ field: 'document_number', message: 'El numero ya está es uso' }])
        let badge = await Badge.query()
            .where('cod_dep', request.input('cod_dep'))
            .where('cod_pro', request.input('cod_pro'))
            .where('cod_dis', request.input('cod_dis'))
            .first();
        if (!badge) throw new ValidatorError([{
            field: 'cod_dep', message: 'El código es invalido',
            field: 'cod_pro', message: 'El código es invalido',
            field: 'cod_dis', message: 'El código es invalido'
        }])
        // obtener badge
        payload.badge_id = badge.cod_ubi;
        payload.image = LINK_PUBLIC(`img/${payload.gender == 'M' ? 'hombre' : 'mujer' }.jpg`);
        //procesamos
        try {
            // crear persona
            person = await Person.create(payload);
            // response
            return {
                success: true,
                code: "201",
                message: "Los datos se guardarón correctamente!",
                person
            }
        } catch (error) {
            throw new CustomException(error.message, 'PERSON', error.status || 501);
        }
    }

}

module.exports = PersonController
