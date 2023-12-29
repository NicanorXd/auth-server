'use strict'

const Sede = use('App/Models/Sede');
const { validate } = use('Validator');
const { validation } = require('validator-error-adonis');


class SedeController {

    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let ids = request.input('ids', null);
        let sede = Sede.query()
        // filtrar
        if (query_search) sede.whereRaw(`(descripcion LIKE '%${query_search}%' OR direccion LIKE '%${query_search}%')`)
        // filtrar por ids
        if (ids) sede.whereIn('id', ids);
        // paginar
        sede = await sede.paginate(page || 1, 20);
        // response 
        return {
            success: true,
            status: 201,
            sede
        }  
    }

    store = async ({ request }) => {
        // validar inputs
        await validation(validate, request.all(), {
            descripcion: 'required|max:255|unique:sedes',
            direccion: 'required|max:255'
        })
        // guardar
        let sede = await Sede.create({ 
            descripcion: request.input('descripcion'),
            direccion: request.input('direccion')
        });
        // response 
        return {
            success: true,
            status: 201,
            message: 'La sede se registró correctamente',
            sede
        }
    }

    show = async ({ params, reqeust }) => {
        let sede = await Sede.find(params.id);
        if (!sede) throw new Error(`No se encontró la sede`);
        // response
        return {
            success: true,
            status: 201,
            sede
        }
    }

}

module.exports = SedeController
