'use strict'

const Api = use('App/Models/Api');
const { validation } = require('validator-error-adonis');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException');
const Axios = require('axios').default;

class ApiController {

    async store ({ request }) {
        let datos = request.all();
        await validation(null, datos, {
            slug: "required|max:10",
            url: 'required|url',
            headers: 'required|json'
        });
        // crear
        let api = await Api.create({ 
            slug: datos.slug,
            url: datos.url,
            headers: datos.headers || {}
        });
        // reposnse
        return { 
            success: true,
            status: 201,
            message: "La api se creó correctamente!",
            api
        }
    }

    async getResolver ({ params, request }) {
        let url = request.input('url', '/');
        let api = await Api.findBy('slug', params.slug);
        if (!api) throw new NotFoundModelException("la api");
        api = await api.toJSON();
        let link = `${api.url}/${url}`;
        let config = { headers: api.headers };
        let response = await Axios.get(link, config)
        .then(res => {
            return { data: res.data, message: "ok", status: res.status, success: true };
        }).catch(err => {
            throw new err;
        });
        // response
        return {
            resource: link,
            ...response
        }
    }

}

module.exports = ApiController
