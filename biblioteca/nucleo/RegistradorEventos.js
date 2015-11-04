'use strict';

var registrador = require('winston');

function RegistradorEventos() {
  
}

// Obsoleto, deletar!
RegistradorEventos.prototype.configurar = function(servidor, ligar) {
  
}

/* Se for ligado vai fazer o registro dos eventos para um dado servidor.
 *
 * @param o determinado servidor em que iremos registrar os eventos
 * @param este é definido na configuração se for necessario ligar o registro para o servidor determinado 
 */
RegistradorEventos.prototype.adcRegistroEventosPara = function (servidor, seLigar) {
  
  // Aqui faremos o registro para cada um dos eventos 
  // Aqui conseguiremos escutar os eventos em todos objetos ligados aquele servidor, incluindo as rotas, 
  // gerenciamento de sessão, rotas S2S, as conexões, etc.
  if(seLigar) {
	  
	// http://xmpp.org/extensions/xep-0160.html
    var formatarRegistro = function(cliente, mensagem) {
      //Preciso descobrir como acessar o remoteAddress nesta nova versão do node-xmpp-server
      return [/*cliente.socket.remoteAddress,*/ cliente.streamId, mensagem].join(" "); 
    }  
	  
    servidor.on("connect", function(cliente) {
      registrador.debug(formatarRegistro(cliente, "connected"));

      cliente.on('session-started', function() {
        registrador.info(formatarRegistro(cliente, stanza.toString()));
      });

      cliente.on('auth-success', function(jid) {
        registrador.info(formatarRegistro(cliente, "auth-success " + jid));
      });

      cliente.on('online', function() {
        registrador.info(formatarRegistro(cliente, "online " + cliente.jid));
      });

      cliente.on('auth-failure', function(jid) {
        registrador.info(formatarRegistro(cliente, "auth-failure " + jid));
      });

      cliente.on('registration-success', function(jid) {
        registrador.info(formatarRegistro(cliente, "registration-success " + jid));
      });

      cliente.on('registration-failure', function(jid) {
        registrador.info(formatarRegistro(cliente, "registration-failure " + jid));
      });
    });

    servidor.on("s2sReady", function(s2s) {
      // console.log("S2S ready");
      // s2s.on("newStream", function(stream) {
      // console.log("New Stream");
      // });
    });

    servidor.on("c2sRoutersReady", function(router) {
      // console.log("Router ready")
    })
  }

};

RegistradorEventos.prototype.debug = function(mensagem) {
  // Obsoleto, deletar!
  if (this.seLigado) {
    registrador.debug(mensagem);  
  }
} 

RegistradorEventos.prototype.info = function(mensagem) {
  // Obsoleto, deletar!
  if (this.seLigado) {
    registrador.info(mensagem);  
  }
} 

module.exports = RegistradorEventos;