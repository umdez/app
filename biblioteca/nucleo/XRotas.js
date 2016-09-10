'use strict';

/* Faz o roteamento das stanzas. Verificando se a stanza corresponde, se
 * correponder a stanza é manipulada.
 */

var utilitario = require('util');
var EmissorDeEvento = require('events').EventEmitter;
var ltx = require('ltx');
var registrador = require('./Registrador')('XRotas');

function XRotas() {
  EmissorDeEvento.call(this);
}

utilitario.inherits(XRotas, EmissorDeEvento);

XRotas.prototype.nome = 'XRotas';

/* Tenta saber se o módulo é correspondente para esta stanza. Este método dever
 * otimizado ao máximo porque vai ser chamado constantemente.
 */
XRotas.prototype.seCorresponder = function (stanza) {}; // jshint ignore:line

/* Manipula as stanzas do xmpp. Este método será chamado logo após ser
 * verificado que a stanza corresponde. Porque precisamos saber se a stanza é
 * adequada para ser manipulada.
 */
XRotas.prototype.manipular = function (stanza) {}; // jshint ignore:line

/* Envia mensagems e começa a fazer o roteamento.
 */
XRotas.prototype.enviar = function (stanza) {
  registrador.debug(this.nome + ' envia stanza: ' + stanza.toString());
  this.emit('send', stanza);
};

/* Envia um erro para o remetente originário da mensagem
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

/* Responde com mensagem de sucesso para o remetente originário
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
  var meuObj = this;
  
  // Adiciona evento de stanza para a rota
  rota.on('stanza', function (stanza) {
    if (stanza) {
      registrador.debug(rota.nome + ' despacha para ' + meuObj.nome + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      meuObj.manipular(stanza);
    }
  });
};

XRotas.prototype.encadearRotas = function (rota) {
  var meuObj = this;

  // despacha eventos para a rota
  rota.adcEscutaPara(this);

  // despacha evento inverso para a rota
  rota.on('send', function (stanza) {
    if (stanza) {
      registrador.debug(rota.nome + ' envia para fora para ' + meuObj.nome + ':  ' + stanza.attrs.from + ' -> ' + stanza.attrs.to);
      meuObj.enviar(stanza);
    }
  });

  return rota;
};

module.exports = XRotas;