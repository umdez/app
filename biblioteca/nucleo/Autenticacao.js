'use strict';

/* Realiza o carregamento dos método de autenticação com base naquilo que foi
 * configurado.
 */

var registrador = require('./Registrador')('Autenticacao'); 
var Base = require('../indice'); 
var Promessa = require('bluebird');

function Autenticacao(configuracao) {
  this.opcoes = {
    configuracao: configuracao
  };
}

/* Nossa autenticação anonymous requer apenas um nome de usuário.
 */
Autenticacao.prototype.anonymous = function (configuracao) {
  
  var autenticacao = new Base.Autenticacao.Anonimo();
  
  return autenticacao;
};

/* Nossa autenticação Oauth2 requer um nome de usuário e um token. No momento
 * nós ainda não implementamos o armazenamento no banco de dados. Deve ser
 * fornecido para este método um endereço de um servidor Oauth2.
 */
Autenticacao.prototype.oauth2 = function (configuracao) {

  var autenticacao = null;
  if (configuracao.servidor) {
      autenticacao = new Base.Autenticacao.OAuth2({
      'url': configuracao.servidor 
    });
  }
  return autenticacao;
};

/* Nossa autenticação simples requer um nome de usuário e a sua senha. No
 * momento nós ainda não implementamos o armazenamento no banco de dados.
 */
Autenticacao.prototype.simple = function (configuracao) {

  var autenticacao = new Base.Autenticacao.Simples();

  // Registra usuários configurados. Lembre-se que isso deve ser utilizado
  // apenas em modo de produção.
  if (configuracao.usuarios) {
    configuracao.usuarios.forEach(function (usuario) {
      autenticacao.adcUsuario(usuario.usuario, usuario.senha);
    });
  }

  // Registra os usuário de teste. Devemos utilizar isso apenas no modo de
  // produção.
  if (configuracao.testarUsuarios) {
    var baseUsuario = 'carregar'; 
    var baseSenha = 'senha';  
    var quantidade = 10000;  

    for (var i = 1; i <= quantidade; i++) {
      autenticacao.adcUsuario(baseUsuario + i, baseSenha + i);
    }
  }

  return autenticacao;
};

/* Percorremos as diversas autenticações disponiveis no arquivo de configuração
 * e as carregamos. Os tipos de autenticação disponiveis até o momento são:
 * simple, oauth2 e anonymous.
 */
Autenticacao.prototype.carregar = function (modulos) {
  var meuObj = this;
  var configuracao = this.opcoes.configuracao;
  var rotaDeConexao = modulos['rotas'].rotaDeConexao;

  return new Promessa(function (deliberar, recusar) {
    registrador.debug('Autenticacao');

    if (configuracao && configuracao.length > 0) {
      configuracao.forEach(function (item) {
        registrador.debug('Carrega módulo de autenticação ' + item.tipo);
        var metodo = meuObj[item.tipo](item);

        // Adiciona mecanismo de autenticação a rota conexão.
        rotaDeConexao.adcMetodoDeAutenticacao(metodo);
      });
      deliberar();
    } else {
      recusar();
    }
  });
};

module.exports = Autenticacao;