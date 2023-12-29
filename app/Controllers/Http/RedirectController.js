'use strict'

class RedirectController {

    index = ({ request, response }) => {
        let { url, params } = request.all();
        let iter = 0;
        // generar link
        let link = url;
        // agregar params
        params = params ? JSON.parse(params) : {};
        for(let par in params) {
            link += iter == 0 ? `?` : `&`;
            link += `${par}=${params[par]}`;
            iter++;
        }
        // redirigir
        return response.redirect(link);
    }

}

module.exports = RedirectController
