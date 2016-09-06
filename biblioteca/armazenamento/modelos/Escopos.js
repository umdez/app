/* @arquivo Escopos.js */

module.exports = function (database, DataTypes) {
  
  var VERSAO_BANCO_DADOS = 1;
    
  var Escopos = database.define('Escopos', {
    
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    
    nome: { type: DataTypes.STRING, validate: {} },

    bandeira: { type: DataTypes.STRING, validate: {} }  // Acessar? Cadastrar? Remover?
  }, {
    
    associar: function (modelos) {
      modelos.Escopos.belongsTo(modelos.Funcoes, { foreignKey: 'funcao_id', as: 'Funcoes' });
    },
    underscored: true, // Lembre-se de que utilizamos o padrão snake_case
    timestamps: false,
    freezeTableName: true,
    tableName: 'Escopos'
  });

  return {
    mod: Escopos
  , versao: VERSAO_BANCO_DADOS
  }
};