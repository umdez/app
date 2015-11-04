'use strict';

var Promessa = require('bluebird');

function Autenticador() {}

/**
 * @param nome do método
 */
Autenticador.prototype.seCorresponder = function (metodo) { // jshint ignore:line
  return false;
};

/**
 * @param mapa hash-key das opções de opcs
 */
Autenticador.prototype.autenticar = function (opcs) { // jshint ignore:line
  return new Promessa(function (deliberar, recusar) {
    recusar();
  });
};

module.exports = Autenticador;
