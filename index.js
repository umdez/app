'use strict'

var Servidor = require('./biblioteca/iniciador/principal');
var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");

configuracao.defaults(pastaConfiguracaoPadrao);

configuracao.load(function (args, opcs) {

  // Carrega um arquivo de configuração pelo argv preservando o padrão
  if(args.length > 0) {
    opcs.configuracao = args[args.length - 1];
  }

  if(opcs.configuracao !== pastaConfiguracaoPadrao) {
    configuracao.merge(require(opcs.configuracao));
  }

  // Chamamos o arquivo principal, ele vai executar os outros.
  var servidor = require('./biblioteca/iniciador/principal');
  servidor.prosseguir(configuracao, function() {
    registrador.debug('Iniciou servidor xmpp com sucesso!');
  });
  
});

/* Oferece abstração para o servidor xmpp.
 */
var servidor-xmpp = {
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
}

module.exports = servidor-xmpp;