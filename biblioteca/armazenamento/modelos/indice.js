'use strict';

/* @arquivo indice.js
 *
 * Carrega arquivos de modelo desta pasta.
 */

var sistemaDeArquivos = require('fs');
var pasta = require('path');

module.exports = function (sequelize, bd)  {
  bd = bd ||  {};
  var modelos = [];

  // carrega pasta atual
  sistemaDeArquivos
    .readdirSync(__dirname)
    // carrega tudo menos indice.js
    .filter(function (arquivo) {
      return ((arquivo.indexOf('.') !== 0) && (arquivo !== 'indice.js') && (arquivo.slice(-3) === '.js'));
    })
    // importa modelo
    .forEach(function (arquivo) {
      var modelo = sequelize.import(pasta.join(__dirname, arquivo));

	    // Adiciona modelo para um objeto
      bd[modelo.mod.name] = modelo.mod;
      modelos.push(modelo.mod);
    });

  // No momento em que o modelo é definido, vamos carregar as associações
  modelos.forEach(function (modelo) {
    
    if (modelo.options.hasOwnProperty('associar')) {
      modelo.options.associar(bd);
    }
  });

  return bd;
};