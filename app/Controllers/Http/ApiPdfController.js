'use strict'

const pdf = require('html-pdf'); 
const fs = require('fs');

class ApiPdfController {

    handle = async ({ request, response }) => {
        let dev = request.input('dev', 0);
        // let reset = fs.readFileSync('./public/css/reset.css',  'utf-8')
        let html = dev ? fs.readFileSync('./boleta.html', 'utf-8') : request.input('data', "");
        // html += `<style>${reset}</style>`;
        // opciones
        let options = {
            type: 'pdf',
            zoomFactor: 1,
            quality: 0.5,
            border: 0,
            format: request.input('format', 'Letter'),
            orientation: request.input('orientation', 'portrait')
        }
        // generar pdf
        let result = new Promise((resolve, reject) => {
            pdf.create(html, options).toBuffer(function(err, buffer){
                if (err) reject(err);
                else resolve(buffer);
            });
        });
        // responder
        await result.then(res => {
            response.type('application/pdf')
            response.send(res);
        }).catch(err =>  response.send({
            error: true,
            message: err.message
        }).status(501));
    }

}

module.exports = ApiPdfController
