'use strict'

var Servidor = require('./biblioteca/iniciador/principal');
var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");

configuracao.defaults(pastaConfiguracaoPadrao);

configuracao.load(function () {

  // Chamamos o arquivo principal, ele vai executar os outros.
  var servidor = require('./biblioteca/iniciador/principal');
  servidor.prosseguir(configuracao, function() {
    registrador.debug('Iniciou servidor xmpp com sucesso!');
  });
  
});

/* Oferece abstração para o servidor xmpp.
 */
var servidorXmpp = {
  opcoes: null,
  
  // Iniciamos aqui com as opções informadas.
  // @Parametro {opcoes} Aquelas opções de configuração do servidor.
  initialize: function(opcoes) {
    this.opcoes = opcoes;
   
  },
  
  // Carregamos o nosso servidor.
  carregar: function() {
    servidor.prosseguir(this.opcoes, function() {
      registrador.debug('Iniciou servidor xmpp com sucesso!');
    });
  },
  
  Servidor: Servidor
};

module.exports = servidorXmpp;