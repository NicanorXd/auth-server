'use strict'


class LogoutController {

    /**
     * revocar token
     * @param {*} param0 
     */
    logout = async ({ request, response }) => {
        try {
            let newToken = request.$token;
            newToken.is_revoked = 1;
            await newToken.save();
            return {
                success: true,
                code: 201,
                message: `La sesión ha sido cerrada desde ${newToken.device}`
            };
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

}

module.exports = LogoutController
