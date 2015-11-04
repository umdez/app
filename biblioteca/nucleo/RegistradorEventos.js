'use strict';

var registrador = require('winston');

function RegistradorEventos() {
  
}

/* Se for ligado vai fazer o registro dos eventos para um dado servidor.
 *
 * @param o determinado gerenciador de conexões em que iremos registrar os eventos
 */
RegistradorEventos.prototype.adcRegistroEventosPara = function (GerenConex) {
  
  // Aqui faremos o registro para cada um dos eventos 
  // Aqui conseguiremos escutar os eventos em todos objetos ligados aquele gerente de conexão, incluindo as rotas, 
  // gerenciamento de sessão, rotas S2S, as conexões, etc.
	  
  // http://xmpp.org/extensions/xep-0160.html
  var formatarRegistro = function(stream, mensagem) {
    return [ stream.streamId, mensagem].join(' '); 
  }  
	  
  GerenConex.on('connect', function(stream) {
    registrador.debug(formatarRegistro(stream, 'Conectado'));

    stream.on('session-started', function() {
      registrador.info(formatarRegistro(stream, stanza.toString()));
    });

    stream.on('auth-success', function(jid) {
      registrador.info(formatarRegistro(stream, 'auth-success ' + jid));
    });

    stream.on('online', function() {
      registrador.info(formatarRegistro(stream, 'online ' + stream.jid));
    });

    stream.on('auth-failure', function(jid) {
      registrador.info(formatarRegistro(stream, 'auth-failure ' + jid));
    });

    stream.on('registration-success', function(jid) {
      registrador.info(formatarRegistro(stream, 'registration-success ' + jid));
    });

    stream.on('registration-failure', function(jid) {
      registrador.info(formatarRegistro(stream, 'registration-failure ' + jid));
    });
	
	 // Evento disparado quando cliente realizar conexão
    stream.on('connect', function () {
      
    });
	
	// Evento disparado quando usuário realiza autenticação.
    stream.on('authenticate', function(opcs, chamarDepois) {
    
    });
	
	// Evento disparado quando o cliente requisita registro para determinado JID
    stream.on('register', function(opcs, chamarDepois) {

    });
	
	// Evento disparado quando usuário desconecta do servidor
    stream.on('disconnect', function () {
      console.log('Cliente desconectado');
    });

    // Evento disparado quando conexão do cliente for finalizada
    stream.on('end', function () {
      // A conexão é finalizada e então fechada.
      // @veja http://nodejs.org/api/net.html#net_event_end
      
    });

    // Evento disparado quando cliente está online.
    stream.on('online', function () {
      
    });

    // Evento disparado quando a conexão do cliente foi fechada
    stream.on('close', function () {
      
    });

    // Evento disparado quando chega uma mensagem enviada pelo cliente remetente
    stream.on('stanza', function (stanza) {
      
    });
  });

  GerenConex.on('s2sReady', function(s2s) {
    // console.log("S2S ready");
    // s2s.on("newStream", function(stream) {
    // console.log("New Stream");
    // });
  });

  GerenConex.on('c2sRoutersReady', function(router) {
    // console.log("Router ready")
  })

  // Evento ao desconectar, quando um servidor desconecta.
  GerenConex.on('disconnect', function() {
    //console.log('Servidor desconectado');
  });
};

module.exports = RegistradorEventos;
