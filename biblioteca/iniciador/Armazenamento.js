'use strict';

var baseBiblioteca = require('../indice');
var Armazenamento = baseBiblioteca.Armazenamento;
var registrador = require('../nucleo/Registrador')('armazenamento'); 

function CarregaArmazenamento() {}

CarregaArmazenamento.prototype.carregar = function (configuracao) {

  // Carrega configurações
  var configArmazenamento = configuracao.storage;

  // Inicia o módulo de armazenamento
  var s = new Armazenamento(configArmazenamento);

  // retorna promessa
  return s.initialize();

};

module.exports = CarregaArmazenamento;