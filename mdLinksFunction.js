const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const markdownLinkExtractor = require("markdown-link-extractor");
const linkCheck = require("link-check");

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

      /* console.log(markdownLinkExtractor(file)) */
      /*       links.forEach(link =>
        linkCheck(link,(err, result) => {
        if(err) {
          console.log(err);
          return;
        }
        console.log(JSON.stringify(result, null, 4));
        console.log(result.statusCode);
      })) */
      resolve(file);
    });
  });
};
read(pathUser).then((file) => {
  // Se crea una constante donde se utiliza la librería markdownLinkExtractor, para extraer los links de los archivos.

  const { links } = markdownLinkExtractor(file, (extended = true));

  let objetResolve = {};
  links.map((link) => {
    objetResolve.href = link.href,
    objetResolve.text = link.text,
    objetResolve.file = pathUser;
    console.log(objetResolve.file, objetResolve.href, objetResolve.text);
  });
});
