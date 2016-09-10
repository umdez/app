'use strict'

/* Aqui iremos carregar tudo que é necessário para o servidor.
 */

var xmpp = require('node-xmpp-server');

var Base = require('../indice');
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaDeConexao = require('./GerenciaDeConexao');
var Autenticacao = require('../nucleo/Autenticacao');
var Armazenamento = require('./Armazenamento');
//var ServicoRestApi = require('servidor-xmpp-restapi');

exports.prosseguir = function(configuracao, pronto) {
  var meuObjt = {};
  
  var modulos = [];

  var bd = modulos['bd'] = {
    'armazenamento': new Armazenamento(configuracao.armazenamento)
  , 'instancia': null
  , 'modelos': null
  , 'sequelize': null
  };

  var rotas = modulos['rotas'] = {
    'rotaDeConexao': null
  };

  var conexao = modulos['conexao'] = {
    'gerenciaDeConexao': new GerenciaDeConexao(configuracao.conexao)
  };

  var autentic = modulos['autentic'] = {
    'autenticacao': new Autenticacao(configuracao.autenticacao)
  };

  var armazenamento = bd.armazenamento;
  var gerenciaDeConexao = conexao.gerenciaDeConexao;
  var autenticacao = autentic.autenticacao;

  registrador.debug('Carregando os módulos base do nosso servidor xmpp.');

  armazenamento.carregar(modulos).then(function (instancia) { 
    bd.instancia = instancia;
  })
  .then(function () {
    rotas.rotaDeConexao = new Base.Rota.RotaDeConexao(modulos); 
  })
  .then(function () {
    return gerenciaDeConexao.carregar(modulos);
  })
  .then(function () {
    return autenticacao.carregar(modulos);
  })
  .then(function () {
    pronto();
  })
  .catch(function (erro) {
    registrador.error(erro);
  });

}