'use strict';

var util = require('util');
var XRotas = require('../nucleo/XRotas');
var Promessa = require('bluebird');
var JID = require('node-xmpp-core').JID;
var VerificaXmpp = require('../nucleo/VerificaXmpp');
var Registrador = require('../nucleo/Registrador')('rotasconexao');

/**
 * Gerencia as conexões e roteia as solicitações para outras rotas
 *
 * Afazer: Verificar se os valores de to e from são adequados para o cliente, rejeitar mensagens onde o valor do from não é adequado.
 */
function RotaConexao(storage) {
  XRotas.call(this);

  //this.storage = storage;

  // Gerência de conexões, por exemplo, tcp, bosh etc
  this.gerenciaConexoes = [];

  // Modulos de autenticação
  this.metodosAutenticacao = [];

  // Seções conectadas de todas gerências de conexão
  this.secoes = {};
  this.contador = 0;
}
util.inherits(RotaConexao, XRotas);

RotaConexao.prototype.nome = 'RotaConexao';

RotaConexao.prototype.seCorresponder = function (stanza) {
  var seCorresponder = false;

  if (stanza.attrs && stanza.attrs.to) {
    var paraJid = new JID(stanza.attrs.to);

	// envia para todos clientes locais, verifica se o JID confere
    if (this.secoes.hasOwnProperty(paraJid.bare().toString())) {
      seCorresponder = true;
    }
  }

  return seCorresponder;
};

RotaConexao.prototype.adcMetodoAutenticacao = function (metodo) {
  this.metodosAutenticacao.push(metodo);
};

RotaConexao.prototype.procurarMetodoAutenticacao = function (metodo) {
  var encontrados = [];
  for (var i = 0; i < this.metodosAutenticacao.length; i++) {
    if (this.metodosAutenticacao[i].seCorresponder(metodo)) {
      encontrados.push(this.metodosAutenticacao[i]);
    }
  }
  return encontrados;
};

/**
 * Passo adicional de verificação da informação do cliente
 * @param informação de valores chave das opções do cliente
 */
RotaConexao.prototype.verificarCliente = function (opcs) {
  Registrador.debug('Verificando cliente');

  for (var atrb in opcs) {
    if (opcs.hasOwnProperty(atrb)) {
      Registrador.debug(atrb + ' -> ' + opcs[atrb]);
    }
  }
/*
  var storage = this.storage;

  return new Promise(function(resolve, reject) {
    // store the name if we got him
    if (opcs.jid) {
      logger.debug('update name of user');
      // we do not need to wait here, lets do this in background
      // find or create user and update name

      var transaction = null;
      var usr = null;
      storage.sequelize.transaction().then(function (t) {
        transaction = t;
        return storage.findOrCreateUser(opcs.jid.toString(), {
          transaction: t
        })
      }).spread(function(user, created) { // jshint ignore:line
        usr = user;
        if (opcs.name) {
          usr.name = opcs.name;
        }
        return transaction.commit();
      }).then(function(){
        logger.debug(JSON.stringify(usr));
        resolve(usr);
      }).catch(function(err){
        logger.error(err);
        transaction.rollback();
        reject(err);
      })
    } else {
      reject('parameter for authentication is missing')
    }
  })
*/
};

RotaConexao.prototype.autenticar = function (opcs, cd) {
  var esteObjeto = this;

  try {

    for (var atrb in opcs) {
      if (opcs.hasOwnProperty(atrb)) {
        logger.debug(atrb + ' -> ' + opcs[atrb]);
      }
    }

    logger.debug('start authentication process');
    var auth = this.procurarMetodoAutenticacao(opcs.saslmech);
    if (auth.length > 0) {
      auth[0].authenticate(opcs).then(function (user) {
        logger.debug('xmpp user authenticated');

        // merge properties
        for (var property in user) {
          if (user.hasOwnProperty(property)) {
            opcs[property] = user[property];
          }
        }

        esteObjeto.verificarCliente(opcs).then(function () {
          logger.debug('user verified')
          // call callback
          cd(null, opcs);
        }).
        catch(function (err) {
          logger.error(err);
          cd('user verification failed');
        });

      }).
      catch(function (err) {
        logger.error('xmpp user authentication failed' + err);
        cd('xmpp could not authenticate user');
      });

    } else {
      // throw error
      logger.error('cannot handle %s', opcs.saslmech);
      cd(new Error('user not found'));
    }

  } catch (err) {
    logger.error(err.stack);
    cd(new Error('user not found'));
  }
};

RotaConexao.prototype.register = function (opts, cd) {
  // is not implemented, but only relevant for server
  logger.debug('register');

  var err = new Error('not allowed');
  err.code = 123;
  err.type = 'abort';
  cd(err);
};

/**
 * inbound communication
 */
RotaConexao.prototype.handle = function (stanza) {

  // verify we have a to adress
  if (!stanza.attrs.to) {
    stanza.attrs.to = new JID(stanza.attrs.from).getDomain();
  }

  logger.debug('emit stanza: ' + stanza.toString());
  this.emit('stanza', stanza);
};

/**
 * outbound communication
 */
RotaConexao.prototype.send = function (stanza) {
  var sent = false
  try {
    // logger.debug('deliver:' + stanza.root().toString());
    var esteObjeto = this;

    if (stanza.attrs && stanza.attrs.to) {
      var toJid = new JID(stanza.attrs.to);

      // send to all local clients, check if jid is there
      if (esteObjeto.secoes.hasOwnProperty(toJid.bare().toString())) {
        // Now loop over all the sesssions and only send to the right jid(s)
        var resource;
        for (resource in esteObjeto.secoes[toJid.bare().toString()]) {
          if (toJid.bare().toString() === toJid.toString() || toJid.resource === resource) {
            logger.debug('send message to resource: ' + resource);
            esteObjeto.secoes[toJid.bare().toString()][resource].send(stanza);
            sent = true;
          }
        }

        // we couldn't send the stanza
        if (!sent) {
          logger.error(stanza.root().toString() + ' could not be delivered');
        }
      } else {
        logger.warn('could not deliver: ' + stanza.toString());
      }
    }
  } catch (err) {
    logger.error(err.stack);
  }

  return sent;
};

/**
 * Registers a route (jid client connection)
 */
RotaConexao.prototype.registerRoute = function (jid, client) {
  try {
    logger.debug('register jid ' + jid);
    // TODO check for conflicts
    if (!this.secoes.hasOwnProperty(jid.bare().toString())) {
      this.secoes[jid.bare().toString()] = {};
    }

    this.secoes[jid.bare().toString()][jid.resource] = client;
  } catch (err) {
    logger.error(err.stack);
  }
  return true;
};

/**
 * Unregisters a route (jid client connection)
 */
RotaConexao.prototype.unregisterRoute = function (jid) {
  try {
    logger.debug('unregister jid ' + jid);
    if (jid && jid.bare()) {
      if (this.secoes.hasOwnProperty(jid.bare().toString())) {
        delete this.secoes[jid.bare().toString()][jid.resource];
      }
    }
  } catch (err) {
    logger.error(err.stack);
  }

  return true;
};

/**
 * Returns the list of jids connected for a specific jid.
 */
RotaConexao.prototype.connectedClientsForJid = function (jid) {
  try {
    jid = new JID(jid);
    if (!this.secoes.hasOwnProperty(jid.bare().toString())) {
      return [];
    } else {
      var jids = [];
      var resources = this.secoes[jid.bare().toString()];
      for (var resource in resources) {
        if (resources.hasOwnProperty(resource)) {
          jids.push(new JID(jid.bare().toString() + '/' + resource));
        }
      }
      return jids;
    }
  } catch (err) {
    logger.error(err.stack);
    return [];
  }
};

RotaConexao.prototype.connect = function (jid, stream) {
  try {
    if (jid) {
      this.registerRoute(jid, stream);
      this.emit('connect', jid);
    }
  } catch (err) {
    logger.error(err);
  }
};

RotaConexao.prototype.disconnect = function (jid, stream) {
  try {
    this.unregisterRoute(jid, stream);
    this.emit('disconnect', jid);
  } catch (err) {
    logger.error(err.stack);
  }
};

RotaConexao.prototype.verifyStanza = function (stream, stanza) {
  try {
    // verify xmpp stanza
    var error = XmppVerify.invalidfrom(stream, stanza);

    if (error) {
      logger.warn(error);
      // stream.error(error);
    }

    // forward stanza to route
    this.handle(stanza);

  } catch (err) {
    logger.error(err.stack);
  }
};

/**
 * Takes a stream and registers event handler
 * @param   stream node-xmpp stream
 */
RotaConexao.prototype.registerStream = function (stream) {

  this.contador++;

  logger.debug('register new stream' + this.contador);

  var esteObjeto = this;

  // Allows the developer to authenticate users against anything they
  // want.
  stream.on('authenticate', function (opts, cd) {
    esteObjeto.autenticar(opts, cd);
  });

  // Allows the developer to register the jid against anything they want
  stream.on('register', function (opts, cd) {
    esteObjeto.register(opts, cd);
  });

  // socket events from node-xmpp connection
  stream.on('end', function () {
    // connection is ended, then closed
    // @see http://nodejs.org/api/net.html#net_event_end
    logger.debug('client connection end');
  });

  stream.on('online', function () {
    logger.debug('ONLINE: ' + stream.jid.toString());
    // forward event to router
    esteObjeto.connect(stream.jid, stream);
  });

  stream.on('close', function () {
    // forward event to router
    esteObjeto.disconnect(stream.jid, stream);
  });

  stream.on('stanza', function (stanza) {
    logger.debug('incomming message: ' + stanza.toString());
    esteObjeto.verifyStanza(stream, stanza);
  });

  // base router events
  stream.on('connect', function () {
    esteObjeto.contador--;
    esteObjeto.connect(stream.jid, stream);
  });

  stream.on('disconnect', function () {
    esteObjeto.disconnect(stream.jid, stream);
  });

};

RotaConexao.prototype.unregisterStream = function () {
  // TODO implement
};

// add multiple connection manager
RotaConexao.prototype.addConnectionManager = function (connMgr) {
  logger.debug('load connection manager: ' + connMgr.name);

  // store connection manager
  this.gerenciaConexoes.push(connMgr);

  // attach to events from connection and forward them 
  // to the connection router
  var esteObjeto = this;
  connMgr.on('connect', function (stream) {
    esteObjeto.registerStream(stream);
  });

};

// shutdown the connection manger
RotaConexao.prototype.stopConnections = function () {
  logger.info('shutdown all connections');

  for (var i = 0, l = this.gerenciaConexoes.length; i < l; i++) {
    this.gerenciaConexoes[i].shutdown();
  }
};

module.exports = RotaConexao;