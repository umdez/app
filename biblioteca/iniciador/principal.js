'use strict'

var xmpp = require('node-xmpp-server');

// Acessamos os arquivos base do nosso servidor.
var baseBiblioteca = require('../indice');

// Carrega todos os outros arquivos necessários
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaConexao = require('./GerenciaConexao');
var Autenticacao = require('../nucleo/Autenticacao');
var Armazenamento = require('./Armazenamento');

exports.prosseguir = function(configuracao, pronto) {
  var esteObjeto = {};
  
  esteObjeto.bdados = null;
  esteObjeto.rotaConexao = null;
  esteObjeto.armazenamento = new Armazenamento(configuracao);
  
  esteObjeto.gerenciaConexao = new GerenciaConexao();
  var autenticacao = new Autenticacao(configuracao);
  
  esteObjeto.armazenamento.carregar(configuracao)
  .then(function (arm) {
    esteObjeto.bdados = arm;  
    registrador.debug('Módulo de armazenamento carrregado');
  })
  .then(function () {
      // Iniciar rota de conexão
      esteObjeto.rotaConexao = new baseBiblioteca.Rota.RotaConexao(esteObjeto.bdados); 
  })
  .then(function () {
    // Carregando gerencia de conexão
    esteObjeto.gerenciaConexao.carregar(esteObjeto.rotaConexao, configuracao);
  })
  .then(function () {
    // Carrega módulos de autenticação
    return autenticacao.carregar(esteObjeto.rotaConexao, configuracao);
  })
  .then(function () {
    // parece que tudo ocorreu bem
    pronto();
  })
  .catch(function (err) {
    registrador.error(err);
  });

}