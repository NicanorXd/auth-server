'use strict'

const DocumentType = use('App/Models/DocumentType');

class DocumentTypeController {

    // obtener documentos
    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let document_type = DocumentType.query();
        // obtener
        document_type = await document_type.paginate(page || 1, 20);
        // response
        return { 
            success: true,
            status: 201,
            document_type
        }
    }

}

module.exports = DocumentTypeController
