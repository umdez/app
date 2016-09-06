'use strict';

var utilitario = require('util');
var EmissorDeEvento = require('events').EventEmitter;
var Sequelize = require('sequelize');
var SequelizeI18N = require('sequelize-i18n');
var Promessa = require('bluebird');
var modelos = require('./modelos/indice');
var registrador = require('../nucleo/registrador')('armazenamento');
var _ = require('lodash');

var Armazenamento = function (opcoes) {
  EmissorDeEvento.call(this);

  if (!opcoes) {
    throw new Error('As opções de configuração do banco de dados não foram informadas.');
  }

  this.configuracao = opcoes.configuracao;

  _.defaults(this.configuracao, {         
    maxDeConsultasConcorrentes: 100  
  , maxDeConexoes: 1                 
  , maxTempInativo: 30
  , dialeto: 'mysql'
  , endereco: '127.0.0.1'
  , porta: 3306
  });

  this.modulos = opcoes.modulos;

  this.modelos = [];
};

utilitario.inherits(Armazenamento, EmissorDeEvento);

Armazenamento.prototype.carregarOsModelos = function () {
  modelos(this.sequelize, this.modelos);
  return this.modelos;
};

Armazenamento.prototype.iniciar = function (opcsSincroniza) {

  registrador.debug('Iniciando armazenamento');

  var meuObj = this;
  var config = this.configuracao;
  var moduloDb = this.modulos['bd'];

  return new Promessa(function (deliberar, recusar) {                     

    var opcoes = {
      //language: 'en',
      dialect: config.dialeto,
      host: config.endereco,
      port: config.porta,
      maxConcurrentQueries: config.maxDeConsultasConcorrentes, 
      pool: {
        maxConnections: config.maxDeConexoes,   
        maxIdleTime: config.maxTempInativo    
      }
    };
    
    var sequelize = new Sequelize(config.database, config.usuario, config.senha, opcoes);
    
    moduloDb.sequelize = meuObj.sequelize = sequelize;

    var i18n = new SequelizeI18N(sequelize, { 
      languages: ["EN", "PT"], default_language: "PT" 
    });

    i18n.init();

    moduloDb.modelos = meuObj.carregarOsModelos();

    sequelize.sync({
      "force": config.seForForcarCriacaoDeNovasTabelas
    }).then(function() {
      deliberar(meuObj);
    }).catch(function(erro){
      registrador.error(erro);
      recusar(erro);
    }); 
   
  });
};

Armazenamento.prototype.procurarUsuario = function (jid, opcoes) {

  opcoes = opcoes || {};

  if (!jid) {
    throw new Error('Está faltando o jid');
  }

  return this.modelos['Usuarios'].find({
    where: {
      jid: jid
    }
  }, opcoes).then(function (usuario) {
    if (!usuario) {
      throw new Error('Não foi possível encontrar o usuário ');
    }
    return usuario;
  })

};

Armazenamento.prototype.encontrarOuCriarUsuario = function (jid, opcoes) {

  opcoes = opcoes || {};

  if (!jid) {
    throw new Error('Está faltando o jid');
  }

  return this.modelos['Usuarios'].findOrCreate({
    where: {
      jid: jid
    },
    defaults: {
      jid: jid
    }
  }, opcoes);
};

module.exports = Armazenamento;