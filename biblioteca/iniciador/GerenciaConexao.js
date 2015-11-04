'use strict';

var registrador = require('../nucleo/Registrador')('gerenciaconexao');
var baseBiblioteca = require('../indice');
var Promessa = require('bluebird');
var pem = require('pem');
var xmpp = require('node-xmpp-server');

function GerenciaConexao() {}

GerenciaConexao.prototype.carregaCertificado = function () {
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

GerenciaConexao.prototype.tcp = function (dominio, chaves, configuracao) {
  // C2S com encriptação TLS
  var cs2 = null;
  var tls = null;
  tls = {
    key: chaves.serviceKey + '\n',
    cert: chaves.certificate + '\n'
  };
  tls.ca = tls.cert;

  cs2 = new xmpp.C2SServer({
    'port': configuracao.port,
    'domain': dominio,
    'requestCert': true,
    'rejectUnauthorized': false,
    'tls': tls
  });

  cs2.nome = 'tcp + tls';
  return cs2;
};

GerenciaConexao.prototype.bosh = function (dominio, chaves, configuracao) { // jshint ignore:line
  var configuracoesBosh = null;
  
  if (configuracao.port) {
    configuracoesBosh = {
      'port': configuracao.port,
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

GerenciaConexao.prototype.websocket = function (dominio, chaves, configuracao) {
  // Servidor Websocket
  var ws = new xmpp.WebSocketServer({
    'port': configuracao.port,
    'domain': dominio,
    'autostart': false
  });
  
  ws.nome = 'websocket';
  return ws;
};

GerenciaConexao.prototype.carregar = function (rotaConexao, configuracao) {
  var esteObjeto = this;
  return new Promessa(function (deliberar, recusar) {

	// Carrega configuração para a gerencia de conexão
    var gerConConfiguracao = configuracao.connection;
    
    if (gerConConfiguracao && gerConConfiguracao.length > 0) {

      esteObjeto.carregaCertificado().then(function (chaves) {

        // Percorre cada tipo de conexões
        gerConConfiguracao.forEach(function (item) {

          if (esteObjeto[item.type]) {
            var gerCon = esteObjeto[item.type](item.domain, chaves, item);
            if (gerCon) {
              gerCon.registerSaslMechanism(xmpp.auth.Plain);
              gerCon.registerSaslMechanism(xmpp.auth.XOAuth2);
              rotaConexao.adcGerenciaConexao(gerCon);
            }
          } else {
            registrador.warn(item.type + ' não é suportado como gerencia de conexão');
          }
        });
      });
      deliberar();
    } else {
      recusar('Não possui gerencia de conexões definida na configuração');
    }
  });
};
module.exports = GerenciaConexao;
