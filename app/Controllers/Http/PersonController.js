'use strict'

const Person = use('App/Models/Person');
const Badge = use('App/Models/Badge');
const { validation, Storage  } = require('validator-error-adonis');
const ValidatorException = use('App/Exceptions/ValidatorException')
const Helpers = use('Helpers');
const { LINK_LOCAL, LINK_PUBLIC, generateImage } = require('../../../utils');
const documents = require('../../../utils/documents.json');
const CustomException = require('../../Exceptions/CustomException');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException');
const User = use('App/Models/User');
const Drive = use('Drive');
const collect = require('collect.js');
const moment = require('moment');


class PersonController {

    index = async ({ request }) => {
        let { page, query_search, perPage } = request.all();
        let ids = collect(request.collect(['ids'])).pluck('ids').toArray();
        let people = Person.query()
            .with('document_type')
            .with('badge')
            .join('badges as bad', 'bad.cod_ubi', 'people.badge_id')
            .join('document_types as type', 'type.code', 'people.document_type_id')
            .select('people.*')
            .orderBy('fullname', 'ASC')
        // filtro
        if (query_search) people = people.where('fullname', 'like', `%${query_search}%`)
            .orWhere('document_number', 'like', `%${query_search}%`);
        if (ids.length) people = people.whereIn('people.id', ids);
        // fetch 
        people = await people.paginate(page || 1, perPage || 20);
        people = await people.toJSON();
        // response
        return {
            success: true,
            status: 201,
            people
        };
    }

    findPerson = async ({ params, request }) => {
        let type = request.input('type', 'id');
        let person = Person.query()
            .join('badges as bad', 'bad.cod_ubi', 'people.badge_id')
            .join('document_types as type', 'type.code', 'people.document_type_id')
            .select('people.*', 'bad.cod_dep', 'bad.departamento', 'bad.cod_pro', 'bad.provincia', 'bad.cod_dis', 'bad.distrito', 'type.name as document_type');
        if (type == 'id') {
            person = await person.where('people.id', params.id).first();
        } else if (type == 'document') {
            person = await person.where('people.document_number', params.id).first();
        }else {
            person = null;
        }
        // add ubigeo
        if (person) {
            documents.map(d => d.key == person.document_type ? person.document_type_text = d.text : null);
        }
        // response
        return person ? person.toJSON() : {};
    }

    findPeople = async ({ request }) => {
        let ids = request.input('id', []);
        let type = request.input('type', 'id');
        let people = Person.query()
            .join('badges as bad', 'bad.cod_ubi', 'people.badge_id')
            .join('document_types as type', 'type.code', 'people.document_type_id')
            .select('people.*', 'bad.cod_dep', 'bad.departamento', 'bad.cod_pro', 'bad.provincia', 'bad.cod_dis', 'bad.distrito', 'type.name as document_type');
        if (typeof ids == 'object') people.whereIn(`people.${type}`, ids);
        if (typeof ids == 'string') people.where(`people.${type}`, ids);
        people = await people.fetch();
        people = await people.toJSON();
        // get
        return people;
    }

    getDocumentType = async ({ request }) => {
        return [
            { key: "01", value: "01", text: "DNI/LE" },
            { key: "04", value: "04", text: "CARNET EXT" },
            { key: "07", value: "07", text: "PASAPORTE" },
            { key: "09", value: "09", text: "OTRO" }
        ];
    }   

    store = async ({ request, response }) => {
        // validar request
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
        if (person) throw new ValidatorException([{ field: 'document_number', message: 'El numero ya está es uso' }])
        let badge = await Badge.query()
            .where('cod_dep', request.input('cod_dep'))
            .where('cod_pro', request.input('cod_pro'))
            .where('cod_dis', request.input('cod_dis'))
            .first();
        if (!badge) throw new ValidatorException([{
            field: 'cod_dep', message: 'El código es invalido',
            field: 'cod_pro', message: 'El código es invalido',
            field: 'cod_dis', message: 'El código es invalido'
        }])
        // obtener badge
        payload.badge_id = badge.cod_ubi;
        //procesamos
        try {
            // crear persona
            person = await Person.create(payload);
            // verificar file
            if (request.file('image')) {
                const tmp_image = request.file('image', {
                    types: ['image'],
                    size: '2mb'
                  })
                // mover
                await tmp_image.move(Helpers.tmpPath('person/img'), {
                    name: `person_${person.document_number}.png`,
                    overwrite: true
                })
                // actualizar o guardar la imagen
                let filename = `person/img/person_${person.document_number}.png`;
                person.image = await LINK_LOCAL(filename);
                await generateImage(Helpers.tmpPath(filename));
            } else { 
                person.image = LINK_PUBLIC(`img/${person.gender == 'M' ? 'hombre' : 'mujer' }.jpg`);
            }
            // guardar cambios
            await person.save();   
            person.document_type = await person.document_type().fetch();
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

    show = async ({ params, request }) => {
        let type = request.input('type', 'id');
        let allow = ['document_number', 'id'];
        if (!allow.includes(type)) throw new CustomException("El tipo no está permítido");
        // obtener persona
        let person = await Person.query()
            .with('document_type')
            .with('badge')
            .where(type, params.id)
            .first()
        if (!person) throw new NotFoundModelException("La persona")
        // response
        return {
            success: true,
            status: 201,
            person
        }
    }

    update = async ({ params, request }) => {
        // validar person
        let person = await Person.find(params.id);
        if (!person) throw new NotFoundModelException("La persona no existe");
        // validar request
        await validation(null, request.all(), {
            document_type_id: "required|min:2|max:5",
            document_number: "required|min:8|max:15",
            name: "required|min:3|max:50",
            ape_pat: "required|min:3|max:100",
            ape_mat: "required|min:3|max:100",
            profession: "required|min:2",
            date_of_birth: "required|dateFormat:YYYY-MM-DD",
            gender: "required|min:1|max:3",
            cod_dep: "required|max:15",
            cod_pro: "required|max:15",
            cod_dis: "required|max:15",
            address: "required|max:255",
            marital_status: "required|max:1"
        });
        // validar persona
        let is_self = await Person.query()  
            .where('id', '<>', person.id)
            .where('document_number', request.input('document_number'))
            .getCount(); 
        if (is_self) throw new ValidatorException([{ field: 'document_number', message: 'El numero ya está es uso' }])
        let badge = await Badge.query()
            .where('cod_dep', request.input('cod_dep'))
            .where('cod_pro', request.input('cod_pro'))
            .where('cod_dis', request.input('cod_dis'))
            .first();
        if (!badge) throw new ValidatorException([{
            field: 'cod_dep', message: 'El código es invalido',
            field: 'cod_pro', message: 'El código es invalido',
            field: 'cod_dis', message: 'El código es invalido'
        }])
        // generar fecha de nacimiento
        let date_of_birth = request.input('date_of_birth');
        // payload
        let payload = {
            document_type_id: request.input('document_type_id'),
            document_number: request.input('document_number'),
            name: request.input('name'),
            ape_pat: request.input('ape_pat', ''),
            ape_mat: request.input('ape_mat', ''),
            profession: request.input('profession', ''),
            date_of_birth,
            gender: request.input('gender', ''),
            address: request.input('address', ''),
            email_contact: request.input('email_contact', ''),
            phone: request.input('phone', ''),
            badge_id: badge.cod_ubi,
            marital_status: request.input('marital_status')
        };
        let nameTmp = moment().valueOf();
        // validar imagen
        let imagen = await Storage.saveFile(request, 'image', {
            types: ['image'],
            size: '2mb'
        }, Helpers, {
            path: 'person/img',
            options: {
                name: nameTmp,
                overwrite: true
            }
        });
        if (imagen.success) {
            let newName = `person_${person.document_number}`;
            let output = Helpers.tmpPath(`/person/img/${newName}.${imagen.extname}`);
            let exists = await Drive.exists(output);
            if (exists) await Drive.delete(output);
            await Drive.move(imagen.realPath, output);
            await generateImage(output);
            payload.image = LINK_LOCAL(`${imagen.path}`.replace(nameTmp, newName));
        }
        // actualizar
        person.merge(payload);
        await person.save();
        // response
        return {
            success: true,
            code: 201,
            message: 'Los datos se actualizarón correctamente!'
        }
    }

    user = async ({ params }) => {
        let person = await Person.find(params.id);
        if (!person) throw new NotFoundModelException("La person");
        let user = await User.query()
            .where('person_id', person.id)
            .where('state', 1)
            .first();
        if (!user) throw new NotFoundModelException("El usuario");
        // response
        return {
            success: true,
            status: 201,
            person,
            user,
        }
    }

}

module.exports = PersonController
