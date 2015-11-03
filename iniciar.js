#!/usr/bin/env node

var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");
var Registrador = require('./biblioteca/nucleo/Registrador')('iniciar');

configuracao.defaults(pastaConfiguracaoPadrao);

// Parametros do ambiente
configuracao.set('env', {
  DOMAIN: 'domain',
  PORT: ['port', parseInt],
});

configuracao.cli({
  domain: ['domain', ['d', "dominio do servidor xmpp",  'host']],
  port:   ['port',   ['p', "porta do servidor xmpp",  'number']],
  configuracao: ['c', "pasta para carregar arquivo de configuracao", 'path', pastaConfiguracaoPadrao],
  logger: ['logger', [false, "Registra eventos dos clientes em stdout"]],
  websocket: ['websocket', [false, "Não escutar conexões websocket"]],
});

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
  servidor.prosseguir(configuracao, function(etapa) {

    switch(etapa) {
      case 'websocket_pronto':
        // Servidor websocket pronto!
		Registrador.debug('Servidor websocket pronto!');
      break;
    }
  });
  
});