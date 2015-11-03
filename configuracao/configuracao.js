module.exports = {
  port: 5222,
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
  }
  
};