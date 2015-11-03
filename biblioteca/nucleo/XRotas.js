'use strict';

var util = require('util');
var EmissorEvento = require('events').EventEmitter;
var ltx = require('ltx');
var registrador = require('./Logger')('xrotas');

function XRotas() {
  
  EmissorEvento.call(this);
}

// Adiciona suporte a eventos na nossa classe
util.inherits(XRotas, EmissorEvento);

XRotas.prototype.nome = 'XRotas';

/**
 * Tenta saber se o módulo é correspondente para esta stanza.
 * Este método dever otimizado ao máximo porque vai ser chamado constantemente.
 */
XRotas.prototype.seCorresponder = function (stanza) {}; // jshint ignore:line

/**
 * Manipula as stanzas do xmpp.
 * Este método será chamado logo após ser verificado que a stanza corresponde.
 * Porque precisamos saber se a stanza é adequada para ser manipulada.
 */
XRotas.prototype.manipular = function (stanza) {}; // jshint ignore:line

/**
 * Envia mensagens e começa a fazer o roteamento.
 */
XRotas.prototype.enviar = function (stanza) {
  // logger.debug(this.name + ' send stanza: ' + stanza.toString());
  this.emit('enviar', stanza);
};

/**
 * Envia um erro para o remetente originário da mensagem
 *
 * @param mensagem stanza vinda do remetente originário
 * @param mensagem de erro a ser enviada para remetente
 */
XRotas.prototype.enviarErro = function (stanza, erro) {

  // Cria o XML de resposta
  var resposta = new ltx.Element(stanza.getName(), {
    from: stanza.attrs.to,
    to: stanza.attrs.from,
    id: stanza.attrs.id,
    type: 'error'
  });

  // Anexar detalhes do erro
  if (erro) {
    resposta.cnode(erro);
  }

  // enviamos a resposta para o remetente
  this.enviar(resposta);
};

/**
 * Responde com mensagem de sucesso para o remetente originário
 *
 * @param stanza original do remetente originários
 * @param texto que a mensagem vai conter
 */
XRotas.prototype.enviarSucesso = function (stanza, detalhe) {
	
  // Criamos o XML de resposta
  var resposta = new ltx.Element('iq', {
    from: stanza.attrs.to,
    to: stanza.attrs.from,
    id: stanza.attrs.id,
    type: 'result'
  });

  // anexa detalhe
  if (detalhe) {
    resposta.cnode(detalhe);
  }
  // Enviamos a stanza com detalhe anexado para o remetente
  this.enviar(resposta);
};

XRotas.prototype.adcEscutaPara = function (rota) {
  var esteObjeto = this;
  
  // Adiciona evento de stanza para a rota
  rota.on('stanza', function (stanza) {
    if (stanza) {
      // logger.debug(rota.nome + ' forward to ' + esteObjeto.nome + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      esteObjeto.manipular(stanza);
    }
  });
};

XRotas.prototype.encadearRotas = function (rota) {
  var esteObjeto = this;

  // despacha eventos para a rota
  rota.adcEscutaPara(this);

  // despacha evento inverso para a rota
  rota.on('enviar', function (stanza) {
    if (stanza) {
      //logger.debug(rota.nome + ' send out to ' + esteObjeto.nome + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      esteObjeto.enviar(stanza);
    }
  });

  return rota;
};

module.exports = XRotas;