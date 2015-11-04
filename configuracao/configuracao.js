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
  }]
  
};