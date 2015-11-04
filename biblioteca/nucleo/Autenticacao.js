'use strict';

var registrador = require('./Registrador')('autenticacao'); 
var baseBiblioteca = require('../indice'); // Acessamos os arquivos base do nosso servidor.
var Promessa = require('bluebird');

function Autenticacao() {}

Autenticacao.prototype.oauth2 = function (configuracao) {

  var autentOauth2 = null;
  if (configuracao.server) {
      autentOauth2 = new baseBiblioteca.Autenticacao.OAuth2({
      'url': configuracao.server
    });
  }
  return autentOauth2;
};

Autenticacao.prototype.simple = function (configuracao) {

  var autentSimples = new baseBiblioteca.Autenticacao.Simples();

  // registra usuários configurados
  if (configuracao.users) {
    configuracao.users.forEach(function (usuario) {
      autentSimples.adcUsuario(usuario.user, usuario.password);
    });
  }

  // registra usuário de teste
  if (configuracao.testusers) {
    // Aqui vamos registrar cerca de 10mil usuários para testar
  
    var baseUsuario = 'carregar'; 
    var baseSenha = 'senha';  // Senha base
    var quantidade = 10000;  //Quantidade de usuários 

    for (var i = 1; i <= quantidade; i++) {
      autentSimples.adcUsuario(baseUsuario + i, baseSenha + i);
    }

  }

  return autentSimples;
};

Autenticacao.prototype.carregar = function (rotaConexao, configuracao) {
  var esteObj = this;
  return new Promessa(function (deliberar, recusar) {
    registrador.debug('autenticacao');
    var autenticacao = configuracao.auth;

    if (autenticacao && autenticacao.length > 0) {
      autenticacao.forEach(function (modulo) {
        registrador.debug('Carrega módulo de autenticação ' + modulo.type);
        var m = esteObj[modulo.type](modulo);

        // Adiciona mecanismo de autenticação a rota conexão
        rotaConexao.adcMetodoAutenticacao(m);

      });
      deliberar();
    } else {
      recusar();
    }
  });
};

module.exports = Autenticacao;