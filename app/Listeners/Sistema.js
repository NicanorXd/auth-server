'use strict'

const Mail = use('Mail')
const Sistema = exports = module.exports = {}

Sistema.registered = async (sistema) => {

    await Mail.send('emails.newSystem', sistema.toJSON(), (message) => {
        message.to(sistema.email)
            .from('twd2206@gmail.com')
            .subject(`Hola ${sistema.nombre}, registro exitoso!`)
    })

}
