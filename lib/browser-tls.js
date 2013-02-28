/*
See abstract-tls.js, include code here until createCert function (included)
To test inside the browser, set var node=false at the begining
*/

var end = {};
var data = {};

// create certificate for server and client
createCert('server', data);
createCert('client', data);

var success = false;

// create TLS client
end.client = forge.tls.createConnection(
{
   server: false,
   caStore: [data.server.cert],
   sessionCache: {},
   // supported cipher suites in order of preference
   cipherSuites: [
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
   virtualHost: 'server',
   verify: function(c, verified, depth, certs)
   {
      try {
	  console.log(
         'TLS Client verifying certificate w/CN: \"' +
         certs[0].subject.getField('CN').value +
         '\", verified: ' + verified + '...');
	  } catch(ee) {};
	  return true; //TODO - remove when caStore is populated
      //return verified;
   },
   connected: function(c)
   {
      console.log('TLS Client connected...');
      // send message to server
      setTimeout(function()
      {
		 var txt=forge.util.encodeUtf8('Hello Server');
         c.prepare(txt);
      }, 1);
   },
   getCertificate: function(c, hint)
   {
      console.log('Client getting certificate ...');
      return data.client.cert;
   },
   getPrivateKey: function(c, cert)
   {
      return data.client.privateKey;
   },
   tlsDataReady: function(c)
   {
      // send TLS data to server
      end.server.process(c.tlsData.getBytes());
   },
   dataReady: function(c)
   {
      console.log('Client received : '+c.data.getBytes());
   },
   closed: function(c)
   {
      console.log('Client disconnected.');
      if(success)
      {
         console.log('PASS');
      }
      else
      {
         console.log('FAIL');
      }
   },
   error: function(c, error)
   {
      console.log('Client error: ' + error.message);
   }
});

// create TLS server
end.server = forge.tls.createConnection(
{
   server: true,
   caStore: [data.client.cert],
   sessionCache: {},
   // supported cipher suites in order of preference
   cipherSuites: [
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
      forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
   connected: function(c)
   {
      console.log('Server connected');
   },
   verifyClient: true,
   verify: function(c, verified, depth, certs)
   {
      console.log(
         'Server verifying certificate w/CN: \"' +
         certs[0].subject.getField('CN').value +
         '\", verified: ' + verified + '...');
      return verified;
   },
   getCertificate: function(c, hint)
   {
      console.log('Server getting certificate for \"' + hint[0] + '\"...');
      return data.server.cert;
   },
   getPrivateKey: function(c, cert)
   {
      return data.server.privateKey;
   },
   tlsDataReady: function(c)
   {
      // send TLS data to client
      end.client.process(c.tlsData.getBytes());
   },
   dataReady: function(c)
   {
      console.log('Server received \"' + c.data.getBytes() + '\"');
      // send response
      c.prepare('Hello Client');
   },
   closed: function(c)
   {
      console.log('Server disconnected.');
   },
   error: function(c, error)
   {
      console.log('Server error: ' + error.message);
   }
});

console.log('created TLS client and server, doing handshake...');
end.client.handshake();