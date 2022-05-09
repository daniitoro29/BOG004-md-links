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
    return pathAbsolute;
  } else {
    return pathUser;
  }
};

// identifyFile, permite identificar si el archivo que estamos leyendo es .md
const identifyFile = (pathUser) => {
  const isMd = path.extname(validationPath(pathUser)) === ".md";
  console.log(isMd, "Es md");
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

let statsReturn = {};
const linkStats = (arrayObject) => {
    const total = arrayObject.length;
    const sizeLinks = arrayObject.map((e) => e.href);
    const uniqueLinks = new Set(sizeLinks);
    const unique = [...uniqueLinks].length;
    statsReturn.total = total;
    statsReturn.unique = unique;
    return statsReturn;
} 

// const optionsView = {};
let validate = '';
let stats = '';
const thirdPosition = () => {
    if(process.argv[3] === '--validate') {
        validate = true;   
    } else if (process.argv[3] === '--stats') {
        stats = true;
    }
    console.log(validate, 'SOY VALIDATE')
    console.log(stats, 'SOY STATS')
}




const mdLinks = (path, options) => {
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
        if((validate !== true) && (stats !== true)) {
          resolve(res);
        } else if (stats === true) {
          resolve (linkStats(res))
        }
        else {
          resolve(Promise.all(res.map((e) => validateLink(e))));
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

mdLinks(pathUser, thirdPosition())
  .then((res) => {
    console.log(res, "Este es el llamado de la funcion mdLinks");
  })
  .catch((err) => console.log(err, "Esto es un error  de mdlink"));
