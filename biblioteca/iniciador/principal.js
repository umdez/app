'use strict'

/*  Aqui iremos carregar tudo que é necessário para o servidor.
 *
 */

var xmpp = require('node-xmpp-server');

// Acessamos os arquivos base da nossa biblioteca.
var baseBiblioteca = require('../indice');

// Carrega todos os outros arquivos necessários
var registrador = require('../nucleo/Registrador')('principal'); 
var GerenciaConexao = require('./GerenciaConexao');
var Autenticacao = require('../nucleo/Autenticacao');
var Armazenamento = require('./Armazenamento');

exports.prosseguir = function(configuracao, pronto) {
  var esteObjeto = {};
  
  esteObjeto.rotaConexao = null;
  esteObjeto.armazenamento = new Armazenamento(configuracao);
  esteObjeto.gerenciaConexao = new GerenciaConexao();
  esteObjeto.autenticacao = new Autenticacao(configuracao);
  
  registrador.debug('Carrega os elementos base do nosso servidor');
  
  esteObjeto.armazenamento.carregar(configuracao)
  .then(function (arm) {
    // Carrega os módulos de armazenamento
    esteObjeto.armazenamento = arm;  
  })
  .then(function () {
      // Inicia rota de conexão
      esteObjeto.rotaConexao = new baseBiblioteca.Rota.RotaConexao(esteObjeto.armazenamento); 
  })
  .then(function () {
    // Carrega gerencia de conexão
    esteObjeto.gerenciaConexao.carregar(esteObjeto.rotaConexao, configuracao);
  })
  .then(function () {
    // Carrega módulos de autenticação
    return esteObjeto.autenticacao.carregar(esteObjeto.rotaConexao, configuracao);
  })
  .then(function () {
    // parece que tudo ocorreu bem
    pronto();
  })
  .catch(function (err) {
    registrador.error(err);
  });

}