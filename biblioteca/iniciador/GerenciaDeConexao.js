'use strict';

/* Realiza o carregamento das conexões com base naquilo que foi configurado.
 */

var registrador = require('../nucleo/Registrador')('GerenciaDeConexao');
var baseBiblioteca = require('../indice');
var Promessa = require('bluebird');
var pem = require('pem');
var xmpp = require('node-xmpp-server');

function GerenciaDeConexao(configuracao) {

  this.opcoes = {
    configuracao: configuracao
  };
}

/* Carregamos aqui os certificados, serão utilizados nas conexões do tipo tcp.
 */
GerenciaDeConexao.prototype.carregarCertificado = function () {
  return new Promessa(function (deliberar, recusar) {
    pem.createCertificate({
      days: 1,
      selfSigned: true,
      organization: 'node-xmpp team',
      organizationUnit: 'development',
      commonName: 'node-xmpp.org'

    }, function (err, chaves) {
      if (err) {
        recusar(err);
      } else {
        deliberar(chaves);
      }
    });
  });
};

/* Nossa conexão do tipo tcp.
 */
GerenciaDeConexao.prototype.tcp = function (dominio, chaves, configuracao) {
  // C2S com encriptação TLS
  var cs2 = null;
  var tls = null;
  tls = {
    key: chaves.serviceKey + '\n',
    cert: chaves.certificate + '\n'
  };
  tls.ca = tls.cert;

  cs2 = new xmpp.C2SServer({
    'port': configuracao.porta,
    'domain': dominio,
    'requestCert': true,
    'rejectUnauthorized': false,
    'tls': tls
  });

  cs2.nome = 'tcp + tls';
  return cs2;
};

/* Nossa conexão do tipo bosh.
 */
GerenciaDeConexao.prototype.bosh = function (dominio, chaves, configuracao) { // jshint ignore:line
  var configuracoesBosh = null;
  
  if (configuracao.port) {
    configuracoesBosh = {
      'port': configuracao.porta,
	    'domain': dominio
    };
  } else {
    registrador.error('Não foi possivel determinar a porta para o servidor BOSH');
  }

  // Servidor BOSH 
  var bosh = new xmpp.BOSHServer(configuracoesBosh);

  bosh.nome = 'bosh';
  return bosh;
};

/* Nossa conexão do tipo websocket.
 */
GerenciaDeConexao.prototype.websocket = function (dominio, chaves, configuracao) {
  // Servidor Websocket
  var ws = new xmpp.WebSocketServer({
    'port': configuracao.porta,
    'domain': dominio,
    'autostart': false
  });
  
  ws.nome = 'websocket';
  return ws;
};

/* Percorremos as diversas conexões disponiveis no arquivo de configuração e as
 * carregamos. Os tipos de autenticação disponiveis até o momento são: tcp, bosh
 * e websocket.
 */
GerenciaDeConexao.prototype.carregar = function (modulos) {
  var meuObj = this;
  this.opcoes.modulos = modulos;
  
  return new Promessa(function (deliberar, recusar) {
    
    var configuracao = meuObj.opcoes.configuracao; 
    var rotaDeConexao = meuObj.opcoes.modulos['rotas'].rotaDeConexao;

    if (configuracao && configuracao.length > 0) {

      meuObj.carregarCertificado().then(function (chaves) {

        // Percorre cada tipo de conexões
        configuracao.forEach(function (item) {

          if (meuObj[item.tipo]) {
            var gerCon = meuObj[item.tipo](item.dominio, chaves, item);
            if (gerCon) {
              // Para cada uma das conexões nós registramos os tipos de
              // autenticação que podem ser utilizadas.
              gerCon.registerSaslMechanism(xmpp.auth.Plain);
              gerCon.registerSaslMechanism(xmpp.auth.XOAuth2);
              gerCon.registerSaslMechanism(xmpp.auth.Anonymous);
              
              // Acrescentamos este tipo de conexão a rotaDeConexao.
              rotaDeConexao.adcGerenciaDeConexao(gerCon);
            }
          } else {
            registrador.warn(item.tipo + ' não é suportado como gerencia de conexão');
          }
        });
      });
      deliberar();
    } else {
      recusar('Não possui esta gerencia de conexões definida na configuração');
    }
  });
};
module.exports = GerenciaDeConexao;
