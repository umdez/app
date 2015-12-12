'use strict'

var Servidor = require('./biblioteca/iniciador/principal');
var configuracao = require('./configuracao/configuracao.js');

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
    servidor.prosseguir(configuracao, function() {
      registrador.debug('Iniciou servidor xmpp com sucesso!');
    });
  },
  
  Servidor: Servidor
};

module.exports = servidorXmpp;