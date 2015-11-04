module.exports = {
  
  // Dominio onde será escutado para conexões
  domain: 'localhost',

  // Registrar eventos e atividades (erros, infos) principalmente dos clientes conectados
  logger: true,

  //tls: {
  //  keyPath: '/etc/xmpp-server/tls/localhost-key.pem',
  //  certPath: '/etc/xmpp-server/tls/localhost-cert.pem'
  //},

  // Escutar com websocket
  websocket: {
    port: 5280
  },

  // Carrega a gerencia de conexão
  "connection": [{
      "type": "tcp",
      "port": 5222,
      "interface": "0.0.0.0"
    }, {
      "type": "bosh",
      "port": 5280,
      "path": "http-bind",
      "interface": "0.0.0.0"
    }, {
      "type": "websocket",
      "port": 5281,
      "interface": "0.0.0.0"
    }
  ],

  // Configura o mecanismo de autenticação
  "auth": [{
    "type": "simple",
    "testusers": true,
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