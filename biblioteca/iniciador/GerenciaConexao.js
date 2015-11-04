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

  return cs2;
};

GerenciaConexao.prototype.bosh = function (dominio, chaves, configuracao, multiPortas, subPasta) { // jshint ignore:line
  var boshSettings = null;
  var multiportActive = false;
  if (multiPortas && ((configuracao.port === multiPortas.port) || (!configuracao.port))) {
    boshSettings = {
      autostart: false
    };
    registrador.debug('use multiport for bosh');
    multiportActive = true;
  } else if (configuracao.port) {
    boshSettings = {
      'port': configuracao.port
    };
  } else {
    registrador.error('could not determine a port for socketio');
  }

  // BOSH Server
  var bosh = new xmpp.BOSHServer(boshSettings);

  if (multiportActive) {
    var app = multiport.app;

    // start bosh service
    app.post('/' + configuracao.path, function (req, res) {
      bosh.bosh.handleHTTP(req, res);
    });

    app.post('/' + configuracao.path + '/*', function (req, res) {
      bosh.bosh.handleHTTP(req, res);
    });
  }

  return bosh;
};

GerenciaConexao.prototype.websocket = function (dominio, chaves, configuracao) {
  // Websocket Server
  var ws = new xmpp.WebSocketServer({
    'port': configuracao.port,
    'domain': dominio,
    'autostart': false
  });
  return ws;
};

/* <umdez> Remover isto?
GerenciaConexao.prototype.engineio = function (dominio, chaves, configuracao, multiPortas, subPasta) {
  // Engine IO Server
  var eioSetttings = {
    'domain': dominio,
    'autostart': false,
    'subpath': subPasta
  };

  if (multiPortas && ((configuracao.port === multiPortas.port) || (!configuracao.port))) {
    eioSetttings.server = multiPortas.server;
    registrador.debug('use multiport for engine.io');
  } else if (configuracao.port) {
    eioSetttings.port = configuracao.port;
  } else {
    registrador.error('could not determine a port for engine.io');
  }

  // Engine.io Server
  var eio = new xmpp.EioServer(eioSetttings);

  return eio;
};
*/

GerenciaConexao.prototype.socketio = function (dominio, chaves, configuracao, multiPortas) {
  var sioSettings = {
    'domain': dominio,
    'autostart': false
  };

  if (multiPortas && ((configuracao.port === multiPortas.port) || (!configuracao.port))) {
    sioSettings.server = multiPortas.server;
    registrador.debug('use multiport for socket.io');
  } else if (configuracao.port) {
    sioSettings.port = configuracao.port;
  } else {
    registrador.error('could not determine a port for socket.io');
  }

  // Socket.io Server
  var sio = new xmpp.SioServer(sioSettings);
  return sio;
};

GerenciaConexao.prototype.carregar = function (rotaConexao, configuracao) {
  var esteObjeto = this;
  return new Promessa(function (deliberar, recusar) {

    var dominio = configuracao.dominio;
    var subPasta = configuracao.subpath || '';
	
	// Carrega configuração para a gerencia de conexão
    var gerConConfiguracao = configuracao.connection;
    var multiPortas = configuracao.multiport; // <umdez> Mas o que realmente multiplas portas significa?

    if (gerConConfiguracao && gerConConfiguracao.length > 0) {

      esteObjeto.carregaCertificado().then(function (chaves) {

        // Percorre cada tipo de conexões
        gerConConfiguracao.forEach(function (item) {

          if (esteObjeto[item.type]) {
            var gerCon = esteObjeto[item.type](dominio, chaves, item, multiPortas, subPasta);
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
