module.exports = {

  // Carrega a gerencia de conexão
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

  // Configura o mecanismo de autenticação
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
    "type": "anonimo"
  }],
  
  // Armazenamento para os dados, este servidor utiliza sequeliza.
  "storage": {
    "dialect": "mysql",
    "user": "leo",
    "password": "montes",
    "database": "database",
    "storage": "./database.sqlite",
	"maxConcurrentQueries": 100,
	"maxConnections": 1,
	"maxIdleTime": 30
  },
  
  // configurações para a api e o cors
  "api": {
  "activate": true,
  "port": 8080,
  "cors": {
    // não utilize * em uso final
    "hosts": ["*"]
  }
}
  
};