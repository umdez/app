/* Exporta objeto contendo os dados de configuração para o nosso servidor.
 *
 * @Arquivo configuracao.js
 */

var config = {};


/* @Diretiva {conexao} As formas de conexões aceitas.
 * 
 * - connection.tipo (Obrigatorio) Aquelas conexões aceitas. podendo ser: tcp,
 * bosh ou websocket.
 * 
 * - connection.porta (Opcional e recomendado) A porta a qual esta conexão vai
 * escutar.
 * 
 * - connection.dominio (Opcional e recomendado) O endereço ao qual este tipo de
 * conexão irá escutar por conexões.
 * 
 * - connection.interface (Opcional) A interface utilizada por esta conexão.
 */
config.conexao = [
  {
    "tipo": "tcp",                
    "porta": 5222,                 
    "interface": "0.0.0.0", 
    "dominio": "127.0.0.1"         
  }, {
    "tipo": "bosh",               
    "porta": 5280,                 
    "path": "http-bind",          
    "interface": "0.0.0.0",
    "dominio": "127.0.0.1"         
  }, {
    "tipo": "websocket",          
    "porta": 5281,                 
    "interface": "0.0.0.0",
    "dominio": "127.0.0.1"         
  }
];

/* @Diretiva {autenticacao} As autenticaçõe disponíveis.
 *
 * - autenticacao.tipo (Obrigatório) O tipo de autenticação. podendo ser:
 * simple, oauth2 e ou anonymous.
 * 
 * - autenticacao.testarUsuarios (Opcional) Se essa autenticação vai possuir
 * usuários de teste. (Se ligado irá adicionar 10mil usuários de teste).
 * 
 * - autenticacao.usuarios (Opcional) Aqueles usuários desta autenticação.
 * 
 * - autenticacao.usuarios.usuario (Opcional) Nome de usuário desta
 * autenticação.
 * 
 * - autenticacao.usuarios.senha (Opcional) A senha do usuário desta
 * autenticação.
 * 
 * - autenticacao.servidor (Opcional) É obrigatório apenas no tipo oauth2. Esta
 * será a URL utilizada pela autenticação Oauth2.
 */
config.autenticacao =  [
  {
  "tipo": "simple",           
  "testarUsuarios": true,    
  "usuarios": [{                  
      "usuario": "felippe",
      "senha": "felippe10"
    }, {
      "usuario": "junior",
      "senha": "junior10"
    }, {
      "usuario": "vinicius",
      "senha": "vinicius10"
    }]
  },
  {
    "tipo": "oauth2",             
    "servidor": "localhost:3000"   
  },
  {
    "tipo": "anonymous"            
  }
];

/* @Diretiva {armazenamento} O nosso sistema de armazenamento. 
 * 
 * - armazenamento.dialeto (Obrigatório) O dialeto usado. Podendo ser: mysql,
 * postgres ou então sqlite.
 *
 * - armazenamento.porta (Opcional e Recomendado) A porta utilizada para conexão
 * com o nosso banco de dados. Exeto para o SQlite.
 *
 * - armazenamento.endereco (Opcional e Recomendado) O endereço do nosso banco
 * de dados. Exeto para o SQlite.
 *
 * - armazenamento.senha (Obrigatório) A nossa senha de conexão com o banco.
 * Exeto para o SQlite.
 *
 * - armazenamento.database (Obrigatório) O nome do banco utilizado.
 *
 * - armazenamento.usuario  (Obrigatório) O nome do usuário do banco. Exceto
 * para o SQLite.
 * 
 * - armazenamento.seForForcarCriacaoDeNovasTabelas (Opcional) Realiza a remoção
 * das tabelas existentes e as cria novamente.
 */
config.armazenamento = {
  "dialeto": "mysql"                
, "usuario": "leo"                  
, "senha": "montes"                 
, "database": "database"            
, "maxDeConsultasConcorrentes": 200 
, "maxDeConexoes": 1                
, "maxTempInativo": 30              
, "endereco": "127.0.0.1"           
, "porta": 3306      
, "seForForcarCriacaoDeNovasTabelas": false                
};

module.exports = config;