const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const markdownLinkExtractor = require('markdown-link-extractor');


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
/* validationPath(pathUser); */

const identifyFile = (pathUser) => {
  if (path.extname(validationPath(pathUser)) === ".md") {
    console.log("File is .md");
  } else {
    console.log("No es un archivo .md");
  }
};

identifyFile(pathUser);

const read = (pathUser) => {
  return new Promise((resolve, reject) => {
    fs.readFile(pathUser, "utf-8", (error, file) => {
      if (error) {
        reject(error);
        throw error;
      }
      resolve(file);
    });
  });
};
read(pathUser).then(() => {
  console.log("Esta es la prueba de la función read");
});



