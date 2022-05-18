const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const markdownLinkExtractor = require("markdown-link-extractor");
const linkCheck = require("link-check");
const colors = require('colors');


const validationPath = (pathUser) => {
  //PathAbsolute convierte la ruta relativa en absoluta
  const pathAbsolute = path.resolve(pathUser).normalize();
  if (!path.isAbsolute(pathUser)) {
    return pathAbsolute;
  } else {
    return pathUser;
  }
};

// identifyFile, permite identificar si el archivo que estamos leyendo es .md
const identifyFile = (pathUser) => {
  const isMd = path.extname(validationPath(pathUser)) === ".md";
  return isMd;
};

// Función para leer archivo
const read = (pathUser) => {
  return new Promise((resolve, reject) => {
    fs.readFile(pathUser, "utf-8", (error, contentfile) => {
      if (error) {
        throw error;
      }
      if (!identifyFile(pathUser)) {
        reject("No se pudo leer el archivo");
      }

      resolve(contentfile);
    });
  });
};

// Función que permite validar el estado del link y retorna un objeto con href, text, file, status y statusCode
const validateLink = (objectArray) => {
  return new Promise((resolve, reject) => {
    const link = objectArray.href;
    linkCheck(link, (err, result) => {
      if (err) {
        console.log(err);
        reject("No fue posible realizar la petición a: " + link);
        return;
      }
      let statusResponse = "";
      if (result.status === "alive") {
        statusResponse = "Ok";
      } else {
        statusResponse = "Fail";
      }
      resolve({
        file: objectArray.file,
        href: objectArray.href,
        statusCode: result.statusCode,
        status: statusResponse,
        text: objectArray.text,
      });
    });
  });
};

const linkStats = (arrayObject) => {
    const total = arrayObject.length;
    const sizeLinks = arrayObject.map((e) => e.href);
    const uniqueLinks = new Set(sizeLinks);
    const unique = [...uniqueLinks].length;
    return {total, unique};
} 

const validateAndStats = (arrayObject, totalUnique) => {
  let broken = arrayObject.filter((e) => e.status === "Fail").length;
  // Los ... indican que pasa de {total: 82, unique: 77} a total: 82, unique: 77 -- Elimina el objeto y deja solo las propiedades
  return {...totalUnique, broken:broken};
}

const mdLinks = (pathUser, options) => {
  return new Promise((resolve, reject) => {
    // Ingresa path
    //Función que convierte la ruta relativa en absoluta
    const pathAbsolute = validationPath(pathUser);
    //Función que evalua si la ruta es un archivo .md
    identifyFile(pathAbsolute);
    //Función que lee el archivo y crea el objeto de respuesta
    const basicInfoLinks = [];
    read(pathAbsolute)
      .then((contentfile) => {
        // Se crea una constante donde se utiliza la librería markdownLinkExtractor, para extraer los links de los archivos.
        const { links } = markdownLinkExtractor(contentfile, (extended = true));
        const arrayLinks = links.map((link) => {
          let objetResolve = {};
          objetResolve.file = pathUser;
          objetResolve.href = link.href,
          objetResolve.text = link.text,
            basicInfoLinks.push(objetResolve);
          return objetResolve;
        });
        return basicInfoLinks;
      })
      .then((res) => {
        if((options.validate !== true) && (options.stats !== true)) {
          return(res);
        } else if ((options.validate === true) && (options.stats === true)) {
          return(Promise.all(res.map((e) => validateLink(e))));
        } 
        else if (options.stats === true) {
          return(linkStats(res));
        }
        else {
          return(Promise.all(res.map((e) => validateLink(e))));
        }
      })
      .then((res) => {
        if((options.validate !== true) && (options.stats !== true)) {
          resolve(res.map((e)=> `${e.file.brightCyan} ${e.href.brightMagenta} ${e.text.brightGreen}\n`).join(""));
        } else if ((options.validate === true) && (options.stats === true)) {
          resolve(validateAndStats(res,linkStats(res)));
        } 
        else if (options.stats === true) {
          resolve(`Total: ${res.total}\nUnique: ${res.unique}`);
        }
        else {
          resolve(res.map((e)=> `${e.file.brightCyan} ${e.href.brightMagenta} ${e.statusCode} ${e.status.brightYellow} ${e.text.brightGreen}\n`).join(""));
        }
      })
      .catch((error) => {
        console.log(error);
        reject("Hubo un problema con la ejecución");
      });
    //Función que valida el estado de los links
    // Función de estadísticas
  });
};

/* mdLinks(pathUser, thirdPosition())
  .then((res) => {
    console.log(res);
  })
  .catch((err) => err, "Esto es un error  de mdlink"); */

  module.exports = { mdLinks,  validationPath, read, validateLink };