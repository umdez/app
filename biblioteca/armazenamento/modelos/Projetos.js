/* @arquivo Projetos.js */

module.exports = function (database, DataTypes) {
  
  var VERSAO_BANCO_DADOS = 1;
    
  var Projetos = database.define('Projetos', {
    
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    
    descricao: { type: DataTypes.STRING, validate: {} }
  }, {
    
    associar: function (modelos) {
      modelos.Projetos.belongsTo(modelos.Usuarios, { foreignKey: 'usuario_id', as: 'Usuarios' });
    },
    underscored: true, // Lembre-se de que utilizamos o padrão snake_case
    timestamps: false,
    freezeTableName: true,
    tableName: 'Projetos'
  });

  return {
    mod: Projetos
  , versao: VERSAO_BANCO_DADOS
  }
};