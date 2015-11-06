'use strict'

/**
* O primeiro teste tentar� conectar um cliente ao servidor xmpp utilizando m�todo simples.
* O segundo tenta testar a autentica��o que o servidor oferece, sendo que � esperado
* um erro em caso se senha inv�lida.
* Observer que utilizamos o arquivo de configura��o onde usu�rios de teste s�o adicionados.
**/

var xmppCliente = require('node-xmpp-client');

// Aqui iremos pegar os usu�rios
var configuracao = require('../../configuracao/configuracao.js');
var _ = require('underscore');

// Chamamos o arquivo principal, ele vai iniciar o servidor.
var servidor = require('../../biblioteca/iniciador/principal');

var quantClientes = 0;
var clientes = [];

// Lembre-se que ser voc� informou na configura��o o testusers, V�o ser adcionados 10mil usu�rios.
// Isso faz com que tenhamos que adicionar um timeout de 30 segundos para que o teste d� certo.
var seUsuariosTeste = false;

describe('Inicia servidor e conecta o nosso cliente', function(){
    
    before(function(avancar) {
      servidor.prosseguir(configuracao, function() {
        console.log('Iniciou servidor xmpp com sucesso!');
        avancar();
      });
    });
    

    beforeEach(function(avancar){
      
      // Percorremos todos os usu�rios de cada autentica��o e armazenamos o jid e senha deles
      // Para depois conectarmos no servidor utilizando estes dados.	  
      if (configuracao && configuracao.auth && configuracao.auth.length >= 1) {
        var quantAutenticacoes = configuracao.auth.length;
        var qtdAutent = configuracao.auth.length - 1;

        // Avan�amos logo depois de armazenar todos usu�rios de todos tipos de autentica��o
        var pronto = _.after(quantAutenticacoes, function() {
          avancar();
        });
        _.each(configuracao.auth, function(autenticacao) {
          // Percorremos as autentica��es dispon�veis
          quantAutenticacoes--;
  
          if (autenticacao.users) {
            // Percorre lista de usu�rios
            autenticacao.users.forEach(function (usuario) {
              var confConexaoClient = {
                jid: usuario.user + '@' + 'localhost',
                password: usuario.password
              }

              // cada um dos usu�rios possuem uma configura��o.
              clientes[usuario.user] = confConexaoClient;

              quantClientes++;
            });  
          } else {
            console.log('N�o possui usuarios para esta autentica��o.');	
          } 

          // Verificamos se podemos proceder com o teste
          if (quantAutenticacoes <= qtdAutent) {
            seUsuariosTeste = autenticacao.testusers;
            pronto(); 		
          }
        });

      } else {
		  
        // Se n�o houver usu�rios como iremos conectar?
        console.log("N�o foi poss�vel carregar usu�rios, nesess�rio adicionar no arquivo de configura��o.");
        process.exit(1);
      }
    });

    it('Deve conectar f�cil se usu�rio e senha estivere corretos', function(pronto){
  
      var quantClientesConect = 1;
      var clts = [];
      var nomeUsuario;

      // Quando temos testes de usu�rios � necess�rio darmos mais tempo 
      // para o cliente conectar e disparar o evento online
      if (seUsuariosTeste) {
        this.timeout(30000); // 30 segundos 
      } else {
        this.timeout(10000); // 10 segundos 
      }
  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {
          // cada cliente � conectado
          clts[nomeUsuario] = new xmppCliente(clientes[nomeUsuario]);
  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configura��o estiverem conectados
            if (quantClientesConect === quantClientes) {
                pronto(); 
            }

          });
        }
       }
 
    });
	
    // Este teste n�o est� funcionando ainda. Porque o servidor n�o vai retornar erro para senha errada, e sim,
    // procurar no banco de dados, se n�o encontrar ele cria um novo usu�rio.
    // Fazendo com que nenhum erro seja retornado.
    it('deveria disparar um erro em caso de falha na autentica��o', function(pronto){
  
      var quantClientesConect = 1;
      var clts = [];
      var nomeUsuario;

      // Quando temos testes de usu�rios � necess�rio darmos mais tempo 
	    // para o cliente conectar e disparar o evento online
      if (seUsuariosTeste) {
        this.timeout(30000); // 30 segundos 
      } else {
        this.timeout(10000); // 10 segundos 
	  }
	  
      for (nomeUsuario in clientes){
        if (clientes.hasOwnProperty(nomeUsuario)) {

          // Modificamos a configura��o para conex�o setando uma senha errada.
          var confSenhaErrada = clientes[nomeUsuario];
          confSenhaErrada.password = confSenhaErrada.password + 'yzzi';
		  
          clts[nomeUsuario] = new xmppCliente(confSenhaErrada);
  
          clts[nomeUsuario].on('online', function () {
            quantClientesConect++;
              
            //Quando todos os clientes da configura��o estiverem conectados
            if (quantClientesConect === quantClientes) {
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