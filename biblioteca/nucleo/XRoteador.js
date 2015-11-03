'use strict';

var util = require('util');
var EmissorEvento = require('events').EventEmitter;
var ltx = require('ltx');
var registrador = require('./Logger')('xroteador');

function XRoteador() {
  EmissorEvento.call(this);
}

// Adiciona suporte a eventos na nossa classe
util.inherits(XRoteador, EmissorEvento);

XRoteador.prototype.nome = 'XRoteador';

/**
 * Tenta saber se o módulo é correspondente para esta stanza.
 * Este método dever otimizado ao máximo porque vai ser chamado constantemente.
 */
XRoteador.prototype.corresponder = function (stanza) {}; // jshint ignore:line

/**
 * Manipula as stanzas do xmpp.
 * Este método será chamado logo após ser verificado que a stanza corresponde.
 * Porque precisamos saber se a stanza é adequada para ser manipulada.
 */
XRoteador.prototype.manipular = function (stanza) {}; // jshint ignore:line

/**
 * Envia mensagens e começa a fazer o roteamento.
 */
XRoteador.prototype.enviar = function (stanza) {
  // logger.debug(this.name + ' send stanza: ' + stanza.toString());
  this.emit('send', stanza);
};

/**
 * Send an error to the original sender of the message
 *
 * @params stanza original message from the sender
 */
XRoute.prototype.sendError = function (stanza, err) {
  var response = new ltx.Element(stanza.getName(), {
    from: stanza.attrs.to,
    to: stanza.attrs.from,
    id: stanza.attrs.id,
    type: 'error'
  });

  // attach error detail
  if (err) {
    response.cnode(err);
  }

  this.send(response);
};

/**
 * Respond with success to the original message
 *
 * @params stanza original message from the sender
 */
XRoute.prototype.sendSuccess = function (stanza, detail) {
  var response = new ltx.Element('iq', {
    from: stanza.attrs.to,
    to: stanza.attrs.from,
    id: stanza.attrs.id,
    type: 'result'
  });

  // attach error detail
  if (detail) {
    response.cnode(detail);
  }

  this.send(response);
};

XRoute.prototype.listenTo = function (route) {
  var self = this;
  route.on('stanza', function (stanza) {
    if (stanza) {
      logger.debug(route.name + ' forward to ' + self.name + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      self.handle(stanza);
    }
  });
};

XRoute.prototype.chain = function (route) {
  var self = this;

  // forward stream eventing
  route.listenTo(this);

  // backward stream eventing
  route.on('send', function (stanza) {
    if (stanza) {
      logger.debug(route.name + ' send out to ' + self.name + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      self.send(stanza);
    }
  });

  return route;
};

module.exports = XRoute;