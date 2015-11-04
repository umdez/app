'use strict';

var util = require('util');
var XRotas = require('../nucleo/XRotas');
var Promessa = require('bluebird');
var JID = require('node-xmpp-core').JID;
var VerificarXmpp = require('../nucleo/VerificarXmpp');
var Registrador = require('../nucleo/Registrador')('rotaconexao');

/**
 * Gerencia as conexões e roteia as solicitações para outras rotas
 *
 * Afazer: Verificar se os valores de to e from são adequados para o cliente, rejeitar mensagens onde o valor do from não é adequado.
 */
function RotaConexao(storage) {
  XRotas.call(this);

  //this.storage = storage;

  // Gerência de conexões, por exemplo, tcp, bosh etc
  this.gerenciaConexoes = [];

  // Modulos de autenticação
  this.metodosAutenticacao = [];

  // Seções conectadas de todas gerências de conexão
  this.secoes = {};
  this.contador = 0;
  
}
util.inherits(RotaConexao, XRotas);

RotaConexao.prototype.nome = 'RotaConexao';

RotaConexao.prototype.seCorresponder = function (stanza) {
  var seCorresponder = false;

  if (stanza.attrs && stanza.attrs.to) {
    var paraJid = new JID(stanza.attrs.to);

    // envia para todos clientes locais, verifica se o JID confere
    if (this.secoes.hasOwnProperty(paraJid.bare().toString())) {
      seCorresponder = true;
    }
  }

  return seCorresponder;
};

RotaConexao.prototype.adcMetodoAutenticacao = function (metodo) {
  this.metodosAutenticacao.push(metodo);
};

RotaConexao.prototype.procurarMetodoAutenticacao = function (metodo) {
  var encontrados = [];
  for (var i = 0; i < this.metodosAutenticacao.length; i++) {
    if (this.metodosAutenticacao[i].seCorresponder(metodo)) {
      encontrados.push(this.metodosAutenticacao[i]);
    }
  }
  return encontrados;
};

/**
 * Passo adicional de verificação da informação do cliente
 * @param informação de valores chave das opções do cliente
 */
RotaConexao.prototype.verificarCliente = function (opcs) {
  Registrador.debug('Verificando cliente');

  for (var atrb in opcs) {
    if (opcs.hasOwnProperty(atrb)) {
      Registrador.debug(atrb + ' -> ' + opcs[atrb]);
    }
  }
/*
  var storage = this.storage;

  return new Promessa(function(resolve, reject) {
    // store the name if we got him
    if (opcs.jid) {
      Registrador.debug('update name of user');
      // we do not need to wait here, lets do this in background
      // find or create user and update name

      var transaction = null;
      var usr = null;
      storage.sequelize.transaction().then(function (t) {
        transaction = t;
        return storage.findOrCreateUser(opcs.jid.toString(), {
          transaction: t
        })
      }).spread(function(user, created) { // jshint ignore:line
        usr = user;
        if (opcs.name) {
          usr.name = opcs.name;
        }
        return transaction.commit();
      }).then(function(){
        Registrador.debug(JSON.stringify(usr));
        resolve(usr);
      }).catch(function(err){
        Registrador.error(err);
        transaction.rollback();
        reject(err);
      })
    } else {
      reject('parameter for authentication is missing')
    }
  })
*/
};

RotaConexao.prototype.autenticar = function (opcs, cd) {
  var esteObjeto = this;

  try {

    for (var atrb in opcs) {
      if (opcs.hasOwnProperty(atrb)) {
        Registrador.debug(atrb + ' -> ' + opcs[atrb]);
      }
    }

    Registrador.debug('Inicia o processo de autenticação');
    var autenticacao = this.procurarMetodoAutenticacao(opcs.saslmech);
    if (autenticacao.length > 0) {
      autenticacao[0].authenticate(opcs).then(function (cliente) { // Afazer: descobrir este método authenticate.
        Registrador.debug('Clinte xmpp autenticado');

        // Unindo propriedades
        for (var propriedade in cliente) {
          if (cliente.hasOwnProperty(propriedade)) {
            opcs[propriedade] = cliente[propriedade];
          }
        }

        esteObjeto.verificarCliente(opcs).then(function () {
          Registrador.debug('Cliente verificado')
          // Chamar depois
          cd(null, opcs);
        }).
        catch(function (err) {
          Registrador.error(err);
          cd('user verification failed');
        });

      }).
      catch(function (err) {
        Registrador.error('Autenticação do cliente xmpp falhou' + err);
        cd('xmpp could not authenticate user');
      });

    } else {
      // throw error
      Registrador.error('Não foi possivel manipular %s', opcs.saslmech);
      cd(new Error('user not found'));
    }

  } catch (err) {
    Registrador.error(err.stack);
    cd(new Error('user not found'));
  }
};

RotaConexao.prototype.registrar = function (opcs, cd) {
  // Não está implementado, mas é relevante apenas para servidor.
  Registrador.debug('registrar');

  var err = new Error('not allowed');
  err.code = 123;
  err.type = 'abort';
  cd(err);
};

/**
 * Comunicação de entrada
 */
RotaConexao.prototype.manipular = function (stanza) {

  // Verifica se nós temos o endereço do remetente
  if (!stanza.attrs.to) {
    stanza.attrs.to = new JID(stanza.attrs.from).getDomain();
  }

  Registrador.debug('emitir evento stanza: ' + stanza.toString());
  this.emit('stanza', stanza);
};

/**
 * Comunicação de saida
 */
RotaConexao.prototype.enviar = function (stanza) {
  var enviado = false
  try {
    // Registrador.debug('Entregar:' + stanza.root().toString());
    var esteObjeto = this;

    if (stanza.attrs && stanza.attrs.to) {
      var destinatarioJid = new JID(stanza.attrs.to);

      // Envia para todos clientes locais, também verifica se tem o JID.
      if (esteObjeto.secoes.hasOwnProperty(destinatarioJid.bare().toString())) {
        // Agora percorre todas as seções em laço e somente envia para o(s) JID(s) correto(s).
        var fonte;
        for (fonte in esteObjeto.secoes[destinatarioJid.bare().toString()]) {
          if (destinatarioJid.bare().toString() === destinatarioJid.toString() || destinatarioJid.resource === fonte) {
            Registrador.debug('enviando mensagem para a fonte: ' + fonte);
            esteObjeto.secoes[destinatarioJid.bare().toString()][fonte].send(stanza);
            enviado = true;
          }
        }

        // Não foi possível enviar a stanza.
        if (!enviado) {
          Registrador.error(stanza.root().toString() + ' Não pode ser entregue');
        }
      } else {
        Registrador.warn('Não pôde ser entregue a stanza: ' + stanza.toString());
      }
    }
  } catch (err) {
    Registrador.error(err.stack);
  }

  return enviado;
};

/**
 * Registra uma rota (A conexão de um cliente JID)
 */
RotaConexao.prototype.registrarRota = function (jid, cliente) {
  try {
    Registrador.debug('Registrado cliente ' + jid);
    // Afazer: Verificar por conflitos
    if (!this.secoes.hasOwnProperty(jid.bare().toString())) {
      this.secoes[jid.bare().toString()] = {};
    }

    this.secoes[jid.bare().toString()][jid.resource] = cliente;
  } catch (err) {
    Registrador.error(err.stack);
  }
  return true;
};

/**
 * Desregistra uma rota (A conexão de cliente JID)
 */
RotaConexao.prototype.desregistrarRota = function (jid) {
  try {
    Registrador.debug('desregistrar jid ' + jid);
    if (jid && jid.bare()) {
      if (this.secoes.hasOwnProperty(jid.bare().toString())) {
        delete this.secoes[jid.bare().toString()][jid.resource];
      }
    }
  } catch (err) {
    Registrador.error(err.stack);
  }

  return true;
};

/**
 * Retorna a lista de JIDs conectados a um JID especifico.
 */
RotaConexao.prototype.clientesConectadosPorJid = function (jid) {
  try {
    jid = new JID(jid);
    if (!this.secoes.hasOwnProperty(jid.bare().toString())) {
      return [];
    } else {
      var jids = [];
      var fontes = this.secoes[jid.bare().toString()];
      for (var fonte in fontes) {
        if (fontes.hasOwnProperty(fonte)) {
          jids.push(new JID(jid.bare().toString() + '/' + fonte));
        }
      }
      return jids;
    }
  } catch (err) {
    Registrador.error(err.stack);
    return [];
  }
};

RotaConexao.prototype.conecta = function (jid, stream) {
  try {
    if (jid) {
      this.registrarRota(jid, stream);
      this.emit('connect', jid);
    }
  } catch (err) {
    Registrador.error(err);
  }
};

RotaConexao.prototype.desconecta = function (jid, stream) {
  try {
    this.desregistrarRota(jid, stream);
    this.emit('disconnect', jid);
  } catch (err) {
    Registrador.error(err.stack);
  }
};

RotaConexao.prototype.verificarStanza = function (stream, stanza) {
  try {
    // Verificar xmpp stanza
    var erro = VerificarXmpp.remetenteInvalido(stream, stanza);

    if (erro) {
      Registrador.warn(erro);
      // cliente.error(error);
    }

    // Despacha stanza para rota
    this.manipular(stanza);

  } catch (err) {
    Registrador.error(err.stack);
  }
};

/**
 * Pega um stream e registra manipulação para os eventos
 * @param   stream node-xmpp stream
 */
RotaConexao.prototype.registerStream = function (stream) {

  this.contador++;

  Registrador.debug('registrar novo stream ' + this.contador);

  var esteObjeto = this;

  // Permite ao desenvolvedor autenticar usuários da forma que quiser.
  stream.on('authenticate', function (opcs, cd) {
    esteObjeto.autenticar(opcs, cd);
  });

  // Permite ao desenvolvedor a registrar o JID da forma que quiser.
  stream.on('register', function (opcs, cd) {
    esteObjeto.registrar(opcs, cd);
  });

  // Eventos de socket advinda de uma conexão node-xmpp
  stream.on('end', function () {
    // Conexão foi finalizada, e então fechada.
    // @veja http://nodejs.org/api/net.html#net_event_end
    Registrador.debug('Conexão do cliente fechada');
  });

  stream.on('online', function () {
    Registrador.debug('ONLINE: ' + stream.jid.toString());
    // despacha o evento para a rota
    esteObjeto.conecta(stream.jid, stream);
  });

  stream.on('close', function () {
    // Despacha evento para a rota
    esteObjeto.desconecta(stream.jid, stream);
  });

  stream.on('stanza', function (stanza) {
    Registrador.debug('mensagem recebida : ' + stanza.toString());
    esteObjeto.verificarStanza(stream, stanza);
  });

  // Eventos base da rota
  stream.on('connect', function () {
    esteObjeto.contador--;
    esteObjeto.conecta(stream.jid, stream);
  });

  stream.on('disconnect', function () {
    esteObjeto.desconecta(stream.jid, stream);
  });

};

RotaConexao.prototype.desregistraStream = function () {
  // Afazer: Implementar este método.
};

// Adiciona multiplas gerencias de conexões
RotaConexao.prototype.adcGerenciaConexoes = function (gerConex) {
  Registrador.debug('Carregado gerência de conexão: ' + gerConex.nome);

  // Guarda a gerencia de conexões
  this.gerenciaConexoes.push(gerConex);

  // Anexao aos eventos da conexão e despacha eles para o gerente de rotas.
  var esteObjeto = this;
  gerConex.on('connect', function (stream) {
    esteObjeto.registraStream(stream);
  });

};

// Encerra o gerente de conexões
RotaConexao.prototype.pararConexões = function () {
  Registrador.info('Encerradas todas as conexões');

  for (var i = 0, l = this.gerenciaConexoes.length; i < l; i++) {
    this.gerenciaConexoes[i].encerrar();
  }
};

module.exports = RotaConexao;