var xmpp = require('node-xmpp-server');
//var path = require('path'); Obsoleto?

// Acessamos os arquivos base do nosso servidor.
var baseBiblioteca = require('../indice');

// Carrega todos os arquivos necessários
var RegistradorEventos = require('../nucleo/RegistradorEventos'); // Bom notar que utilizamos bunyan ao invez do winston nos outros arquivos.
var Registrador = require('../nucleo/Registrador')('base');

//var Router      = require('../modules/router');
//var Offline     = require('../modules/offline');
//var Version     = require('../modules/version'); 
//var Presence    = require('../modules/presence');
//var Roster      = require('../modules/roster');
//var DiscoInfo   = require('../modules/disco_info');
//var VCard       = require('../modules/vcard');
//var Websocket   = require('../modules/websocket');
//var S2S         = require('../modules/s2s');
//var Ping        = require('../modules/ping');

// Loading non -xmpp libraries
//var User = require('../lib/users.js').User;

exports.prosseguir = function(configuracao, pronto) {

  // Inicia rota conexões
  var rotaConexao = new baseBiblioteca.Rota.RotaConexao();
   
  // Criamos o servidor.
  var servidor = new xmpp.C2SServer(configuracao);

  // Adiciona o registro para os eventos do servidor e dos clientes de cada servidor.
  RegistradorEventos.adcRegistroEventosPara(servidor, configuracao.logger);
  
  // Configure the mods at the server level!
  //Router.configure(server, config.router); 
  //Logger.configure(server, config.logger);
  //Offline.configure(server, config.offline);
  //Version.configure(server, config.version);
  //Presence.configure(server, config.presence);
  //Roster.configure(server, config.roster);
  //DiscoInfo.configure(server, config.disco);
  //VCard.configure(server, config.vcard);
  //Websocket.configure(server, config.websocket);
  //S2S.configure(server, config);
  //Ping.configure(server, config.ping);

  // Evento ao conectar. Quando um cliente conecta.
  servidor.on('connect', function(cliente) {

    // Evento disparado quando usuário realiza autenticação.
    cliente.on('authenticate', function(opcs, chamarDepois) {
      console.log('Cliente autenticado');

      if (true) { // Por enquanto sempre validar a autenticação
        chamarDepois(null, opcs);
      } else {
        chamarDepois(new Error("Falha de autenticação."));
      }
    });

    // Evento disparado quando o cliente requisita registro para determinado JID
    cliente.on('register', function(opcs, chamarDepois) {
      console.log('Cliente registrado');
 
      if (true) {
        chamarDepois(true);
      } else{
        var erro = new Error("conflict");
        erro.code = 409;
        erro.type = "cancel";
        chamarDepois(err);
      }

    });

    // Evento disparado quando usuário desconecta do servidor
    cliente.on('disconnect', function () {
      console.log('Cliente desconectado');
    });

    // Evento disparado quando conexão do cliente for finalizada
    cliente.on('end', function () {
      // A conexão é finalizada e então fechada.
      // @veja http://nodejs.org/api/net.html#net_event_end
      console.log('Conexão do cliente finalizada');
    });

    // Evento disparado quando cliente autenticou e ou registrou e está online.
    cliente.on('online', function () {
      console.log('Cliente online');
    });

    // Evento disparado quando a conexão do cliente foi fechada
    cliente.on('close', function () {
      console.log('Cliente fechou conexão');
    });

    // Evento disparado quando chega uma mensagem enviada pelo cliente remetente
    cliente.on('stanza', function (stanza) {
      console.log('Cliente: ' + cliente.jid.toString() + ' enviou a seguinte mensagem: ' + stanza.toString());
    });

    // Evento disparado quando cliente realizar conexão
    cliente.on('connect', function () {
      console.log('Cliente conectado');
    });
  });

  // Evento ao desconectar, quando um cliente disconecta.
  // Acho que isso está obsoleto nesta versão do node-xmpp-server.
  servidor.on("disconnect", function(cliente) {
    console.log('Cliente desconectado do servidor');
  });

  // Esta é a função chamado quando o servidor estiver pronto e realizado. É util quando executado em um outro código.
  // Necessario ter certeza que este é o local correto para isso no futuro porque C2S e S2S talvez não estarão prontos.
  // pronto();
}