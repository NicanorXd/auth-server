const Env = use('Env');
const moment = require('moment')
const { generateImage, sizes, RecoverImage } = require('./converImage');


const URL = (link, up = false, size) =>  `${Env.get('APP_URL', 'http://localhost')}/${link}${up ? `&update=${moment().valueOf()}` : ''}${size ? `&size=${size}` : ''}`;

const LINK_PUBLIC = (path) => `find_file_public?path=${path}`;

const LINK_LOCAL = (path) => `find_file_local?path=${path}`;

const LINK_IMAGES = async (path, name, up = false) => {
    let images = {};
    await sizes.filter(size => images[`${name}_${size}`] = URL(path, up, size));
    // response 
    return images;
} 

const LINK_SIZES = (path, name, up = false) => {
    let images = {};
    sizes.filter(size => images[`${name}_${size}`] = URL(path, false, size));
    // response 
    return images;
} 

const getAge = (date) => {
    return moment().diff(date, 'years', false);
}

module.exports = {
    URL,
    LINK_PUBLIC,
    LINK_LOCAL,
    LINK_IMAGES,
    LINK_SIZES,
    generateImage,
    sizes,
    RecoverImage,
    getAge,
};