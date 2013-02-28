TLS implementation independant of the transport layer
===

Adaptation of [forge] (https://github.com/digitalbazaar/forge) TLS abstract concept and replacement of forge buffers by ArrayBuffers/Typed Arrays

## Presentation :

This is a adaptation of forge TLS project (and excellent abstract concept) in order to establish easily TLS connexions independantly of the transport layer, both for server and client side, this can be used inside browsers or on server side environments like node.js using standard ArrayBuffers/Typed Arrays.

## Implementation :

See lib/abstract-tls.js which shows :

* how to use the abstract-tls client over a TCP connection connected to a node.js TLS server
* how to use the abstract-tls client over a TCP connection connected to a real TLS server
* how to use the abstract-tls client over a TCP connection connected to an abstract-tls server over a TCP connection
* how to use the abstract-tls server over a TCP connection connected to a real TLS client
* how to use the abstract-tls server and client inside the browsers using websocket

lib/abstract-tls.js does include all the necessary code from forge project minified to establish tls connections in a browser or node.js environment, if you are using node.js you can of course link directly the required modules (and remove the window var).

lib/browser-tls.js is just an adaptation of forge node-tls.js that can be ran directly inside browsers to test the abstract tls client and server

## Buffers :

Forge original buffers are using 'utf8' strings encoded in binary format :

	forge ByteBuffer :
		data : 'utf8' string (char code 0x00 to 0xFF)
		read : index

hex to forge 'utf8' : byte per byte transform to the corresponding utf8 character using charCodeAt
forge 'utf8' to hex : character per character transform to the corresponding hex value using fromCharCode

This implementation does switch to standard ArrayBuffers/Typed Arrays ( http://www.khronos.org/registry/typedarray/specs/latest/ ) as follow :

New buffers :

Since the forge code does manipulate strings we must conserve for now the (deprecated) binary format :

	new ByteBuffer :
		data : Uint8Array (binary representation of the 'utf8' string)
		read : index

Buffers can be hex buffers or text utf-8 encoded buffers using TextEncoder and TextDecoder functions (based on http://encoding.spec.whatwg.org/#api ).

Standard new Typed Array buffers do override potential already existing Buffer interface and follow node.js's more friendly Buffer syntax (see [Ayms/node-typedarray](https://github.com/Ayms/node-typedarray )

## Related projects :

* [Ayms/node-iAnonym](https://github.com/Ayms/iAnonym)
* [Ayms/node-Tor](https://github.com/Ayms/node-Tor)
* [Ayms/websocket](https://github.com/Ayms/websocket)
* [Ayms/node-typedarray](https://github.com/Ayms/node-typedarray)
* [Ayms/node-dom](https://github.com/Ayms/node-dom)
* [Ayms/node-bot](https://github.com/Ayms/node-bot)
* [Ayms/node-gadgets](https://github.com/Ayms/node-gadgets)