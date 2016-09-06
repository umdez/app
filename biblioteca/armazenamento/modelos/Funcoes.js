'use strict';

/* @arquivo Funcoes.js */

module.exports = function (database, DataTypes) {

  var VERSAO_BANCO_DADOS = 1;

  var Funcoes = database.define('Funcoes', {
    
    id: { type: DataTypes.INTEGER, autoIncrement: true,  primaryKey: true },

    nome: { type: DataTypes.STRING, validate: {} }  // Gerente? atendente?
  }, {

    associar: function (modelos) { 
      modelos.Funcoes.hasMany(modelos.Escopos, { foreignKey: 'funcao_id' }); 
    },
    classMethods:{
      
    },
    instanceMethods: {
      
    },
    underscored: true,
    timestamps: true,
    freezeTableName: true,
    tableName: 'Funcoes'
  });

  return {
    mod: Funcoes
  , versao: VERSAO_BANCO_DADOS
  };
};