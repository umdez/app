#!/usr/bin/env node

var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");
var registrador = require('./biblioteca/nucleo/Registrador')('iniciar');

configuracao.defaults(pastaConfiguracaoPadrao);

// Parametros do ambiente
configuracao.set('env', {
  DOMAIN: 'domain',
  PORT: ['port', parseInt],
});

configuracao.cli({
  connection: ['connection', [false, "Não escutar conexões e não adicionar usuários de teste"]],
  auth: ['auth', [false, "Não adicionar métodos de autenticação"]],
  configuracao: ['c', "pasta para carregar arquivo de configuracao", 'path', pastaConfiguracaoPadrao],
  storage: ['storage', [false, "Não utilizar armazenamento"]],
  api: ['api', [false, "Não oferecer serviço de api"]]
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
  servidor.prosseguir(configuracao, function() {
    registrador.debug('Iniciou servidor xmpp com sucesso!');
  });
  
});