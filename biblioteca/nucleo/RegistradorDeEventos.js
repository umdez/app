'use strict';

/* Aqui faremos o registro para cada um dos eventos dos objetos relacionados a
 * determinado gerente de conexões, incluindo as rotas, gerenciamento de sessão,
 * rotas S2S, as conexões etc. @veja http://xmpp.org/extensions/xep-0160.html
 */

var registrador = require('./Registrador')('RegistradorDeEventos');

function RegistradorDeEventos() {
  this.seLigar = true; 
}

/* Se for ligado irá fazer o registro dos eventos para um dado servidor.
 */
RegistradorDeEventos.prototype.adcRegistroDeEventosPara = function (GerenciaDeConexao) {
  
  if (!this.seLigar) {
    return;
  }
  
  var formatarRegistro = function(stream, mensagem) {
    return [ stream.streamId, mensagem].join(' '); 
  }  
	  
  GerenciaDeConexao.on('connect', function(stream) {
    registrador.debug(formatarRegistro(stream, 'Conectado'));

    stream.on('online', function() {
      registrador.debug(formatarRegistro(stream, 'online ' + stream.jid));
    });

    stream.on('connect', function () {
      registrador.debug(formatarRegistro(stream, 'online ' + stream.jid) ); 
    });
	
    stream.on('authenticate', function(opcs, chamarDepois) {
      registrador.debug('Autenticação do stream.');
    });
	
    stream.on('register', function(opcs, chamarDepois) {
      registrador.debug('Registro requisitado pelo stream.');
    });
	
    stream.on('disconnect', function () {
      console.log('Stream desconectado');
    });

    stream.on('end', function () {
      // A conexão é finalizada e então fechada.
      // @veja http://nodejs.org/api/net.html#net_event_end
      registrador.debug('Conexão do stream fechada');
    });

    stream.on('online', function () {
      registrador.debug('Stream online: ' + stream.jid.toString());
    });

    stream.on('close', function () {
      registrador.debug('Stream fechou conexão');
    });

    stream.on('stanza', function (stanza) {
      registrador.debug('mensagem recebida : ' + stanza.toString());
    });
  });

};

module.exports = RegistradorDeEventos;
