'use strict'

const Institution = use('App/Models/Intitution');

class InstitutionController {

    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let attribute = request.input('attribute', 'name');
        // get intitutions
        let institution = Institution.query();
        if (query_search) institution.where(attribute, query_search);
        institution = await institution.paginate(page || 1, 20);
        // response
        return {
            success: true,
            status: 201,
            institution
        }
    }

}

module.exports = InstitutionController
