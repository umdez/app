'use strict';

var util = require('util');
var Autenticador = require('./Autenticador');
var JID = require('node-xmpp-core').JID;
var Promessa = require('bluebird');
var registrador = require('../nucleo/Registrador')('autenticadorsimples');

/**
 * Atenção: Esta implementação é planejada para desenvolvimento e testes.
 * não é para ser utilizada no produto final.
 */
function Simples() {
  this.usuarios = {};
}
util.inherits(Simples, Autenticador);

Simples.prototype.nome = 'Simples';

Simples.prototype.adcUsuario = function (nomeUsuario, senha) {
  this.usuarios[nomeUsuario] = senha;
};

Simples.prototype.seCorresponder = function (metodo) {
  if (metodo === 'PLAIN') {
    return true;
  }
  return false;
};

Simples.prototype.autenticar = function (opcs) {
  registrador.debug('Autenticar');
  var esteObj = this;

  return new Promessa(function (deliberar, recusar) {

    var nomeUsuario = null;

    // pegamos o nome de usuário
    if (opcs.jid) {
      nomeUsuario = new JID(opcs.jid.toString()).getLocal();
    } else if (opcs.username) {
      nomeUsuario = opcs.username;
    }

	// Usuário é autenticado
    if (esteObj.usuarios[nomeUsuario] === opcs.password) {
      registrador.debug(nomeUsuario + ' foi autenticado com sucesso.');
      delete opcs.password;
      deliberar(opcs);
    }
    // error
    else {
      delete opcs.password;
      recusar('user not found');
    }
  });
};

module.exports = Simples;
