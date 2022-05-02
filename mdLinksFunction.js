const fs = require("fs");
const { resolve } = require("path");
const path = require("path");

//Esta constante guarda la ruta que se ingrese por consola
const pathUser = process.argv[2];

const validationPath = (route) => {
  //PathAbsolute convierte la ruta relativa en absoluta
const pathAbsolute = path.resolve(route).normalize();
 if (!path.isAbsolute(pathUser)) {
  console.log("path must be transformed", pathAbsolute);
   return pathAbsolute;
} else {
  console.log("Path is absolute", pathUser);
   return pathUser;
 }
};
validationPath(pathUser);

/* const read = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (error, file) => {
      if (error) {
        reject(error);
        throw error;
      }
      console.log(file);
      resolve(file);
    });
    console.log('Contenido del archivo es...');
  });
};
read('./test.md').then(() => {
  console.log('Esta es la prueba de la función read');
}); */