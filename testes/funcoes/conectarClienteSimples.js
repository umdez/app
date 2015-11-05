'use strict'

/**
* Este teste tentará conectar um cliente ao servidor xmpp utilizando método simples.
**/

var xmppCliente = require('node-xmpp-client');
var configuracao = require('../../configuracao/configuracao.js');
var _ = require('underscore');

// Chamamos o arquivo principal, ele vai iniciar o servidor.
var servidor = require('../../biblioteca/iniciador/principal');

// Esperamos este tempo para prosseguir com a conexão.
var quantClientes = 0;
var clientes = [];

describe('Conecta o nosso cliente', function(){
    
    before(function(avancar) {
      servidor.prosseguir(configuracao, function() {
        console.log('Iniciou servidor xmpp com sucesso!');
		avancar();
      });
    });
    
	
	beforeEach(function(avancar){
		
      if (configuracao && configuracao.auth && configuracao.auth.length >= 1) {
		var quantAutenticacoes = configuracao.auth.length;

        var pronto = _.after(configuracao.auth.length, function() {
            avancar();
        });
        _.each(configuracao.auth, function(autenticacao) {
          // Percorremos as autenticações disponíveis
          quantAutenticacoes--;
		  
          if (autenticacao.users) {
            // Percorre lista de usuários
            autenticacao.users.forEach(function (usuario) {
              var confConexaoClient = {
                jid: usuario.user + '@' + 'localhost',
                password: usuario.password
              }

              // cada um dos usuários possuem uma configuração.
              clientes[usuario.user] = confConexaoClient;
			
			  quantClientes++;
            });  
		  } else {
            console.log('Não possui usuarios para esta autenticação.');	
		  } 

		  if (quantAutenticacoes <= 1) {
            pronto(); 		
		  }
        });

      } else {
        console.log("Não foi possível carregar usuários, nesessário adicionar no arquivo de configuração.");
        process.exit(1);
      }
    });
	
    it('Deve conectar fácil se usuário e senha estivere corretos', function(pronto){
  
      var quantClientesConect = 1;
	  var clts = [];
	  var nomeUsuario;

      this.timeout(10000); // 10 segundos de espera para terminar.
	  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {
          clts[nomeUsuario] = new xmppCliente(clientes[nomeUsuario]);
		  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configuração estiverem conectados
            if (quantClientesConect === quantClientes) {
                pronto(); 
            }

          });
        }
	  }
	 
    });
	
    it('deveria disparar um erro em caso de falha na conexão (Usuario ou senha errados)', function(pronto){
	  
	  var quantClientesConect = 1;
	  var clts = [];
	  var nomeUsuario;

      this.timeout(10000); // 10 segundos de espera para terminar.
	  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {
          clts[nomeUsuario] = new xmppCliente(clientes[nomeUsuario]);
		  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configuração estiverem conectados
            if (quantClientesConect === quantClientes) {
              console.log('okokOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOK  ' + quantClientesConect);
			  throw function() {};
			  
            }

          });
		  
		  clts[nomeUsuario].on('error', function(err) {
              //if(err === "XMPP authentication failure") {
              pronto();
              //}
          });
        }
	  }
	 
    });
    
});