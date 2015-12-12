/* Exporta objeto contendo os dados de configuração para o nosso servidor XMPP.
 *
 * @Arquivo configuracao.js 
 */

/* Aqui temos a configuração do nosso serviço.
 *
 * @Diretiva {connection} As formas de conexões aceitas. (tcp, bosh, websocket).
 * @Diretiva {auth} As autenticaçõe disponíveis.
 * @Diretiva {storage} O nosso sistema de armazenamento.
 */

module.exports = {

  // A gerencia de conexões irá carregar os tipos de conexões daqui.
  "connection": [{
      "type": "tcp",
      "port": 5222,
      "interface": "0.0.0.0",
      "domain": "localhost"
    }, {
      "type": "bosh",
      "port": 5280,
      "path": "http-bind",
      "interface": "0.0.0.0",
      "domain": "localhost"
    }, {
      "type": "websocket",
      "port": 5281,
      "interface": "0.0.0.0",
      "domain": "localhost"
    }
  ],

  // Configura os mecanismos de autenticação
  "auth": [{
    "type": "simple",
    "testusers": false,
    "users": [{
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
    "type": "oauth2",
    "server": "localhost"
  },
  {
    "type": "anonymous"
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
  "port": 8080,
  "cors": {
    // não utilize * em uso final
    "hosts": ["*"]
  }
}
  
};