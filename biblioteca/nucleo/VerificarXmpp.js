'use strict';

var Registrador = require('./Registrador')('VerificarXmpp');
var JID = require('node-xmpp-core').JID;

var VerificarXmpp = function () {};

VerificarXmpp.prototype = {

  /**
   * @veja http://tools.ietf.org/html/rfc3920#section-4.7.3 <invalid-from/>
   *
   * @param  node-xmpp stream
   * @param  node-xmpp xml stanza
   * @return xmpp error type
   */
  remetenteInvalido: function (stream, stanza) {
    var remetenteJID = new JID(stanza.attrs.from);
    var streamJID = stream.jid;

    Registrador.debug('Verificação do remetente JID ' + remetenteJID + ' com JID de cliente ' + streamJID);

    if (!streamJID.equals(remetenteJID)) {
      Registrador.error('Verificação dos JIDs falhou');
      return 'invalid-from';
    } else {
      return null;
    }
  }
};

module.exports = new VerificarXmpp();
