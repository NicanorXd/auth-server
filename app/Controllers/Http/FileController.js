'use strict'
const Helpers = use('Helpers');
const Drive = use('Drive');
const { RecoverImage } = require('../../../utils');


class FileController {


    getFile = async (name, { request, response }) => {
        let { path, size } = request.get();
        let url = Helpers[name](path);
        let validate = await RecoverImage(url);
        // validamos si es una imagen
        if (size && validate.success) {
            let output = `${validate.name}_${size}.${validate.extname}`;
            if (await Drive.exists(output)) return response.download(output);
        }
        // validar path
        if (await Drive.exists(url)) return response.download(url);
        // not found
        return response.download(Helpers.publicPath('/img/not-found.jpg'));
    }

    findFilePublic = async ({ request, response }) => {
        return await this.getFile("publicPath", { request, response });
    }

    findFileLocal = async ({ request, response }) => {
        return await this.getFile("tmpPath", { request, response });
    }

}

module.exports = FileController
