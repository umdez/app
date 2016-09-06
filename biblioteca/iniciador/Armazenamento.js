'use strict';

/* Realizamos a gerencia de armazenamento do nosso serviço.
 */
 
var Base = require('../indice');
var Armazenamento = Base.Armazenamento;

function CarregaArmazenamento(configuracao) {
  this.opcoes = {
    configuracao: configuracao
  };
}

CarregaArmazenamento.prototype.carregar = function (modulos) {

  this.opcoes.modulos = modulos;

  var armazenamento = new Base.Armazenamento(this.opcoes);

  return armazenamento.iniciar();
};

module.exports = CarregaArmazenamento;