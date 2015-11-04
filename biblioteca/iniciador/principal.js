'use strict'

var xmpp = require('node-xmpp-server');

// Acessamos os arquivos base do nosso servidor.
var baseBiblioteca = require('../indice');

// Carrega todos os outros arquivos necessários
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaConexao = require('./GerenciaConexao');
var Autenticacao = require('../nucleo/Autenticacao');

exports.prosseguir = function(configuracao, pronto) {
  
  var rotaConexao = new baseBiblioteca.Rota.RotaConexao(/* <umdex> precisamos passar aqui o armazenamento */); // Inicia rota conexões
  var gerenciaConexao = new GerenciaConexao();
  var autenticacao = new Autenticacao(configuracao);
  
  registrador.debug('Carregando gerencia de conexão');
  gerenciaConexao.carregar(rotaConexao, configuracao)
  .then(function () {
    // Carrega módulos de autenticação
    registrador.debug('Iniciando autenticação');
    return autenticacao.carregar(rotaConexao, configuracao);
  })
  .then(function () {
	// parece que tudo ocorreu bem
	pronto();
  })
  .catch(function (err) {
    registrador.error(err);
  });

}