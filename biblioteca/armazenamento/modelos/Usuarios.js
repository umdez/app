'use strict';

/* @arquivo Usuario.js */

var uuid = require('node-uuid');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (database, DataTypes) {

  var VERSAO_BANCO_DADOS = 1;

  var Usuarios = database.define('Usuarios', {

    nome: { type: DataTypes.STRING, validate: {} },  // Nome do nosso usuário

    jid: { type: DataTypes.STRING, unique: true, validate: {} },  // JID do usuário.

    uuid: { type: DataTypes.UUID, unique: true, defaultValue: uuid.v4, validate: { isUUID: 4 } },  // Identificador unico deste usuário.
    
    senha: { type: DataTypes.STRING, validate: {} },  // A senha do usuário.
    
    estatos: { type: DataTypes.STRING, validate: {} }  // Validado? Bloqueado?
  }, {

    associar: function (modelos) {
      modelos.Usuarios.belongsTo(modelos.Funcoes, { foreignKey: 'funcao_id', as: 'Funcoes' });
      modelos.Usuarios.hasMany(modelos.Projetos, { foreignKey: 'usuario_id' }); 
    },
    classMethods:{
      
    },
    instanceMethods: {
      verificarSenha: function(senha) {
        // Verificamos a senha de forma sincrona. Retorna true se cofere com a
        // nossa senha.
        return bcrypt.compareSync(senha, this.senha);
      }
    },
    underscored: true,
    timestamps: true,
    freezeTableName: true,
    tableName: 'Usuarios'
  });

  return {
    mod: Usuarios
  , versao: VERSAO_BANCO_DADOS
  };
};