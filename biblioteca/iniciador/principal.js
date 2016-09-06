'use strict'

/* @Arquivo principal.js
 * 
 * Aqui iremos carregar tudo que é necessário para o servidor.
 */

var xmpp = require('node-xmpp-server');

var baseBiblioteca = require('../indice');
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaConexao = require('./GerenciaConexao');
var Autenticacao = require('../nucleo/Autenticacao');
var Armazenamento = require('./Armazenamento');
var ServicoRestApi = require('servidor-xmpp-restapi');

exports.prosseguir = function(configuracao, pronto) {
  var meuObjt = {};
  
  var modulos = [];

  var bd = modulos['bd'] = {
    'armazenamento': new Armazenamento(configuracao.armazenamento),
    'modelos': null,
    'sequelize': null
  };

  var armazenamento = bd.armazenamento;

  registrador.debug('Carregando os módulos base do nosso servidor.');

  armazenamento.carregar(modulos).then(function (armazenamento) { 

  })
  .then(function () {
    pronto();
  })
  .catch(function (erro) {
    registrador.error(erro);
  });

/*
  meuObjt.rotaConexao = null;
  meuObjt.armazenamento = new Armazenamento(configuracao);
  meuObjt.gerenciaConexao = new GerenciaConexao();
  meuObjt.autenticacao = new Autenticacao(configuracao);
  
  
  
  meuObjt.armazenamento.carregar(configuracao)
  .then(function (arm) {
    // Carrega os módulos de armazenamento
    meuObjt.armazenamento = arm;  
  })
  .then(function () {
    // Inicia rota de conexão
    meuObjt.rotaConexao = new baseBiblioteca.Rota.RotaConexao(meuObjt.armazenamento); 
  })
  .then(function () {
    // Carrega gerencia de conexão
    return meuObjt.gerenciaConexao.carregar(meuObjt.rotaConexao, configuracao);
  })
  .then(function () {
    // Carrega módulos de autenticação
    return meuObjt.autenticacao.carregar(meuObjt.rotaConexao, configuracao);
  })
  .then(function () {
    // parece que tudo ocorreu bem
    pronto();
  })
  .catch(function (err) {
    registrador.error(err);
  });
*/
}