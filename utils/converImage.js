const { execSync } = require('child_process');
const Drive = use('Drive');

const sizes = [
    "400x400",
    "200x200",
    "50x50"
];

const format = ['jpg', 'png', 'jpeg'];


const RecoverImage = async (path) => {
    let success = false;
    let format_file = path.split('.');
    let extname = format_file[format_file.length - 1];
    format_file.pop();
    let name = format_file.join("");
    // validar
    if (format.indexOf(extname) >= 0) success = true;
    // add filename
    let filename = `${name}.${extname}`;
    // response 
    return {
        success,
        name, 
        extname,
        filename
    };
}


module.exports.sizes = sizes;

module.exports.RecoverImage = RecoverImage;

module.exports.generateImage = async (path = "") => {
    let file = await RecoverImage(path);
    // validar file
    if (file.success) {
        // generar imagenes
        await sizes.map(async size => {
            let output = `${file.name}_${size}.${file.extname}`;
            let comand = `convert ${path} -resize ${size} ${output}`;
            await execSync(comand);
        });
    }
}