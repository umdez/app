'use strict'

/* Aqui iremos carregar tudo que é necessário para o servidor.
 */

var xmpp = require('node-xmpp-server');

var Base = require('../indice');
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaDeConexao = require('./GerenciaDeConexao');
//var Autenticacao = require('../nucleo/Autenticacao');
var Armazenamento = require('./Armazenamento');
//var ServicoRestApi = require('servidor-xmpp-restapi');

exports.prosseguir = function(configuracao, pronto) {
  var meuObjt = {};
  
  var modulos = [];

  var bd = modulos['bd'] = {
    'armazenamento': new Armazenamento(configuracao.armazenamento),
    'modelos': null,
    'sequelize': null
  };

  var rotas = modulos['rotas'] = {
    'rotaDeConexao': null
  };

  var conexao = modulos['conexao'] = {
    'gerenciaDeConexao': new GerenciaDeConexao(configuracao.conexao)
  };

  var armazenamento = bd.armazenamento;
  var rota = rotas.rotaDeConexao;
  var gerenciaDeConexao = conexao.gerenciaDeConexao;

  registrador.debug('Carregando os módulos base do nosso servidor xmpp.');

  armazenamento.carregar(modulos).then(function (armazenamento) { 

  })
  .then(function () {
    rota = new Base.Rota.RotaDeConexao(modulos); 
  })
  .then(function () {
    //gerenciaDeConexao.carregar(modulos);
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
    meuObjt.rotaConexao = new Base.Rota.RotaConexao(meuObjt.armazenamento); 
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