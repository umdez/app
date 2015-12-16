/* Exporta objeto contendo os dados de configuração para o nosso servidor XMPP.
 *
 * @Arquivo configuracao.js 
 */

/* Aqui temos a configuração do nosso serviço.
 *
 * @Diretiva {connection} As formas de conexões aceitas. 
 *  - tcp (Opcional) Aceita conexões do tipo tcp.
 *  - bosh (Opcional) Aceita conexões do tipo bosh.
 *  - websocket (Opcional) Aceita conexões do tipo websocket.
 *
 * @Diretiva {auth} As autenticaçõe disponíveis.
 *  - simple (Opcional) Aceita aquelas conexões com o mecanismo de autenticação simples.
 *  - oauth2 (Opcional) Aceita aquelas conexões com o mecanismo de autenticação Oauth2.
 *  - anonymous (Opcional) Aceita aquelas conexões com o mecanismo de autenticação Anonymous.
 *
 * @Diretiva {storage} O nosso sistema de armazenamento.
 *  - dialect (Obrigatório) O dialeto usado. Podendo ser: MySQL, PostGres ou então SQlite.
 *  - port (Opcional e Recomendado) A porta utilizada para conexão com o nosso banco de dados. Não é necessário para o SQlite.
 *  - host (Opcional e Recomendado) O endereço do nosso banco de dados. Não é necessário para o SQlite.
 *  - password (Obrigatório) A nossa senha de conexão com o banco. Não é necessário para o SQlite.
 *  - database (Obrigatório) O nome do banco utilizado.
 *  - user (Obrigatório) O nome do usuário do banco. Não necessário para o SQLite.
 */

module.exports = {

  // A gerencia de conexões irá carregar os tipos de conexões daqui.
  "connection": [{
      "type": "tcp",                // Conexão do tipo tcp.
      "port": 5222,                 // Porta utilizada nessa conexão.
      "interface": "0.0.0.0", 
      "domain": "127.0.0.1"         // Vamos escutar por conexões neste endereço.
    }, {
      "type": "bosh",               // Conexão do tipo BOSH
      "port": 5280,                 // Porta utilizada.
      "path": "http-bind",          // Extensão que utilizaremos.
      "interface": "0.0.0.0",
      "domain": "127.0.0.1"         // Vamos escutar por conexões neste endereço.
    }, {
      "type": "websocket",          // Conexão do tipo websocket.
      "port": 5281,                 // Porta utilizada.
      "interface": "0.0.0.0",
      "domain": "127.0.0.1"         // Vamos escutar por conexões neste endereço.
    }
  ],

  // Configura os mecanismos de autenticação
  "auth": [{
    "type": "simple",                // Mecanismo de autenticação SIMPLE.
    "testusers": false,
    "users": [{                      // Nossos usuários de teste.
      "user": "felippe",
      "password": "felippe10"
    }, {
      "user": "junior",
      "password": "junior10"
    }, {
      "user": "vinicius",
      "password": "vinicius10"
    }]
  },
  {
    "type": "oauth2",                 // Mecanismo de autenticação OAUTH2.
    "server": "localhost:3000"        // O servidor Oauth2. <umdez> Eu ainda não tenho certeza de qual servidor eu vou utilizar. 
  },
  {
    "type": "anonymous"               // Mecanismo de autenticação ANONYMOUS.
  }],
  
  // Armazenamento para os dados, este servidor utiliza sequeliza.
  "storage": {
    "dialect": "mysql",               // Dialeto utilizado, pode ser MySQL, SQlite e Postgres.
    "user": "leo",                    // Nome do usuário do banco de dados, não é necessário para o SQlite.
    "password": "montes",             // Senha do usuário do banco de dados, não é necessário para o SQlite.
    "database": "database",           // Nome do nosso banco de dados.
    "maxConcurrentQueries": 200,      // Valor máximo de consultas concorrentes.
    "maxConnections": 1,              // Valo máximo de conexões.
    "maxIdleTime": 30,                
    "host": "127.0.0.1",              // Endereço ao qual utilizaremos para a conexão com o banco de dados.
    "port": 3306                      // A porta ao qual utilizaremos para a conexão com o banco de dados.
  },
  
  // configurações para a api e o cors
  // <umdez> Eu ainda não sei como vou implementar a API Rest.
  "api": {
  "activate": true,
  "port": 8081,
  "cors": {
    // não utilize * em uso final
    "hosts": ["*"]
  }
}
  
};