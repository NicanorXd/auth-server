'use strict'

const Entity = use('App/Models/Entity');
const { validate, validateAll } = use('Validator');
const { validation, Storage } = require('validator-error-adonis');
const { URL, LINK_IMAGES, LINK_LOCAL, generateImage } = require('../../../utils');
const slugify = require('slugify');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')
const Helpers = use('Helpers');

class EntityController {

    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let entities = Entity.query();
        // filtros
        if (query_search) entities.where('name', 'like', `%${query_search || ""}%`)
        // get 
        entities = await entities.paginate(page || 1, 20);
        entities = await entities.toJSON();
        // response 
        return {
            success: true,
            status: 201,
            entities
        }
    }

    store = async ({ request }) => {
        await validation(validateAll, request.all(), {
            name: 'required',
            slug: 'required|unique:entities',
            email: 'required|email',
            ruc: 'required|max:12|unique:entities',
            address: 'required|max:255'
        });
        // payload
        let payload = {
            name: `${request.input('name')}`.toLowerCase(),
            slug: slugify(`${request.input('slug')}`.toUpperCase()),
            email: request.input('email'),
            ruc: request.input('ruc'),
            address: request.input('address', null)
        }
        // save logo
        let logo = await Storage.saveFile(request, 'logo', {
            types: ['image'],
            size: '2mb',
            extnames: ['png', 'jpg'],
            required: true
        }, Helpers, {
            path: "entity/img",
            options: {
                name: `entity_${payload.slug}`,
                overwrite: true
            }
        });
        // add logo 
        payload.logo = LINK_LOCAL(logo.path);
        await generateImage(logo.realPath)
        // crear
        let entity = await Entity.create(payload);
        // response
        return {
            success: true,
            code: 201,
            message: "La entidad se creo correctamente!",
            entity
        }
    }

    show = async ({ params, request }) => {
        let entity = await Entity.find(params.id);
        if (!entity) throw new NotFoundModelException("La entidad"); 
        return {
            success: true,
            status: 201,
            entity
        }
    }

    update = async ({ params, request }) => {
        let entity = await Entity.find(params.id);
        if (!entity) throw new Error("No se encontró la entidad");
        // validar inputs
        await validation(validate, request.all(), {
            name: 'required|max:255',
            email: 'required|email|max:100',
            slug: 'required|max:20',
            ruc: 'required|max:12',
            address: 'required|max:255'
        });
        // validar ruc
        let val_ruc = await Entity.query()
            .where('ruc', '=', request.input('ruc'))
            .where('id', '<>', params.id)
            .first();
        if (val_ruc) throw new Error("El ruc yá se encuenta ocupado");
        // validar logo
        let logo = await Storage.saveFile(request, "logo", {
            required: true,
            types: ["image"],
            extnames: ['png', 'jpg', 'jpeg'],
            size: "2mb"
        }, Helpers, {
            path: "entity/img",
            options: {
                name: `entity_${entity.slug}`,
                overwrite: true
            }
        })
        // add logo
        if (logo.success) {
            entity.logo = LINK_LOCAL(logo.path);
            await generateImage(logo.realPath);
        }
        // preparar datos
        let payload = {
            name: `${request.input('name')}`.toLowerCase(),
            email: request.input('email'),
            ruc: request.input('ruc'),
            address: request.input('address', entity.address),
        }
        // actualizar
        entity.merge(payload);
        await entity.save();
        // response
        return {
            success: true,
            code: 201,
            message: "La entidad se actualizó correctamente!",
            entity
        }
    }

}

module.exports = EntityController
