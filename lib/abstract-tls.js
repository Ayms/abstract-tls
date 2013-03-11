/* 	Copyright 2013 Aymeric Vitte (Ayms)
	MIT Licence
*/

(function() {
	var _node=false; // true : node.js environment
	var forge_buffers=false; //true use original forge buffers
	var data_view=false; //true use data view
	var node_buffers=false; //false override node.js Buffer with Typed Arrays - true is not working but you can modify the code if you really want to use node Buffers

	if (_node) {
		var fs = require('fs'),
			tls = require('tls'),
			net = require('net');
	};

	var window=window||{};

	var forge=window.forge={};

	var RVAL=0;

	/* Copyright Joshua Bell (chromium) 
	http://code.google.com/p/stringencoding/
	license Apache 2.0 
	Implementing TextEncoder/TextDecoder WHATWG specifications

	Modified by Aymeric Vitte (global)
	Used by createBuffer('utf8') and toString('utf8') methods - Note that this is not mandatory and could be replaced by forge utils function but this code does include a stream option that can be helpfull in case of streaming
	*/

	function inRange(c,d,b){return d<=c&&c<=b}function div(b,a){return Math.floor(b/a)}var EOF_byte=-1;var EOF_code_point=-1;function ByteInputStream(a){var b=0;this.get=function(){return(b>=a.length)?EOF_byte:Number(a[b])};this.offset=function(c){b+=c;if(b<0){throw new Error("Seeking past start of the buffer")}if(b>a.length){throw new Error("Seeking past EOF")}};this.match=function(d){if(d.length>b+a.length){return false}var c;for(c=0;c<d.length;c+=1){if(Number(a[b+c])!==d[c]){return false}}return true}}function ByteOutputStream(a){var b=0;this.emit=function(e){var d=EOF_byte;var c;for(c=0;c<arguments.length;++c){d=Number(arguments[c]);a[b++]=d}return d}}function CodePointInputStream(a){function b(g){var k=[];var h=0,m=g.length;while(h<g.length){var l=g.charCodeAt(h);if(!inRange(l,55296,57343)){k.push(l)}else{if(inRange(l,56320,57343)){k.push(65533)}else{if(h===m-1){k.push(65533)}else{var j=g.charCodeAt(h+1);if(inRange(j,56320,57343)){var f=l&1023;var e=j&1023;h+=1;k.push(65536+(f<<10)+e)}else{k.push(65533)}}}}h+=1}return k}var d=0;var c=b(a);this.offset=function(e){d+=e;if(d<0){throw new Error("Seeking past start of the buffer")}if(d>c.length){throw new Error("Seeking past EOF")}};this.get=function(){if(d>=c.length){return EOF_code_point}return c[d]}}function CodePointOutputStream(){var a="";this.string=function(){return a};this.emit=function(b){if(b<=65535){a+=String.fromCharCode(b)}else{b-=65536;a+=String.fromCharCode(55296+((b>>10)&1023));a+=String.fromCharCode(56320+(b&1023))}}}function EncodingError(a){this.name="EncodingError";this.message=a;this.code=0}EncodingError.prototype=Error.prototype;function decoderError(b,a){if(b){throw new EncodingError("Decoder error")}return a||65533}function encoderError(a){throw new EncodingError("The code point "+a+" could not be encoded.")}function getEncoding(a){a=String(a).trim().toLowerCase();if(Object.prototype.hasOwnProperty.call(label_to_encoding,a)){return label_to_encoding[a]}return null}var encodings=[{encodings:[{labels:["unicode-1-1-utf-8","utf-8","utf8"],name:"utf-8"}],heading:"The Encoding"},{encodings:[{labels:["cp864","ibm864"],name:"ibm864"},{labels:["cp866","ibm866"],name:"ibm866"},{labels:["csisolatin2","iso-8859-2","iso-ir-101","iso8859-2","iso_8859-2","l2","latin2"],name:"iso-8859-2"},{labels:["csisolatin3","iso-8859-3","iso_8859-3","iso-ir-109","l3","latin3"],name:"iso-8859-3"},{labels:["csisolatin4","iso-8859-4","iso_8859-4","iso-ir-110","l4","latin4"],name:"iso-8859-4"},{labels:["csisolatincyrillic","cyrillic","iso-8859-5","iso_8859-5","iso-ir-144"],name:"iso-8859-5"},{labels:["arabic","csisolatinarabic","ecma-114","iso-8859-6","iso_8859-6","iso-ir-127"],name:"iso-8859-6"},{labels:["csisolatingreek","ecma-118","elot_928","greek","greek8","iso-8859-7","iso_8859-7","iso-ir-126"],name:"iso-8859-7"},{labels:["csisolatinhebrew","hebrew","iso-8859-8","iso-8859-8-i","iso-ir-138","iso_8859-8","visual"],name:"iso-8859-8"},{labels:["csisolatin6","iso-8859-10","iso-ir-157","iso8859-10","l6","latin6"],name:"iso-8859-10"},{labels:["iso-8859-13"],name:"iso-8859-13"},{labels:["iso-8859-14","iso8859-14"],name:"iso-8859-14"},{labels:["iso-8859-15","iso_8859-15"],name:"iso-8859-15"},{labels:["iso-8859-16"],name:"iso-8859-16"},{labels:["koi8-r","koi8_r"],name:"koi8-r"},{labels:["koi8-u"],name:"koi8-u"},{labels:["csmacintosh","mac","macintosh","x-mac-roman"],name:"macintosh"},{labels:["iso-8859-11","tis-620","windows-874"],name:"windows-874"},{labels:["windows-1250","x-cp1250"],name:"windows-1250"},{labels:["windows-1251","x-cp1251"],name:"windows-1251"},{labels:["ascii","ansi_x3.4-1968","csisolatin1","iso-8859-1","iso8859-1","iso_8859-1","l1","latin1","us-ascii","windows-1252"],name:"windows-1252"},{labels:["cp1253","windows-1253"],name:"windows-1253"},{labels:["csisolatin5","iso-8859-9","iso-ir-148","l5","latin5","windows-1254"],name:"windows-1254"},{labels:["cp1255","windows-1255"],name:"windows-1255"},{labels:["cp1256","windows-1256"],name:"windows-1256"},{labels:["windows-1257"],name:"windows-1257"},{labels:["cp1258","windows-1258"],name:"windows-1258"},{labels:["x-mac-cyrillic","x-mac-ukrainian"],name:"x-mac-cyrillic"}],heading:"Legacy single-byte encodings"},{encodings:[{labels:["chinese","csgb2312","csiso58gb231280","gb2312","gbk","gb_2312","gb_2312-80","iso-ir-58","x-gbk"],name:"gbk"},{labels:["gb18030"],name:"gb18030"},{labels:["hz-gb-2312"],name:"hz-gb-2312"}],heading:"Legacy multi-byte Chinese (simplified) encodings"},{encodings:[{labels:["big5","big5-hkscs","cn-big5","csbig5","x-x-big5"],name:"big5"}],heading:"Legacy multi-byte Chinese (traditional) encodings"},{encodings:[{labels:["cseucpkdfmtjapanese","euc-jp","x-euc-jp"],name:"euc-jp"},{labels:["csiso2022jp","iso-2022-jp"],name:"iso-2022-jp"},{labels:["csshiftjis","ms_kanji","shift-jis","shift_jis","sjis","windows-31j","x-sjis"],name:"shift_jis"}],heading:"Legacy multi-byte Japanese encodings"},{encodings:[{labels:["cseuckr","csksc56011987","euc-kr","iso-ir-149","korean","ks_c_5601-1987","ks_c_5601-1989","ksc5601","ksc_5601","windows-949"],name:"euc-kr"},{labels:["csiso2022kr","iso-2022-kr"],name:"iso-2022-kr"}],heading:"Legacy multi-byte Korean encodings"},{encodings:[{labels:["utf-16","utf-16le"],name:"utf-16"},{labels:["utf-16be"],name:"utf-16be"}],heading:"Legacy utf-16 encodings"}];var name_to_encoding={};var label_to_encoding={};encodings.forEach(function(a){a.encodings.forEach(function(b){name_to_encoding[b.name]=b;b.labels.forEach(function(c){label_to_encoding[c]=b})})});function indexCodePointFor(b,a){return(a||[])[b]||null}function indexPointerFor(b,a){var c=a.indexOf(b);return c===-1?null:c}var indexes={};function indexGB18030CodePointFor(f){if((f>39419&&f<189000)||(f>1237575)){return null}var e=0,c=0,a=indexes.gb18030;var b;for(b=0;b<a.length;++b){var d=a[b];if(d[0]<=f){e=d[0];c=d[1]}else{break}}return c+f-e}function indexGB18030PointerFor(d){var f=0,c=0,a=indexes.gb18030;var b;for(b=0;b<a.length;++b){var e=a[b];if(e[1]<=d){f=e[1];c=e[0]}else{break}}return c+d-f}function UTF8Decoder(a){var e=a.fatal;var c=0,f=0,b=0,d=0;this.decode=function(g){var j=g.get();if(j===EOF_byte){if(f!==0){return decoderError(e)}return EOF_code_point}g.offset(1);if(f===0){if(inRange(j,0,127)){return j}if(inRange(j,194,223)){f=1;d=128;c=j-192}else{if(inRange(j,224,239)){f=2;d=2048;c=j-224}else{if(inRange(j,240,244)){f=3;d=65536;c=j-240}else{return decoderError(e)}}}c=c*Math.pow(64,f);return null}if(!inRange(j,128,191)){c=0;f=0;b=0;d=0;g.offset(-1);return decoderError(e)}b+=1;c=c+(j-128)*Math.pow(64,f-b);if(b!==f){return null}var h=c;var i=d;c=0;f=0;b=0;d=0;if(inRange(h,i,1114111)&&!inRange(h,55296,57343)){return h}return decoderError(e)}}function UTF8Encoder(a){var b=a.fatal;this.encode=function(i,d){var f=d.get();if(f===EOF_code_point){return EOF_byte}d.offset(1);if(inRange(f,55296,57343)){return encoderError(f)}if(inRange(f,0,127)){return i.emit(f)}var g,h;if(inRange(f,128,2047)){g=1;h=192}else{if(inRange(f,2048,65535)){g=2;h=224}else{if(inRange(f,65536,1114111)){g=3;h=240}}}var c=i.emit(div(f,Math.pow(64,g))+h);while(g>0){var e=div(f,Math.pow(64,g-1));c=i.emit(128+(e%64));g-=1}return c}}name_to_encoding["utf-8"].getEncoder=function(a){return new UTF8Encoder(a)};name_to_encoding["utf-8"].getDecoder=function(a){return new UTF8Decoder(a)};function SingleByteDecoder(b,a){var c=a.fatal;this.decode=function(d){var f=d.get();if(f===EOF_byte){return EOF_code_point}d.offset(1);if(inRange(f,0,127)){return f}var e=b[f-128];if(e===null){return decoderError(c)}return e}}function SingleByteEncoder(b,a){var c=a.fatal;this.encode=function(g,d){var e=d.get();if(e===EOF_code_point){return EOF_byte}d.offset(1);if(inRange(e,0,127)){return g.emit(e)}var f=indexPointerFor(e,b);if(f===null){encoderError(e)}return g.emit(f+128)}}(function(){["ibm864","ibm866","iso-8859-2","iso-8859-3","iso-8859-4","iso-8859-5","iso-8859-6","iso-8859-7","iso-8859-8","iso-8859-10","iso-8859-13","iso-8859-14","iso-8859-15","iso-8859-16","koi8-r","koi8-u","macintosh","windows-874","windows-1250","windows-1251","windows-1252","windows-1253","windows-1254","windows-1255","windows-1256","windows-1257","windows-1258","x-mac-cyrillic"].forEach(function(b){var c=name_to_encoding[b];var a=indexes[b];c.getDecoder=function(d){return new SingleByteDecoder(a,d)};c.getEncoder=function(d){return new SingleByteEncoder(a,d)}})}());function GBKDecoder(c,b){var f=b.fatal;var a=0,e=0,d=0;this.decode=function(g){var l=g.get();if(l===EOF_byte&&a===0&&e===0&&d===0){return EOF_code_point}if(l===EOF_byte&&(a!==0||e!==0||d!==0)){a=0;e=0;d=0;decoderError(f)}g.offset(1);var i;if(d!==0){i=null;if(inRange(l,48,57)){i=indexGB18030CodePointFor((((a-129)*10+(e-48))*126+(d-129))*10+l-48)}a=0;e=0;d=0;if(i===null){g.offset(-3);return decoderError(f)}return i}if(e!==0){if(inRange(l,129,254)){d=l;return null}g.offset(-2);a=0;e=0;return decoderError(f)}if(a!==0){if(inRange(l,48,57)&&c){e=l;return null}var h=a;var k=null;a=0;var j=l<127?64:65;if(inRange(l,64,126)||inRange(l,128,254)){k=(h-129)*190+(l-j)}i=k===null?null:indexCodePointFor(k,indexes.gbk);if(k===null){g.offset(-1)}if(i===null){return decoderError(f)}return i}if(inRange(l,0,127)){return l}if(l===128){return 8364}if(inRange(l,129,254)){a=l;return null}return decoderError(f)}}function GBKEncoder(b,a){var c=a.fatal;this.encode=function(h,k){var g=k.get();if(g===EOF_code_point){return EOF_byte}k.offset(1);if(inRange(g,0,127)){return h.emit(g)}var d=indexPointerFor(g,indexes.gbk);if(d!==null){var i=div(d,190)+129;var e=d%190;var f=e<63?64:65;return h.emit(i,e+f)}if(d===null&&!b){return encoderError(g)}d=indexGB18030PointerFor(g);var n=div(div(div(d,10),126),10);d=d-n*10*126*10;var m=div(div(d,10),126);d=d-m*10*126;var l=div(d,10);var j=d-l*10;return h.emit(n+129,m+48,l+129,j+48)}}name_to_encoding.gbk.getEncoder=function(a){return new GBKEncoder(false,a)};name_to_encoding.gbk.getDecoder=function(a){return new GBKDecoder(false,a)};name_to_encoding.gb18030.getEncoder=function(a){return new GBKEncoder(true,a)};name_to_encoding.gb18030.getDecoder=function(a){return new GBKDecoder(true,a)};function HZGB2312Decoder(c){var d=c.fatal;var b=false,a=0;this.decode=function(e){var h=e.get();if(h===EOF_byte&&a===0){return EOF_code_point}if(h===EOF_byte&&a!==0){a=0;return decoderError(d)}e.offset(1);if(a===126){a=0;if(h===123){b=true;return null}if(h===125){b=false;return null}if(h===126){return 126}if(h===10){return null}e.offset(-1);return decoderError(d)}if(a!==0){var f=a;a=0;var g=null;if(inRange(h,33,126)){g=indexCodePointFor((f-1)*190+(h+63),indexes.gbk)}if(h===10){b=false}if(g===null){return decoderError(d)}return g}if(h===126){a=126;return null}if(b){if(inRange(h,32,127)){a=h;return null}if(h===10){b=false}return decoderError(d)}if(inRange(h,0,127)){return h}return decoderError(d)}}function HZGB2312Encoder(b){var c=b.fatal;var a=false;this.encode=function(i,d){var g=d.get();if(g===EOF_code_point){return EOF_byte}d.offset(1);if(inRange(g,0,127)&&a){d.offset(-1);a=false;return i.emit(126,125)}if(g===126){return i.emit(126,126)}if(inRange(g,0,127)){return i.emit(g)}if(!a){d.offset(-1);a=true;return i.emit(126,123)}var h=indexPointerFor(g,indexes.gbk);if(h===null){return encoderError(g)}var f=div(h,190)+1;var e=h%190-63;if(!inRange(f,33,126)||!inRange(e,33,126)){return encoderError(g)}return i.emit(f,e)}}name_to_encoding["hz-gb-2312"].getEncoder=function(a){return new HZGB2312Encoder(a)};name_to_encoding["hz-gb-2312"].getDecoder=function(a){return new HZGB2312Decoder(a)};function Big5Decoder(b){var d=b.fatal;var a=0,c=null;this.decode=function(e){if(c!==null){var j=c;c=null;return j}var k=e.get();if(k===EOF_byte&&a===0){return EOF_code_point}if(k===EOF_byte&&a!==0){a=0;return decoderError(d)}e.offset(1);if(a!==0){var f=a;var i=null;a=0;var h=k<127?64:98;if(inRange(k,64,126)||inRange(k,161,254)){i=(f-129)*157+(k-h)}if(i===1133){c=772;return 202}if(i===1135){c=780;return 202}if(i===1164){c=772;return 234}if(i===1166){c=780;return 234}var g=(i===null)?null:indexCodePointFor(i,indexes.big5);if(i===null){e.offset(-1)}if(g===null){return decoderError(d)}return g}if(inRange(k,0,127)){return k}if(inRange(k,129,254)){a=k;return null}return decoderError(d)}}function Big5Encoder(a){var b=a.fatal;this.encode=function(i,c){var f=c.get();if(f===EOF_code_point){return EOF_byte}c.offset(1);if(inRange(f,0,127)){return i.emit(f)}var h=indexPointerFor(f,indexes.big5);if(h===null){return encoderError(f)}var e=div(h,157)+129;var d=h%157;var g=d<63?64:98;return i.emit(e,d+g)}}name_to_encoding.big5.getEncoder=function(a){return new Big5Encoder(a)};name_to_encoding.big5.getDecoder=function(a){return new Big5Decoder(a)};function EUCJPDecoder(a){var c=a.fatal;var b=0,d=0;this.decode=function(e){var h=e.get();if(h===EOF_byte){if(b===0&&d===0){return EOF_code_point}b=0;d=0;return decoderError(c)}e.offset(1);var f,g;if(d!==0){f=d;d=0;g=null;if(inRange(f,161,254)&&inRange(h,161,254)){g=indexCodePointFor((f-161)*94+h-161,indexes.jis0212)}if(!inRange(h,161,254)){e.offset(-1)}if(g===null){return decoderError(c)}return g}if(b===142&&inRange(h,161,223)){b=0;return 65377+h-161}if(b===143&&inRange(h,161,254)){b=0;d=h;return null}if(b!==0){f=b;b=0;g=null;if(inRange(f,161,254)&&inRange(h,161,254)){g=indexCodePointFor((f-161)*94+h-161,indexes.jis0208)}if(!inRange(h,161,254)){e.offset(-1)}if(g===null){return decoderError(c)}return g}if(inRange(h,0,127)){return h}if(h===142||h===143||(inRange(h,161,254))){b=h;return null}return decoderError(c)}}function EUCJPEncoder(a){var b=a.fatal;this.encode=function(h,c){var f=c.get();if(f===EOF_code_point){return EOF_byte}c.offset(1);if(inRange(f,0,127)){return h.emit(f)}if(f===165){return h.emit(92)}if(f===8254){return h.emit(126)}if(inRange(f,65377,65439)){return h.emit(142,f-65377+161)}var g=indexPointerFor(f,indexes.jis0208);if(g===null){return encoderError(f)}var e=div(g,94)+161;var d=g%94+161;return h.emit(e,d)}}name_to_encoding["euc-jp"].getEncoder=function(a){return new EUCJPEncoder(a)};name_to_encoding["euc-jp"].getDecoder=function(a){return new EUCJPDecoder(a)};function ISO2022JPDecoder(a){var d=a.fatal;var c={ASCII:0,escape_start:1,escape_middle:2,escape_final:3,lead:4,trail:5,Katakana:6};var e=c.ASCII,f=false,b=0;this.decode=function(g){var k=g.get();if(k!==EOF_byte){g.offset(1)}switch(e){default:case c.ASCII:if(k===27){e=c.escape_start;return null}if(inRange(k,0,127)){return k}if(k===EOF_byte){return EOF_code_point}return decoderError(d);case c.escape_start:if(k===36||k===40){b=k;e=c.escape_middle;return null}if(k!==EOF_byte){g.offset(-1)}e=c.ASCII;return decoderError(d);case c.escape_middle:var h=b;b=0;if(h===36&&(k===64||k===66)){f=false;e=c.lead;return null}if(h===36&&k===40){e=c.escape_final;return null}if(h===40&&(k===66||k===74)){e=c.ASCII;return null}if(h===40&&k===73){e=c.Katakana;return null}if(k===EOF_byte){g.offset(-1)}else{g.offset(-2)}e=c.ASCII;return decoderError(d);case c.escape_final:if(k===68){f=true;e=c.lead;return null}if(k===EOF_byte){g.offset(-2)}else{g.offset(-3)}e=c.ASCII;return decoderError(d);case c.lead:if(k===10){e=c.ASCII;return decoderError(d,10)}if(k===27){e=c.escape_start;return null}if(k===EOF_byte){return EOF_code_point}b=k;e=c.trail;return null;case c.trail:e=c.lead;if(k===EOF_byte){return decoderError(d)}var i=null;var j=(b-33)*94+k-33;if(inRange(b,33,126)&&inRange(k,33,126)){i=(f===false)?indexCodePointFor(j,indexes.jis0208):indexCodePointFor(j,indexes.jis0212)}if(i===null){return decoderError(d)}return i;case c.Katakana:if(k===27){e=c.escape_start;return null}if(inRange(k,33,95)){return 65377+k-33}if(k===EOF_byte){return EOF_code_point}return decoderError(d)}}}function ISO2022JPEncoder(a){var c=a.fatal;var b={ASCII:0,lead:1,Katakana:2};var d=b.ASCII;this.encode=function(j,e){var h=e.get();if(h===EOF_code_point){return EOF_byte}e.offset(1);if((inRange(h,0,127)||h===165||h===8254)&&d!==b.ASCII){e.offset(-1);d=b.ASCII;return j.emit(27,40,66)}if(inRange(h,0,127)){return j.emit(h)}if(h===165){return j.emit(92)}if(h===8254){return j.emit(126)}if(inRange(h,65377,65439)&&d!==b.Katakana){e.offset(-1);d=b.Katakana;return j.emit(27,40,73)}if(inRange(h,65377,65439)){return j.emit(h-65377-33)}if(d!==b.lead){e.offset(-1);d=b.lead;return j.emit(27,36,66)}var i=indexPointerFor(h,indexes.jis0208);if(i===null){return encoderError(h)}var g=div(i,94)+33;var f=i%94+33;return j.emit(g,f)}}name_to_encoding["iso-2022-jp"].getEncoder=function(a){return new ISO2022JPEncoder(a)};name_to_encoding["iso-2022-jp"].getDecoder=function(a){return new ISO2022JPDecoder(a)};function ShiftJISDecoder(a){var c=a.fatal;var b=0;this.decode=function(d){var i=d.get();if(i===EOF_byte&&b===0){return EOF_code_point}if(i===EOF_byte&&b!==0){b=0;return decoderError(c)}d.offset(1);if(b!==0){var e=b;b=0;if(inRange(i,64,126)||inRange(i,128,252)){var g=(i<127)?64:65;var h=(e<160)?129:193;var f=indexCodePointFor((e-h)*188+i-g,indexes.jis0208);if(f===null){return decoderError(c)}return f}d.offset(-1);return decoderError(c)}if(inRange(i,0,128)){return i}if(inRange(i,161,223)){return 65377+i-161}if(inRange(i,129,159)||inRange(i,224,252)){b=i;return null}return decoderError(c)}}function ShiftJISEncoder(a){var b=a.fatal;this.encode=function(i,c){var f=c.get();if(f===EOF_code_point){return EOF_byte}c.offset(1);if(inRange(f,0,128)){return i.emit(f)}if(f===165){return i.emit(92)}if(f===8254){return i.emit(126)}if(inRange(f,65377,65439)){return i.emit(f-65377+161)}var h=indexPointerFor(f,indexes.jis0208);if(h===null){return encoderError(f)}var e=div(h,188);var j=e<31?129:193;var d=h%188;var g=d<63?64:65;return i.emit(e+j,d+g)}}name_to_encoding.shift_jis.getEncoder=function(a){return new ShiftJISEncoder(a)};name_to_encoding.shift_jis.getDecoder=function(a){return new ShiftJISDecoder(a)};function EUCKRDecoder(b){var c=b.fatal;var a=0;this.decode=function(e){var i=e.get();if(i===EOF_byte&&a===0){return EOF_code_point}if(i===EOF_byte&&a!==0){a=0;return decoderError(c)}e.offset(1);if(a!==0){var f=a;var h=null;a=0;if(inRange(f,129,198)){var d=(26+26+126)*(f-129);if(inRange(i,65,90)){h=d+i-65}else{if(inRange(i,97,122)){h=d+26+i-97}else{if(inRange(i,129,254)){h=d+26+26+i-129}}}}if(inRange(f,199,253)&&inRange(i,161,254)){h=(26+26+126)*(199-129)+(f-199)*94+(i-161)}var g=(h===null)?null:indexCodePointFor(h,indexes["euc-kr"]);if(h===null){e.offset(-1)}if(g===null){return decoderError(c)}return g}if(inRange(i,0,127)){return i}if(inRange(i,129,253)){a=i;return null}return decoderError(c)}}function EUCKREncoder(a){var b=a.fatal;this.encode=function(i,c){var f=c.get();if(f===EOF_code_point){return EOF_byte}c.offset(1);if(inRange(f,0,127)){return i.emit(f)}var h=indexPointerFor(f,indexes["euc-kr"]);if(h===null){return encoderError(f)}var e,d;if(h<((26+26+126)*(199-129))){e=div(h,(26+26+126))+129;d=h%(26+26+126);var g=d<26?65:d<26+26?71:77;return i.emit(e,d+g)}h=h-(26+26+126)*(199-129);e=div(h,94)+199;d=h%94+161;return i.emit(e,d)}}name_to_encoding["euc-kr"].getEncoder=function(a){return new EUCKREncoder(a)};name_to_encoding["euc-kr"].getDecoder=function(a){return new EUCKRDecoder(a)};function ISO2022KRDecoder(b){var e=b.fatal;var c={ASCII:0,escape_start:1,escape_middle:2,escape_end:3,lead:4,trail:5};var a=c.ASCII,d=0;this.decode=function(f){var h=f.get();if(h!==EOF_byte){f.offset(1)}switch(a){default:case c.ASCII:if(h===14){a=c.lead;return null}if(h===15){return null}if(h===27){a=c.escape_start;return null}if(inRange(h,0,127)){return h}if(h===EOF_byte){return EOF_code_point}return decoderError(e);case c.escape_start:if(h===36){a=c.escape_middle;return null}if(h!==EOF_byte){f.offset(-1)}a=c.ASCII;return decoderError(e);case c.escape_middle:if(h===41){a=c.escape_end;return null}if(h===EOF_byte){f.offset(-1)}else{f.offset(-2)}a=c.ASCII;return decoderError(e);case c.escape_end:if(h===67){a=c.ASCII;return null}if(h===EOF_byte){f.offset(-2)}else{f.offset(-3)}a=c.ASCII;return decoderError(e);case c.lead:if(h===10){a=c.ASCII;return decoderError(e,10)}if(h===14){return null}if(h===15){a=c.ASCII;return null}if(h===EOF_byte){return EOF_code_point}d=h;a=c.trail;return null;case c.trail:a=c.lead;if(h===EOF_byte){return decoderError(e)}var g=null;if(inRange(d,33,70)&&inRange(h,33,126)){g=indexCodePointFor((26+26+126)*(d-1)+26+26+h-1,indexes["euc-kr"])}else{if(inRange(d,71,126)&&inRange(h,33,126)){g=indexCodePointFor((26+26+126)*(199-129)+(d-71)*94+(h-33),indexes["euc-kr"])}}if(g!==null){return g}return decoderError(e)}}}function ISO2022KREncoder(b){var e=b.fatal;var d={ASCII:0,lead:1};var c=false,a=d.ASCII;this.encode=function(k,f){var i=f.get();if(i===EOF_code_point){return EOF_byte}if(!c){c=true;k.emit(27,36,41,67)}f.offset(1);if(inRange(i,0,127)&&a!==d.ASCII){f.offset(-1);a=d.ASCII;return k.emit(15)}if(inRange(i,0,127)){return k.emit(i)}if(a!==d.lead){f.offset(-1);a=d.lead;return k.emit(14)}var j=indexPointerFor(i,indexes["euc-kr"]);if(j===null){return encoderError(i)}var h,g;if(j<(26+26+126)*(199-129)){h=div(j,(26+26+126))+1;g=j%(26+26+126)-26-26+1;if(!inRange(h,33,70)||!inRange(g,33,126)){return encoderError(i)}return k.emit(h,g)}j=j-(26+26+126)*(199-129);h=div(j,94)+71;g=j%94+33;if(!inRange(h,71,126)||!inRange(g,33,126)){return encoderError(i)}return k.emit(h,g)}}name_to_encoding["iso-2022-kr"].getEncoder=function(a){return new ISO2022KREncoder(a)};name_to_encoding["iso-2022-kr"].getDecoder=function(a){return new ISO2022KRDecoder(a)};function UTF16Decoder(e,b){var d=b.fatal;var c=null,a=null;this.decode=function(f){var i=f.get();if(i===EOF_byte&&c===null&&a===null){return EOF_code_point}if(i===EOF_byte&&(c!==null||a!==null)){return decoderError(d)}f.offset(1);if(c===null){c=i;return null}var g;if(e){g=(c<<8)+i}else{g=(i<<8)+c}c=null;if(a!==null){var h=a;a=null;if(inRange(g,56320,57343)){return 65536+(h-55296)*1024+(g-56320)}f.offset(-2);return decoderError(d)}if(inRange(g,55296,56319)){a=g;return null}if(inRange(g,56320,57343)){return decoderError(d)}return g}}function UTF16Encoder(c,a){var b=a.fatal;this.encode=function(i,e){function d(l){var k=l>>8;var j=l&255;if(c){return i.emit(k,j)}return i.emit(j,k)}var h=e.get();if(h===EOF_code_point){return EOF_byte}e.offset(1);if(inRange(h,55296,57343)){encoderError(h)}if(h<=65535){return d(h)}var g=div((h-65536),1024)+55296;var f=((h-65536)%1024)+56320;d(g);return d(f)}}name_to_encoding["utf-16"].getEncoder=function(a){return new UTF16Encoder(false,a)};name_to_encoding["utf-16"].getDecoder=function(a){return new UTF16Decoder(false,a)};name_to_encoding["utf-16be"].getEncoder=function(a){return new UTF16Encoder(true,a)};name_to_encoding["utf-16be"].getDecoder=function(a){return new UTF16Decoder(true,a)};function detectEncoding(a,b){if(b.match([255,254])){b.offset(2);return"utf-16"}if(b.match([254,255])){b.offset(2);return"utf-16be"}if(b.match([239,187,191])){b.offset(3);return"utf-8"}return a}function consumeBOM(a,b){if(b.match([255,254])&&a==="utf-16"){b.offset(2);return}if(b.match([254,255])&&a=="utf-16be"){b.offset(2);return}if(b.match([239,187,191])&&a=="utf-8"){b.offset(3);return}}var DEFAULT_ENCODING="utf-8";function TextEncoder(b,a){b=b?String(b):DEFAULT_ENCODING;a=Object(a);this._encoding=getEncoding(b);if(this._encoding===null||(this._encoding.name!=="utf-8"&&this._encoding.name!=="utf-16"&&this._encoding.name!=="utf-16be")){throw new TypeError("Unknown encoding: "+b)}this._streaming=false;this._encoder=null;this._options={fatal:Boolean(a.fatal)};if(Object.defineProperty){Object.defineProperty(this,"encoding",{get:function(){return this._encoding.name}})}else{this.encoding=this._encoding.name}return this}TextEncoder.prototype={encode:function encode(b,e){b=b?String(b):"";e=Object(e);if(!this._streaming){this._encoder=this._encoding.getEncoder(this._options)}this._streaming=Boolean(e.stream);var c=[];var d=new ByteOutputStream(c);var f=new CodePointInputStream(b);while(f.get()!==EOF_code_point){this._encoder.encode(d,f)}if(!this._streaming){var a;do{a=this._encoder.encode(d,f)}while(a!==EOF_byte);this._encoder=null}return new Uint8Array(c)}};function TextDecoder(b,a){b=b?String(b):DEFAULT_ENCODING;a=Object(a);this._encoding=getEncoding(b);if(this._encoding===null){throw new TypeError("Unknown encoding: "+b)}this._streaming=false;this._decoder=null;this._options={fatal:Boolean(a.fatal)};if(Object.defineProperty){Object.defineProperty(this,"encoding",{get:function(){return this._encoding.name}})}else{this.encoding=this._encoding.name}return this}TextDecoder.prototype={decode:function decode(e,c){if(e&&!("buffer" in e&&"byteOffset" in e&&"byteLength" in e)){throw new TypeError("Expected ArrayBufferView")}else{if(!e){e=new Uint8Array(0)}}c=Object(c);if(!this._streaming){this._decoder=this._encoding.getDecoder(this._options)}this._streaming=Boolean(c.stream);var a=new Uint8Array(e.buffer,e.byteOffset,e.byteLength);var f=new ByteInputStream(a);if(!this._BOMseen){this._BOMseen=true;consumeBOM(this._encoding.name,f)}var b=new CodePointOutputStream(),d;while(f.get()!==EOF_byte){d=this._decoder.decode(f);if(d!==null&&d!==EOF_code_point){b.emit(d)}}if(!this._streaming){do{d=this._decoder.decode(f);if(d!==null&&d!==EOF_code_point){b.emit(d)}}while(d!==EOF_code_point&&f.get()!=EOF_byte);this._decoder=null}return b.string()}};

	//util.js

	/**
	 * Utility functions for web applications.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){if(typeof(window)!=="undefined"){var k=window.forge=window.forge||{};k.util={}}else{if(typeof(module)!=="undefined"&&module.exports){var k={};module.exports=k.util={}}}var f=k.util;f.ByteBuffer=function(m){this.data=m||"";this.read=0};f.ByteBuffer.prototype.length=function(){return this.data.length-this.read};f.ByteBuffer.prototype.isEmpty=function(){return(this.data.length-this.read)===0};f.ByteBuffer.prototype.putByte=function(m){this.data+=String.fromCharCode(m)};f.ByteBuffer.prototype.fillWithByte=function(m,p){m=String.fromCharCode(m);var o=this.data;while(p>0){if(p&1){o+=m}p>>>=1;if(p>0){m+=m}}this.data=o};f.ByteBuffer.prototype.putBytes=function(m){this.data+=m};f.ByteBuffer.prototype.putString=function(m){this.data+=f.encodeUtf8(m)};f.ByteBuffer.prototype.putInt16=function(m){this.data+=String.fromCharCode(m>>8&255)+String.fromCharCode(m&255)};f.ByteBuffer.prototype.putInt24=function(m){this.data+=String.fromCharCode(m>>16&255)+String.fromCharCode(m>>8&255)+String.fromCharCode(m&255)};f.ByteBuffer.prototype.putInt32=function(m){this.data+=String.fromCharCode(m>>24&255)+String.fromCharCode(m>>16&255)+String.fromCharCode(m>>8&255)+String.fromCharCode(m&255)};f.ByteBuffer.prototype.putInt16Le=function(m){this.data+=String.fromCharCode(m&255)+String.fromCharCode(m>>8&255)};f.ByteBuffer.prototype.putInt24Le=function(m){this.data+=String.fromCharCode(m&255)+String.fromCharCode(m>>8&255)+String.fromCharCode(m>>16&255)};f.ByteBuffer.prototype.putInt32Le=function(m){this.data+=String.fromCharCode(m&255)+String.fromCharCode(m>>8&255)+String.fromCharCode(m>>16&255)+String.fromCharCode(m>>24&255)};f.ByteBuffer.prototype.putInt=function(m,o){do{o-=8;this.data+=String.fromCharCode((m>>o)&255)}while(o>0)};f.ByteBuffer.prototype.putBuffer=function(m){this.data+=m.getBytes()};f.ByteBuffer.prototype.getByte=function(){return this.data.charCodeAt(this.read++)};f.ByteBuffer.prototype.getInt16=function(){var m=(this.data.charCodeAt(this.read)<<8^this.data.charCodeAt(this.read+1));this.read+=2;return m};f.ByteBuffer.prototype.getInt24=function(){var m=(this.data.charCodeAt(this.read)<<16^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2));this.read+=3;return m};f.ByteBuffer.prototype.getInt32=function(){var m=(this.data.charCodeAt(this.read)<<24^this.data.charCodeAt(this.read+1)<<16^this.data.charCodeAt(this.read+2)<<8^this.data.charCodeAt(this.read+3));this.read+=4;return m};f.ByteBuffer.prototype.getInt16Le=function(){var m=(this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8);this.read+=2;return m};f.ByteBuffer.prototype.getInt24Le=function(){var m=(this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2)<<16);this.read+=3;return m};f.ByteBuffer.prototype.getInt32Le=function(){var m=(this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2)<<16^this.data.charCodeAt(this.read+3)<<24);this.read+=4;return m};f.ByteBuffer.prototype.getInt=function(o){var m=0;do{m=(m<<o)+this.data.charCodeAt(this.read++);o-=8}while(o>0);return m};f.ByteBuffer.prototype.getBytes=function(m){var n;if(m){m=Math.min(this.length(),m);n=this.data.slice(this.read,this.read+m);this.read+=m}else{if(m===0){n=""}else{n=(this.read===0)?this.data:this.data.slice(this.read);this.clear()}}return n};f.ByteBuffer.prototype.bytes=function(m){return(typeof(m)==="undefined"?this.data.slice(this.read):this.data.slice(this.read,this.read+m))};f.ByteBuffer.prototype.at=function(m){return this.data.charCodeAt(this.read+m)};f.ByteBuffer.prototype.setAt=function(n,m){this.data=this.data.substr(0,this.read+n)+String.fromCharCode(m)+this.data.substr(this.read+n+1)};f.ByteBuffer.prototype.last=function(){return this.data.charCodeAt(this.data.length-1)};f.ByteBuffer.prototype.copy=function(){var m=f.createBuffer(this.data);m.read=this.read;return m};f.ByteBuffer.prototype.compact=function(){if(this.read>0){this.data=this.data.slice(this.read);this.read=0}};f.ByteBuffer.prototype.clear=function(){this.data="";this.read=0};f.ByteBuffer.prototype.truncate=function(n){var m=Math.max(0,this.length()-n);this.data=this.data.substr(this.read,m);this.read=0};f.ByteBuffer.prototype.toHex=function(){var o="";for(var n=this.read;n<this.data.length;++n){var m=this.data.charCodeAt(n);if(m<16){o+="0"}o+=m.toString(16)}return o};f.ByteBuffer.prototype.toString=function(){return f.decodeUtf8(this.bytes())};f.createBuffer=function(m,n){n=n||"raw";if(m!==undefined&&n==="utf8"){m=f.encodeUtf8(m)}return new f.ByteBuffer(m)};f.fillString=function(p,o){var m="";while(o>0){if(o&1){m+=p}o>>>=1;if(o>0){p+=p}}return m};f.xorBytes=function(s,p,v){var o="";var m="";var r="";var q=0;var u=0;for(;v>0;--v,++q){m=s.charCodeAt(q)^p.charCodeAt(q);if(u>=10){o+=r;r="";u=0}r+=String.fromCharCode(m);++u}o+=r;return o};f.hexToBytes=function(n){var o="";var m=0;if(n.length&1==1){m=1;o+=String.fromCharCode(parseInt(n[0],16))}for(;m<n.length;m+=2){o+=String.fromCharCode(parseInt(n.substr(m,2),16))}return o};f.bytesToHex=function(m){return f.createBuffer(m).toHex()};f.int32ToBytes=function(m){return(String.fromCharCode(m>>24&255)+String.fromCharCode(m>>16&255)+String.fromCharCode(m>>8&255)+String.fromCharCode(m&255))};var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var l=[62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,64,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];f.encode64=function(p,t){var m="";var o="";var s,q,n;var r=0;while(r<p.length){s=p.charCodeAt(r++);q=p.charCodeAt(r++);n=p.charCodeAt(r++);m+=a.charAt(s>>2);m+=a.charAt(((s&3)<<4)|(q>>4));if(isNaN(q)){m+="=="}else{m+=a.charAt(((q&15)<<2)|(n>>6));m+=isNaN(n)?"=":a.charAt(n&63)}if(t&&m.length>t){o+=m.substr(0,t)+"\r\n";m=m.substr(t)}}o+=m;return o};f.decode64=function(n){n=n.replace(/[^A-Za-z0-9\+\/\=]/g,"");var m="";var s,r,q,p;var o=0;while(o<n.length){s=l[n.charCodeAt(o++)-43];r=l[n.charCodeAt(o++)-43];q=l[n.charCodeAt(o++)-43];p=l[n.charCodeAt(o++)-43];m+=String.fromCharCode((s<<2)|(r>>4));if(q!==64){m+=String.fromCharCode(((r&15)<<4)|(q>>2));if(p!==64){m+=String.fromCharCode(((q&3)<<6)|p)}}}return m};f.encodeUtf8=function(m){return unescape(encodeURIComponent(m))};f.decodeUtf8=function(m){return decodeURIComponent(escape(m))};f.deflate=function(p,n,o){n=f.decode64(p.deflate(f.encode64(n)).rval);if(o){var q=2;var m=n.charCodeAt(1);if(m&32){q=6}n=n.substring(q,n.length-4)}return n};f.inflate=function(o,m,n){var p=o.inflate(f.encode64(m)).rval;return(p===null)?null:f.decode64(p)};var c=function(m,p,o){if(!m){throw {message:"WebStorage not available."}}var n;if(o===null){n=m.removeItem(p)}else{o=f.encode64(JSON.stringify(o));n=m.setItem(p,o)}if(typeof(n)!=="undefined"&&n.rval!==true){throw n.error}};var e=function(m,o){if(!m){throw {message:"WebStorage not available."}}var n=m.getItem(o);if(m.init){if(n.rval===null){if(n.error){throw n.error}n=null}else{n=n.rval}}if(n!==null){n=JSON.parse(f.decode64(n))}return n};var j=function(n,q,m,o){var p=e(n,q);if(p===null){p={}}p[m]=o;c(n,q,p)};var b=function(n,p,m){var o=e(n,p);if(o!==null){o=(m in o)?o[m]:null}return o};var d=function(n,r,m){var p=e(n,r);if(p!==null&&m in p){delete p[m];var o=true;for(var q in tmp){o=false;break}if(o){p=null}c(n,r,p)}};var h=function(m,n){c(m,n,null)};var g=function(n,r,t){var p=null;if(typeof(t)==="undefined"){t=["web","flash"]}var s;var o=false;var m=null;for(var u in t){s=t[u];try{if(s==="flash"||s==="both"){if(r[0]===null){throw {message:"Flash local storage not available."}}else{p=n.apply(this,r);o=(s==="flash")}}if(s==="web"||s==="both"){r[0]=localStorage;p=n.apply(this,r);o=true}}catch(q){m=q}if(o){break}}if(!o){throw m}return p};f.setItem=function(o,q,n,p,m){g(j,arguments,m)};f.getItem=function(o,p,n,m){return g(b,arguments,m)};f.removeItem=function(o,p,n,m){g(d,arguments,m)};f.clearItems=function(n,o,m){g(h,arguments,m)};f.parseUrl=function(q){var p=/^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g;p.lastIndex=0;var n=p.exec(q);var o=(n===null)?null:{full:q,scheme:n[1],host:n[2],port:n[3],path:n[4]};if(o){o.fullHost=o.host;if(o.port){if(o.port!==80&&o.scheme==="http"){o.fullHost+=":"+o.port}else{if(o.port!==443&&o.scheme==="https"){o.fullHost+=":"+o.port}}}else{if(o.scheme==="http"){o.port=80}else{if(o.scheme==="https"){o.port=443}}}o.full=o.scheme+"://"+o.fullHost}return o};var i=null;f.getQueryVariables=function(m){var o=function(t){var u={};var s=t.split("&");for(var r=0;r<s.length;r++){var w=s[r].indexOf("=");var p;var v;if(w>0){p=s[r].substring(0,w);v=s[r].substring(w+1)}else{p=s[r];v=null}if(!(p in u)){u[p]=[]}if(v!==null){u[p].push(unescape(v))}}return u};var n;if(typeof(m)==="undefined"){if(i===null){if(typeof(window)==="undefined"){i={}}else{i=o(window.location.search.substring(1))}}n=i}else{n=o(m)}return n};f.parseFragment=function(o){var n=o;var m="";var r=o.indexOf("?");if(r>0){n=o.substring(0,r);m=o.substring(r+1)}var q=n.split("/");if(q.length>0&&q[0]==""){q.shift()}var p=(m=="")?{}:f.getQueryVariables(m);return{pathString:n,queryString:m,path:q,query:p}};f.makeRequest=function(n){var o=f.parseFragment(n);var m={path:o.pathString,query:o.queryString,getPath:function(p){return(typeof(p)==="undefined")?o.path:o.path[p]},getQuery:function(p,q){var r;if(typeof(p)==="undefined"){r=o.query}else{r=o.query[p];if(r&&typeof(q)!=="undefined"){r=r[q]}}return r},getQueryLast:function(q,p){var s;var r=m.getQuery(q);if(r){s=r[r.length-1]}else{s=p}return s}};return m};f.makeLink=function(p,o,n){p=jQuery.isArray(p)?p.join("/"):p;var m=jQuery.param(o||{});n=n||"";return p+((m.length>0)?("?"+m):"")+((n.length>0)?("#"+n):"")};f.setPath=function(o,r,s){if(typeof(o)==="object"&&o!==null){var p=0;var n=r.length;while(p<n){var q=r[p++];if(p==n){o[q]=s}else{var m=(q in o);if(!m||(m&&typeof(o[q])!=="object")||(m&&o[q]===null)){o[q]={}}o=o[q]}}}};f.getPath=function(p,s,o){var q=0;var n=s.length;var m=true;while(m&&q<n&&typeof(p)==="object"&&p!==null){var r=s[q++];m=r in p;if(m){p=p[r]}}return(m?p:o)};f.deletePath=function(n,q){if(typeof(n)==="object"&&n!==null){var o=0;var m=q.length;while(o<m){var p=q[o++];if(o==m){delete n[p]}else{if(!(p in n)||(typeof(n[p])!=="object")||(n[p]===null)){break}n=n[p]}}}};f.isEmpty=function(m){for(var n in m){if(m.hasOwnProperty(n)){return false}}return true};f.format=function(t){var p=/%./g;var o;var n;var m=0;var s=[];var r=0;while((o=p.exec(t))){n=t.substring(r,p.lastIndex-2);if(n.length>0){s.push(n)}r=p.lastIndex;var q=o[0][1];switch(q){case"s":case"o":if(m<arguments.length){s.push(arguments[m+++1])}else{s.push("<?>")}break;case"%":s.push("%");break;default:s.push("<%"+q+"?>")}}s.push(t.substring(r));return s.join("")};f.formatNumber=function(q,o,x,p){var m=q,w=isNaN(o=Math.abs(o))?2:o;var v=x===undefined?",":x;var y=p===undefined?".":p,z=m<0?"-":"";var u=parseInt((m=Math.abs(+m||0).toFixed(w)),10)+"";var r=(u.length>3)?u.length%3:0;return z+(r?u.substr(0,r)+y:"")+u.substr(r).replace(/(\d{3})(?=\d)/g,"$1"+y)+(w?v+Math.abs(m-u).toFixed(w).slice(2):"")};f.formatSize=function(m){if(m>=1073741824){m=f.formatNumber(m/1073741824,2,".","")+" GiB"}else{if(m>=1048576){m=f.formatNumber(m/1048576,2,".","")+" MiB"}else{if(m>=1024){m=f.formatNumber(m/1024,0)+" KiB"}else{m=f.formatNumber(m,0)+" bytes"}}}return m}})();

	if (!forge_buffers) {

		/* Buffer transformation - Copyright 2013 Aymeric Vitte MIT License

		forge buffers = string of utf8 characters encoded in binary format

		forge ByteBuffer :
			data : 'utf8' string (0x00 to 0xFF)
			read : index

		hex to forge 'utf8' : byte per byte transform to the corresponding utf8 character using charCodeAt
		forge 'utf8' to hex : character per character transform to the corresponding hex using fromCharCode

		New buffers :

		Since the code itself does manipulate strings we must conserve for now the deprecated binary format :

		ByteBuffer :
			data : Uint8Array (binary representation of the 'utf8' string)
			read : index

		*/

		/* Buffer */
		
		if (node_buffers) {
		
		/*
		Not used - if you absolutely want to use node.js's Buffers and waste some time, then you have to add the functions defined in the next section and hook/hack plenty of stuff in node.js's Buffers methods while it's completely unlikely that it performs better at the end.
		*/

			Buffer.prototype.map=function(buff) {
				var l=buff.length;
				this.copy(buff,0,l);
				this.fill(0,l);
			};
			
			Array.prototype.concatBuffers=function() {
				return Buffer.concat(this);
			};
			
		} else {
			/*
			Override  node.js's Buffer
			Note that in a browser environment you should replace 'Buffer=' by 'var Buffer'
			*/
			Array.prototype.concatBuffers=function() {
				var str=[];
				var n=0;
				this.forEach(function(val) {
					n +=val.length;
				});
				var buff=new Buffer(n);
				var index=0;
				this.forEach(function(val) {
						var l=val.length;
						buff.set(val,index);
						index+=l;
				});
				return buff;
			};
			
			var buffer_size=1024;
			
			Buffer=function(a,e) {
				if ((!e)&&(typeof(a)==='string')) {
					e='utf8';
				};
				if ((a instanceof Array) || ((!isNaN(a))&&(!e))) {
					return new Uint8Array(a);
				};
				if (e==='utf8') {
					return (new TextEncoder('utf-8')).encode(a);
				};
				if (e==='hex') {
					try {
						var b=new Uint8Array(a.length/2);
						var l=a.length;
						for (var i=0;i<l;i+=2) {
							b[i/2]=parseInt(a[i]+a[i+1],16);
						};
					} catch(ee) {
						return new Uint8Array();
					};
				};
				if (e==='binary') {
					var b=new Uint8Array(a.length);
					var l=b.length;
					for (var i=0;i<l;i++) {
						b[i]=a.charCodeAt(i);
					};
				};
				return b;
			};

			Buffer.isBuffer=function(b) {
				return b instanceof Uint8Array;
			};
			
			Uint8Array.prototype.slice=function(start,end) {
				if (end) {
					return this.subarray(start,end);
				} else {
					return this.subarray(start);
				};
			};

			Uint8Array.prototype.map=function(buff) {
				var l=buff.length;
				this.set(buff);
				this.fill(0,l);
			};

			Uint8Array.prototype.readUInt=function(o,n) {
				o=o||0;
				n=n||this.length;
				switch (n) {
					case 1 : return this[o];
					case 2 : return this.readUInt16BE(o);
					case 3 : return this.readUInt24BE(o);
					case 4 : return this.readUInt32BE(o);
					return 0;
				};
			};

			Uint8Array.prototype.readUIntLE=function(o,n) {
				o=o||0;
				n=n||this.length;
				switch (n) {
					case 1 : return this[o];
					case 2 : return this.readUInt16LE(o);
					case 4 : return this.readUInt32LE(o);
					return 0;
				};
			};

			Uint8Array.prototype.writeUInt=function(val,o,n) {
				o=o||0;
				n=n||this.length;
				switch (n) {
					case 1 : this.writeUInt8(val,o);break;
					case 2 : this.writeUInt16BE(val,o);break;
					case 3 : this.writeUInt24BE(val,o);break;
					case 4 : this.writeUInt32BE(val,o);break;
				};
				return this;
			};

			Uint8Array.prototype.writeUIntLE=function(val,o,n) {
				o=o||0;
				n=n||this.length;
				switch (n) {
					case 1 : this.writeUInt8(val,o);break;
					case 2 : this.writeUInt16LE(val,o);break;
					case 4 : this.writeUInt32LE(val,o);break;
				};
				return this;
			};

			Uint8Array.prototype.fill=function(val,offset) {
				var l=this.length;
				for (var i=offset;i<l;i++) {
					this[i]=val;
				};
			};
			
			if (!data_view) {
			
				Uint8Array.prototype.readUInt16BE=function(o) {
					return this[o] << 8 ^ this[o+1];
				};

				Uint8Array.prototype.readUInt24BE=function(o) {
					return this[o] << 16 ^ this[o+1] << 8 ^ this[o+2];
				};

				Uint8Array.prototype.readUInt32BE=function(o) {
					return this[o] << 24 ^ this[o+1] << 16 ^ this[o+2] << 8 ^ this[o+3];
				};

				Uint8Array.prototype.readUInt16LE=function(o) {
					return this[o] ^ this[o+1] << 8;
				};

				Uint8Array.prototype.readUInt32LE=function(o) {
					return this[o] ^ this[o+1] << 8 ^ this[o+2] << 16 ^ this[o+3] << 24;
				};

				Uint8Array.prototype.writeUInt8=function(val,o) {
					this[o]=val;
				};

				Uint8Array.prototype.writeUInt16BE=function(val,o) {
					this[o]=val >> 8 & 0xFF;
					this[o+1]=val & 0xFF;
				};

				Uint8Array.prototype.writeUInt24BE=function(val,o) {
					this[o]=val >> 16 & 0xFF;
					this[o+1]=val >> 8 & 0xFF;
					this[o+2]=val & 0xFF;
				};

				Uint8Array.prototype.writeUInt32BE=function(val,o) {
					this[o]=val >> 24 & 0xFF;
					this[o+1]=val >> 16 & 0xFF;
					this[o+2]=val >> 8 & 0xFF;
					this[o+3]=val & 0xFF;
				};

				Uint8Array.prototype.writeUInt16LE=function(val,o) {
					this[o]=val & 0xFF;
					this[o+1]=val >> 8 & 0xFF;
				};

				Uint8Array.prototype.writeUInt32LE=function(val,o) {
					this[o]=val & 0xFF;
					this[o+1]=val >> 8 & 0xFF;
					this[o+2]=val >> 16 & 0xFF;
					this[o+3]=val >> 24 & 0xFF;
				};
				
			} else {
			
				/*
				Redefine above functions using typed arrays/data views methods.
				This is ridiculously slow with node.js.
				Node.js has decided that you should not instantiate views and iterate on it, therefore a normal utilisation of typed arrays and data views is not possible.
				See performances at the end
				*/
				
				Uint8Array.prototype.readUInt16BE=function(o) {
					var a=new DataView(this.buffer);
					return a.getUint16(this.byteOffset+o);
				};

				Uint8Array.prototype.readUInt24BE=function(o) {
					return this[o] << 16 ^ this[o+1] << 8 ^ this[o+2];
				};

				Uint8Array.prototype.readUInt32BE=function(o) {
					var a=new DataView(this.buffer);
					return a.getUint32(this.byteOffset+o);
				};

				Uint8Array.prototype.readUInt16LE=function(o) {
					var a=new DataView(this.buffer);
					return a.getUint16(this.byteOffset+o,true);
				};

				Uint8Array.prototype.readUInt32LE=function(o) {
					var a=new DataView(this.buffer);
					return a.getUint32(this.byteOffset+o,true);
				};

				Uint8Array.prototype.writeUInt8=function(val,o) {
					this[o]=val;
				};

				Uint8Array.prototype.writeUInt16BE=function(val,o) {
					var a=new DataView(this.buffer);
					a.setUint16(this.byteOffset+o,val);
				};

				Uint8Array.prototype.writeUInt24BE=function(val,o) {
					this[o]=val >> 16 & 0xFF;
					this[o+1]=val >> 8 & 0xFF;
					this[o+2]=val & 0xFF;
				};

				Uint8Array.prototype.writeUInt32BE=function(val,o) {
					var a=new DataView(this.buffer);
					a.setUint32(this.byteOffset+o,val);
				};

				Uint8Array.prototype.writeUInt16LE=function(val,o) {
					var a=new DataView(this.buffer);
					a.setUint16(this.byteOffset+o,val,true);
				};

				Uint8Array.prototype.writeUInt32LE=function(val,o) {
					var a=new DataView(this.buffer);
					a.setUint32(this.byteOffset+o,val,true);
				};
				
			};

			Uint8Array.prototype.toString=function(enc) {
				var l=this.length;
				var r=[];
				if (enc==='utf8') {
					return (new TextDecoder('utf-8')).decode(this);
				};
				if (enc==='hex') {
					for (var i=0;i<l;i++) {
						var tmp=this[i].toString(16);
						r.push(tmp.length===1?('0'+tmp):tmp);
					};
				};
				if (enc==='binary') {
					for (var i=0;i<l;i++) {
						r.push(String.fromCharCode(this[i]));
					};
				};
				return r.join('');
			};

		};
			
		forge.util.ByteBuffer = function() {};

		forge.util.createBuffer = function(input, encoding) {
			var a=new forge.util.ByteBuffer();
			if (input) {
				a.data=new Buffer(input,encoding||'binary');
				a.length_=a.data.length;
			} else {
				a.data=new Buffer(buffer_size);
				a.length_=0;
			};
			a.read=0;
			return a;
		};

		forge.util.ByteBuffer.prototype.length = function() {
			return this.length_-this.read;
		};

		forge.util.ByteBuffer.prototype.isEmpty = function() {
			return (this.length_-this.read)===0;
		};

		forge.util.ByteBuffer.prototype.putByte = function(b) { //b charcode
			if (this.data.length>=this.length_+1) {
				this.data.writeUInt(b,this.length_,1);
			} else {
				this.data=[this.data.slice(0,this.length_),new Uint8Array([b])].concatBuffers();
			};
			this.length_ +=1;
		};

		forge.util.ByteBuffer.prototype.getByte = function() { //return charcode
			return this.data[this.read++];
		};

		forge.util.ByteBuffer.prototype.at=function(i) {
			return this.data[this.read+i];
		};

		forge.util.ByteBuffer.prototype.last = function() {
			return this.data[this.length_-1];
		};

		forge.util.ByteBuffer.prototype.fillWithByte=function(b,n) {//b charcode
			if (this.data.length>=this.length_+n) {
				var o=this.length_;
				for (var i=0;i<n;i++) {
					this.data[o+i]=b;
				};
			} else {
				var arr=[];
				for (var i=0;i<n;i++) {
					arr.push(b);
				};
				this.data=[this.data.slice(0,this.length_),new Uint8Array(arr)].concatBuffers();
			};
			this.length_ +=n;
		};

		forge.util.ByteBuffer.prototype.putBytes = function(bytes) { //bytes string or Buffer (from process)
			var a;
			if (typeof(bytes)==='string') {
				a=new Buffer(bytes,'binary');
			} else {
				a=bytes;
			};
			var l=a.length;
			if (this.data.length>=this.length_+l) {
				this.data.set(a,this.length_);
			} else {
				this.data=[this.data.slice(0,this.length_),a].concatBuffers();
			};
			this.length_+=l;
		};

		forge.util.ByteBuffer.prototype.getBytes = function(count) { //return string
			var rval;
			if(count) {
				count=Math.min(this.length(),count);
				rval=this.data.slice(this.read,this.read+count).toString('binary');
				this.read +=count;
			} else if(count===0) {
				rval = '';
			} else {
				rval=this.data.slice(this.read,this.length_).toString('binary');
				this.clear();
			};
			return rval;
		};

		forge.util.ByteBuffer.prototype.putBuffer = function(buffer) {
			if (this.data.length>=this.length_+buffer.length_) {
				if (buffer.length_) {
					this.data.set(buffer.data.slice(0,buffer.length_),this.length_);
				};
			} else {
				this.data=[this.data.slice(0,this.length_),buffer.data.slice(0,buffer.length_)].concatBuffers();
			};
			this.length_+=buffer.length_;
			buffer.clear();
		};

		forge.util.ByteBuffer.prototype.bytes = function(count) {
			if (!count) {
				return (this.data.slice(this.read,this.length_)).toString('binary');
			} else {
				return this.data.slice(this.read,this.read+count).toString('binary');
			};
		};

		forge.util.ByteBuffer.prototype.putInt16 = function(i) {
			if (this.data.length>=this.length_+2) {
				this.data.writeUInt(i,this.length_,2);
			} else {
				this.data=[this.data.slice(0,this.length_),(new Buffer(2)).writeUInt(i)].concatBuffers();
			};
			this.length_ +=2;
		};

		forge.util.ByteBuffer.prototype.putInt24 = function(i) {
			if (this.data.length>=this.length_+3) {
				this.data.writeUInt(i,this.length_,3);
			} else {
				this.data=[this.data.slice(0,this.length_),(new Buffer(3)).writeUInt(i)].concatBuffers();
			};
			this.length_ +=3;
		};

		forge.util.ByteBuffer.prototype.putInt32 = function(i) {
			if (this.data.length>=this.length_+4) {
				this.data.writeUInt(i,this.length_,4);
			} else {
				this.data=[this.data.slice(0,this.length_),(new Buffer(4)).writeUInt(i)].concatBuffers();
			};
			this.length_ +=4;
		};

		forge.util.ByteBuffer.prototype.putInt32Le = function(i) {
			if (this.data.length>=this.length_+4) {
				this.data.writeUIntLE(i,this.length_,4);
			} else {
				this.data=[this.data.slice(0,this.length_),(new Buffer(4)).writeUIntLE(i)].concatBuffers();
			};
			this.length_ +=4;
		};

		forge.util.ByteBuffer.prototype.putInt = function(i,n) {
			n=n/8;
			if (this.data.length>=this.length_+n) {
				this.data.writeUInt(i,this.length_,n);
			} else {
				this.data=[this.data.slice(0,this.length_),(new Buffer(n)).writeUInt(i)].concatBuffers();
			};
			this.length_ +=n;
		};

		forge.util.ByteBuffer.prototype.getInt16 = function() {
			var a=this.data.readUInt(this.read,2);
			this.read += 2;
			return a;
		};

		forge.util.ByteBuffer.prototype.getInt24 = function() {
			var a=this.data.readUInt(this.read,3);
			this.read += 3;
			return a;
		};

		forge.util.ByteBuffer.prototype.getInt32 = function() {
			var a=this.data.readUInt(this.read,4);
			this.read += 4;
			return a;
		};

		//01000041 -->41000001
		forge.util.ByteBuffer.prototype.getInt32Le = function() {
			var a=this.data.readUIntLE(this.read,4);
			this.read += 4;
			return a;
		};

		forge.util.ByteBuffer.prototype.getInt = function(n) {
			n=n/8;
			var a=this.data.readUInt(this.read,n);
			this.read +=n;
			return a;
		};

		forge.util.ByteBuffer.prototype.compact = function() {
			if(this.read > 0) {
				var a=this.data.slice(this.read,this.length_);
				this.data=new Buffer(buffer_size*3); //compact called every 2048 bytes
				if (this.data.length) {
					this.data.set(a);
				} else {
					this.data=a;
				};
				this.data.set(a);
				this.length_=a.length;
				this.read=0;
			};
		};

		forge.util.ByteBuffer.prototype.clear = function() {
			this.data=new Buffer(buffer_size);
			this.length_=0;
			this.read=0;
		};

		forge.util.ByteBuffer.prototype.truncate = function(count) {
			var len=Math.max(0,this.length()-count);
			var a=this.data.slice(this.read,this.read+len);
			this.data=new Buffer(buffer_size);
			if (this.data.length) {
				this.data.set(a);
			} else {
				this.data=a;
			};
			this.length_=a.length;
			this.read=0;
		};

		forge.util.ByteBuffer.prototype.toHex = function() {
			return this.data.slice(0,this.length_).toString('hex');
		};

		forge.util.ByteBuffer.prototype.toString = function() {
			return (new Buffer(this.data.slice(0,this.length_).toString('binary'),'utf8')).toString('utf8');
		};
		/* end Buffer */
	};

	//sha1.js

	/**
	 * Secure Hash Algorithm with 160-bit digest (SHA-1) implementation.
	 *
	 * This implementation is currently limited to message lengths (in bytes) that
	 * are up to 32-bits in size.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){var f={};if(typeof(window)!=="undefined"){var b=window.forge=window.forge||{}}else{if(typeof(module)!=="undefined"&&module.exports){var b={util:require("./util")};module.exports=f}}b.md=b.md||{};b.md.algorithms=b.md.algorithms||{};b.md.sha1=b.md.algorithms.sha1=f;var d=null;var c=false;var e=function(){d=String.fromCharCode(128);d+=b.util.fillString(String.fromCharCode(0),64);c=true};var a=function(r,p,u){var q,o,n,m,l,k,j,g;var h=u.length();while(h>=64){o=r.h0;n=r.h1;m=r.h2;l=r.h3;k=r.h4;for(g=0;g<16;++g){q=u.getInt32();p[g]=q;j=l^(n&(m^l));q=((o<<5)|(o>>>27))+j+k+1518500249+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}for(;g<20;++g){q=(p[g-3]^p[g-8]^p[g-14]^p[g-16]);q=(q<<1)|(q>>>31);p[g]=q;j=l^(n&(m^l));q=((o<<5)|(o>>>27))+j+k+1518500249+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}for(;g<32;++g){q=(p[g-3]^p[g-8]^p[g-14]^p[g-16]);q=(q<<1)|(q>>>31);p[g]=q;j=n^m^l;q=((o<<5)|(o>>>27))+j+k+1859775393+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}for(;g<40;++g){q=(p[g-6]^p[g-16]^p[g-28]^p[g-32]);q=(q<<2)|(q>>>30);p[g]=q;j=n^m^l;q=((o<<5)|(o>>>27))+j+k+1859775393+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}for(;g<60;++g){q=(p[g-6]^p[g-16]^p[g-28]^p[g-32]);q=(q<<2)|(q>>>30);p[g]=q;j=(n&m)|(l&(n^m));q=((o<<5)|(o>>>27))+j+k+2400959708+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}for(;g<80;++g){q=(p[g-6]^p[g-16]^p[g-28]^p[g-32]);q=(q<<2)|(q>>>30);p[g]=q;j=n^m^l;q=((o<<5)|(o>>>27))+j+k+3395469782+q;k=l;l=m;m=(n<<30)|(n>>>2);n=o;o=q}r.h0+=o;r.h1+=n;r.h2+=m;r.h3+=l;r.h4+=k;h-=64}};f.create=function(){if(!c){e()}var g=null;var j=b.util.createBuffer();var h=new Array(80);var i={algorithm:"sha1",blockLength:64,digestLength:20,messageLength:0};i.start=function(){i.messageLength=0;j=b.util.createBuffer();g={h0:1732584193,h1:4023233417,h2:2562383102,h3:271733878,h4:3285377520}};i.start();i.update=function(l,k){if(k==="utf8"){l=b.util.encodeUtf8(l)}i.messageLength+=l.length;j.putBytes(l);a(g,h,j);if(j.read>2048||j.length()===0){j.compact()}};i.digest=function(){var k=i.messageLength;var n=b.util.createBuffer();n.putBytes(j.bytes());n.putBytes(d.substr(0,64-((k+8)%64)));n.putInt32((k>>>29)&255);n.putInt32((k<<3)&4294967295);var l={h0:g.h0,h1:g.h1,h2:g.h2,h3:g.h3,h4:g.h4};a(l,h,n);var m=b.util.createBuffer();m.putInt32(l.h0);m.putInt32(l.h1);m.putInt32(l.h2);m.putInt32(l.h3);m.putInt32(l.h4);return m};return i}})();


	//hmac.js

	/**
	 * Hash-based Message Authentication Code implementation. Requires a message
	 * digest object that can be obtained, for example, from forge.md.sha1 or
	 * forge.md.md5.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc. All rights reserved.
	 */
	(function(){if(typeof(window)!=="undefined"){var a=window.forge=window.forge||{};a.hmac={}}else{if(typeof(module)!=="undefined"&&module.exports){var a={md:require("./md"),util:require("./util")};module.exports=a.hmac={}}}var b=a.hmac;b.create=function(){var g=null;var e=null;var f=null;var c=null;var d={};d.start=function(m,k){if(m!==null){if(m.constructor==String){m=m.toLowerCase();if(m in a.md.algorithms){e=a.md.algorithms[m].create()}else{throw'Unknown hash algorithm "'+m+'"'}}else{e=m}}if(k===null){k=g}else{if(k.constructor==String){k=a.util.createBuffer(k)}else{if(k.constructor==Array){var j=k;k=a.util.createBuffer();for(var h=0;h<j.length;++h){k.putByte(j[h])}}}var l=k.length();if(l>e.blockLength){e.start();e.update(k.bytes());k=e.digest()}f=a.util.createBuffer();c=a.util.createBuffer();l=k.length();for(var h=0;h<l;++h){var j=k.at(h);f.putByte(54^j);c.putByte(92^j)}if(l<e.blockLength){var j=e.blockLength-l;for(var h=0;h<j;++h){f.putByte(54);c.putByte(92)}}g=k;f=f.bytes();c=c.bytes()}e.start();e.update(f)};d.update=function(h){e.update(h)};d.getMac=function(){var h=e.digest().bytes();e.start();e.update(c);e.update(h);return e.digest()};d.digest=d.getMac;return d}})();


	//aes.js

	/**
	 * Advanced Encryption Standard (AES) Cipher-Block Chaining implementation.
	 *
	 * This implementation is based on the public domain library 'jscrypto' which
	 * was written by:
	 *
	 * Emily Stark (estark@stanford.edu)
	 * Mike Hamburg (mhamburg@stanford.edu)
	 * Dan Boneh (dabo@cs.stanford.edu)
	 *
	 * Parts of this code are based on the OpenSSL implementation of AES:
	 * http://www.openssl.org
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){if(typeof(window)!=="undefined"){var i=window.forge=window.forge||{};i.aes={}}else{if(typeof(module)!=="undefined"&&module.exports){var i={util:require("./util")};module.exports=i.aes={}}}var k=false;var h=4;var f;var b;var d;var l;var g;var e=function(){k=true;d=[0,1,2,4,8,16,32,64,128,27,54];var y=new Array(256);for(var q=0;q<128;++q){y[q]=q<<1;y[q+128]=(q+128)<<1^283}f=new Array(256);b=new Array(256);l=new Array(4);g=new Array(4);for(var q=0;q<4;++q){l[q]=new Array(256);g[q]=new Array(256)}var t=0,p=0,w,u,r,x,m,v,s;for(var q=0;q<256;++q){x=p^(p<<1)^(p<<2)^(p<<3)^(p<<4);x=(x>>8)^(x&255)^99;f[t]=x;b[x]=t;m=y[x];w=y[t];u=y[w];r=y[u];v=(m<<24)^(x<<16)^(x<<8)^(x^m);s=(w^u^r)<<24^(t^r)<<16^(t^u^r)<<8^(t^w^r);for(var o=0;o<4;++o){l[o][t]=v;g[o][x]=s;v=v<<24|v>>>8;s=s<<24|s>>>8}if(t===0){t=p=1}else{t=w^y[y[y[w^r]]];p^=y[y[p]]}}};var a=function(A,p){var y=A.slice(0);var C,o=1;var s=y.length;var q=s+6+1;var t=h*q;for(var v=s;v<t;++v){C=y[v-1];if(v%s===0){C=f[C>>>16&255]<<24^f[C>>>8&255]<<16^f[C&255]<<8^f[C>>>24]^(d[o]<<24);o++}else{if(s>6&&(v%s==4)){C=f[C>>>24]<<24^f[C>>>16&255]<<16^f[C>>>8&255]<<8^f[C&255]}}y[v]=y[v-s]^C}if(p){var u;var E=g[0];var D=g[1];var B=g[2];var z=g[3];var x=y.slice(0);var t=y.length;for(var v=0,m=t-h;v<t;v+=h,m-=h){if(v===0||v===(t-h)){x[v]=y[m];x[v+1]=y[m+3];x[v+2]=y[m+2];x[v+3]=y[m+1]}else{for(var r=0;r<h;++r){u=y[m+r];x[v+(3&-r)]=E[f[u>>>24]]^D[f[u>>>16&255]]^B[f[u>>>8&255]]^z[f[u&255]]}}}y=x}return y};var c=function(v,x,u,p){var r=v.length/4-1;var q,o,n,m,t;if(p){q=g[0];o=g[1];n=g[2];m=g[3];t=b}else{q=l[0];o=l[1];n=l[2];m=l[3];t=f}var E,D,B,A,F,s,y;E=x[0]^v[0];D=x[p?3:1]^v[1];B=x[2]^v[2];A=x[p?1:3]^v[3];var z=3;for(var C=1;C<r;++C){F=q[E>>>24]^o[D>>>16&255]^n[B>>>8&255]^m[A&255]^v[++z];s=q[D>>>24]^o[B>>>16&255]^n[A>>>8&255]^m[E&255]^v[++z];y=q[B>>>24]^o[A>>>16&255]^n[E>>>8&255]^m[D&255]^v[++z];A=q[A>>>24]^o[E>>>16&255]^n[D>>>8&255]^m[B&255]^v[++z];E=F;D=s;B=y}u[0]=(t[E>>>24]<<24)^(t[D>>>16&255]<<16)^(t[B>>>8&255]<<8)^(t[A&255])^v[++z];u[p?3:1]=(t[D>>>24]<<24)^(t[B>>>16&255]<<16)^(t[A>>>8&255]<<8)^(t[E&255])^v[++z];u[2]=(t[B>>>24]<<24)^(t[A>>>16&255]<<16)^(t[E>>>8&255]<<8)^(t[D&255])^v[++z];u[p?1:3]=(t[A>>>24]<<24)^(t[E>>>16&255]<<16)^(t[D>>>8&255]<<8)^(t[B&255])^v[++z]};var j=function(A,q,o,n){var u=null;if(!k){e()}if(A.constructor==String&&(A.length==16||A.length==24||A.length==32)){A=i.util.createBuffer(A)}else{if(A.constructor==Array&&(A.length==16||A.length==24||A.length==32)){var r=A;var A=i.util.createBuffer();for(var s=0;s<r.length;++s){A.putByte(r[s])}}}if(A.constructor!=Array){var r=A;A=[];var v=r.length();if(v==16||v==24||v==32){v=v>>>2;for(var s=0;s<v;++s){A.push(r.getInt32())}}}if(A.constructor==Array&&(A.length==4||A.length==6||A.length==8)){var z=a(A,n);var w=h<<2;var B;var y;var x;var t;var m;var p;u={output:null};u.update=function(D){if(!p){B.putBuffer(D)}var C=n&&!p?w<<1:w;while(B.length()>=C){if(n){for(var E=0;E<h;++E){x[E]=B.getInt32()}}else{for(var E=0;E<h;++E){x[E]=m[E]^B.getInt32()}}c(z,x,t,n);if(n){for(var E=0;E<h;++E){y.putInt32(m[E]^t[E])}m=x.slice(0)}else{for(var E=0;E<h;++E){y.putInt32(t[E])}m=t}}};u.finish=function(G){var F=true;if(!n){if(G){F=G(w,B,n)}else{var E=(B.length()==w)?w:(w-B.length());B.fillWithByte(E,E)}}if(F){p=true;u.update()}if(n){F=(B.length()===0);if(F){if(G){F=G(w,y,n)}else{var C=y.length();var D=y.at(C-1);if(D>(h<<2)){F=false}else{y.truncate(D)}}}}return F};u.start=function(D,C){D=D||m.slice(0);if(D.constructor==String&&D.length==16){D=i.util.createBuffer(D)}else{if(D.constructor==Array&&D.length==16){var F=D;var D=i.util.createBuffer();for(var E=0;E<16;++E){D.putByte(F[E])}}}if(D.constructor!=Array){var F=D;D=new Array(4);D[0]=F.getInt32();D[1]=F.getInt32();D[2]=F.getInt32();D[3]=F.getInt32()}B=i.util.createBuffer();y=C||i.util.createBuffer();m=D.slice(0);x=new Array(h);t=new Array(h);p=false;u.output=y};if(q!==null){u.start(q,o)}}return u};i.aes.startEncrypting=function(o,n,m){return j(o,n,m,false)};i.aes.createEncryptionCipher=function(m){return j(m,null,null,false)};i.aes.startDecrypting=function(o,n,m){return j(o,n,m,true)};i.aes.createDecryptionCipher=function(m){return j(m,null,null,true)};i.aes._expandKey=function(n,m){if(!k){e()}return a(n,m)};i.aes._updateBlock=c})();


	//asn1.js

	/**
	 * Javascript implementation of Abstract Syntax Notation Number One.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 *
	**/
	(function(){if(typeof(window)!=="undefined"){var b=window.forge=window.forge||{};b.asn1={}}else{if(typeof(module)!=="undefined"&&module.exports){var b={util:require("./util"),pki:{oids:require("./oids")}};module.exports=b.asn1={}}}var a=b.asn1;a.Class={UNIVERSAL:0,APPLICATION:64,CONTEXT_SPECIFIC:128,PRIVATE:192};a.Type={NONE:0,BOOLEAN:1,INTEGER:2,BITSTRING:3,OCTETSTRING:4,NULL:5,OID:6,ODESC:7,EXTERNAL:8,REAL:9,ENUMERATED:10,EMBEDDED:11,UTF8:12,ROID:13,SEQUENCE:16,SET:17,PRINTABLESTRING:19,IA5STRING:22,UTCTIME:23,GENERALIZEDTIME:24,BMPSTRING:30};a.create=function(h,e,g,f){return{tagClass:h,type:e,constructed:g,composed:g||(f.constructor==Array),value:f}};var c=function(e){var f=e.getByte();if(f==128){return undefined}var h;var g=f&128;if(!g){h=f}else{h=e.getInt((f&127)<<3)}return h};a.fromDer=function(t){if(t.constructor==String){t=b.util.createBuffer(t)}if(t.length()<2){throw {message:"Too few bytes to parse DER.",bytes:t.length()}}var r=t.getByte();var m=(r&192);var q=r&31;var g=c(t);if(t.length()<g){throw {message:"Too few bytes to read ASN.1 value.",detail:t.length()+" < "+g}}var s;var k=((r&32)==32);var p=k;if(!p&&m===a.Class.UNIVERSAL&&q===a.Type.BITSTRING&&g>1){var f=t.read;var h=t.getByte();if(h===0){r=t.getByte();var j=(r&192);if(j===a.Class.UNIVERSAL||j===a.Class.CONTEXT_SPECIFIC){try{var n=c(t);p=(n===g-(t.read-f));if(p){++f;--g}}catch(o){}}}t.read=f}if(p){s=[];if(g===undefined){for(;;){if(t.bytes(2)===String.fromCharCode(0,0)){t.getBytes(2);break}s.push(a.fromDer(t))}}else{var e=t.length();while(g>0){s.push(a.fromDer(t));g-=e-t.length();e=t.length()}}}else{if(g===undefined){throw {message:"Non-constructed ASN.1 object of indefinite length."}}if(q===a.Type.BMPSTRING){s="";for(var l=0;l<g;l+=2){s+=String.fromCharCode(t.getInt16())}}else{s=t.getBytes(g)}}return a.create(m,q,k,s)};a.toDer=function(l){var g=b.util.createBuffer();var h=l.tagClass|l.type;var k=b.util.createBuffer();if(l.composed){if(l.constructed){h|=32}else{k.putByte(0)}for(var j=0;j<l.value.length;++j){if(l.value[j]!==undefined){k.putBuffer(a.toDer(l.value[j]))}}}else{k.putBytes(l.value)}g.putByte(h);if(k.length()<=127){g.putByte(k.length()&127)}else{var f=k.length();var e="";do{e+=String.fromCharCode(f&255);f=f>>>8}while(f>0);g.putByte(e.length|128);for(var j=e.length-1;j>=0;--j){g.putByte(e.charCodeAt(j))}}g.putBuffer(k);return g};a.oidToDer=function(g){var m=g.split(".");var o=b.util.createBuffer();o.putByte(40*parseInt(m[0],10)+parseInt(m[1],10));var l,e,k,j;for(var h=2;h<m.length;++h){l=true;e=[];k=parseInt(m[h],10);do{j=k&127;k=k>>>7;if(!l){j|=128}e.push(j);l=false}while(k>0);for(var f=e.length-1;f>=0;--f){o.putByte(e[f])}}return o};a.derToOid=function(f){var g;if(f.constructor==String){f=b.util.createBuffer(f)}var e=f.getByte();g=Math.floor(e/40)+"."+(e%40);var h=0;while(f.length()>0){e=f.getByte();h=h<<7;if(e&128){h+=e&127}else{g+="."+(h+e);h=0}}return g};a.utcTimeToDate=function(o){var g=new Date();var n=parseInt(o.substr(0,2),10);n=(n>=50)?1900+n:2000+n;var p=parseInt(o.substr(2,2),10)-1;var l=parseInt(o.substr(4,2),10);var h=parseInt(o.substr(6,2),10);var j=parseInt(o.substr(8,2),10);var q=0;if(o.length>11){var m=o.charAt(10);var i=10;if(m!=="+"&&m!=="-"){q=parseInt(o.substr(10,2),10);i+=2}}g.setUTCFullYear(n,p,l);g.setUTCHours(h,j,q,0);if(i){m=o.charAt(i);if(m==="+"||m==="-"){var e=parseInt(o.substr(i+1,2),10);var f=parseInt(o.substr(i+4,2),10);var k=e*60+f;k*=60000;if(m==="+"){g.setTime(+g-k)}else{g.setTime(+g+k)}}}return g};a.generalizedTimeToDate=function(p){var i=new Date();var j=parseInt(p.substr(0,4),10);var r=parseInt(p.substr(4,2),10)-1;var o=parseInt(p.substr(6,2),10);var k=parseInt(p.substr(8,2),10);var m=parseInt(p.substr(10,2),10);var s=parseInt(p.substr(12,2),10);var h=0;var n=0;var g=false;if(p.charAt(p.length-1)=="Z"){g=true}var l=p.length-5,q=p.charAt(l);if(q==="+"||q==="-"){var e=parseInt(p.substr(l+1,2),10);var f=parseInt(p.substr(l+4,2),10);n=e*60+f;n*=60000;if(q==="+"){n*=-1}g=true}if(p.charAt(14)=="."){h=parseFloat(p.substr(14),10)*1000}if(g){i.setUTCFullYear(j,r,o);i.setUTCHours(k,m,s,h);i.setTime(+i+n)}else{i.setFullYear(j,r,o);i.setHours(k,m,s,h)}return i};a.dateToUtcTime=function(e){var h="";var g=[];g.push((""+e.getUTCFullYear()).substr(2));g.push(""+(e.getUTCMonth()+1));g.push(""+e.getUTCDate());g.push(""+e.getUTCHours());g.push(""+e.getUTCMinutes());g.push(""+e.getUTCSeconds());for(var f=0;f<g.length;++f){if(g[f].length<2){h+="0"}h+=g[f]}h+="Z";return h};a.validate=function(l,f,e,m){var k=false;if((l.tagClass===f.tagClass||typeof(f.tagClass)==="undefined")&&(l.type===f.type||typeof(f.type)==="undefined")){if(l.constructed===f.constructed||typeof(f.constructed)==="undefined"){k=true;if(f.value&&f.value.constructor==Array){var g=0;for(var h=0;k&&h<f.value.length;++h){k=f.value[h].optional||false;if(l.value[g]){k=a.validate(l.value[g],f.value[h],e,m);if(k){++g}else{if(f.value[h].optional){k=true}}}if(!k&&m){m.push("["+f.name+'] Tag class "'+f.tagClass+'", type "'+f.type+'" expected value length "'+f.value.length+'", got "'+l.value.length+'"')}}}if(k&&e){if(f.capture){e[f.capture]=l.value}if(f.captureAsn1){e[f.captureAsn1]=l}}}else{if(m){m.push("["+f.name+'] Expected constructed "'+f.constructed+'", got "'+l.constructed+'"')}}}else{if(m){if(l.tagClass!==f.tagClass){m.push("["+f.name+'] Expected tag class "'+f.tagClass+'", got "'+l.tagClass+'"')}if(l.type!==f.type){m.push("["+f.name+'] Expected type "'+f.type+'", got "'+l.type+'"')}}}return k};var d=/[^\\u0000-\\u00ff]/;a.prettyPrint=function(k,l,f){var j="";l=l||0;f=f||2;if(l>0){j+="\n"}var e="";for(var g=0;g<l*f;++g){e+=" "}j+=e+"Tag: ";switch(k.tagClass){case a.Class.UNIVERSAL:j+="Universal:";break;case a.Class.APPLICATION:j+="Application:";break;case a.Class.CONTEXT_SPECIFIC:j+="Context-Specific:";break;case a.Class.PRIVATE:j+="Private:";break}if(k.tagClass===a.Class.UNIVERSAL){j+=k.type;switch(k.type){case a.Type.NONE:j+=" (None)";break;case a.Type.BOOLEAN:j+=" (Boolean)";break;case a.Type.BITSTRING:j+=" (Bit string)";break;case a.Type.INTEGER:j+=" (Integer)";break;case a.Type.OCTETSTRING:j+=" (Octet string)";break;case a.Type.NULL:j+=" (Null)";break;case a.Type.OID:j+=" (Object Identifier)";break;case a.Type.ODESC:j+=" (Object Descriptor)";break;case a.Type.EXTERNAL:j+=" (External or Instance of)";break;case a.Type.REAL:j+=" (Real)";break;case a.Type.ENUMERATED:j+=" (Enumerated)";break;case a.Type.EMBEDDED:j+=" (Embedded PDV)";break;case a.Type.UTF8:j+=" (UTF8)";break;case a.Type.ROID:j+=" (Relative Object Identifier)";break;case a.Type.SEQUENCE:j+=" (Sequence)";break;case a.Type.SET:j+=" (Set)";break;case a.Type.PRINTABLESTRING:j+=" (Printable String)";break;case a.Type.IA5String:j+=" (IA5String (ASCII))";break;case a.Type.UTCTIME:j+=" (UTC time)";break;case a.Type.GENERALIZEDTIME:j+=" (Generalized time)";break;case a.Type.BMPSTRING:j+=" (BMP String)";break}}else{j+=k.type}j+="\n";j+=e+"Constructed: "+k.constructed+"\n";if(k.composed){j+=e+"Sub values: "+k.value.length;for(var g=0;g<k.value.length;++g){j+=a.prettyPrint(k.value[g],l+1,f);if((g+1)<k.value.length){j+=","}}}else{j+=e+"Value: ";if(k.type===a.Type.OID){var h=a.derToOid(k.value);j+=h;if(b.pki&&b.pki.oids){if(h in b.pki.oids){j+=" ("+b.pki.oids[h]+")"}}}else{if(d.test(k.value)){j+="0x"+b.util.createBuffer(k.value,"utf8").toHex()}else{if(k.value.length===0){j+="[null]"}else{j+=k.value}}}}return j}})();

	//jsbn.js

	// Copyright (c) 2005  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.

	// Basic JavaScript BN library - subset useful for RSA encryption.

	/*
	Licensing (LICENSE)
	-------------------

	This software is covered under the following copyright:
	*/
	/*
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */
	/*
	Address all questions regarding this license to:

	  Tom Wu
	  tjw@cs.Stanford.EDU
	*/
	var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f)}else{if(d==null&&"string"!=typeof e){this.fromString(e,256)}else{this.fromString(e,d)}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455}return o}if(typeof(navigator)==="undefined"){BigInteger.prototype.am=am3;dbits=28}else{if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a]}b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a}else{if(a<-1){this[0]=a+DV}else{this.t=0}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==256){e=8}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true}continue}d=false;if(f==0){this[this.t++]=a}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f))}else{this[this.t-1]|=a<<f}}f+=e;if(f>=this.DB){f-=this.DB}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this)}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l)}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e)}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f}}if(l>0){a=true}if(a){h+=int2char(l)}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16}if((b=a>>8)!=0){a=b;c+=8}if((b=a>>4)!=0){a=b;c+=4}if((b=a>>2)!=0){a=b;c+=2}if((b=a>>1)!=0){a=b;c+=1}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a]}for(a=c-1;a>=0;--a){b[a]=0}b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a]}b.t=Math.max(this.t-c,0);b.s=this.s}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b}for(d=f-1;d>=0;--d){e[d]=0}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp()}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b}if(b>0){d[this.t-e-1]|=(this.s&f)<<a}d.t=this.t-e;d.clamp()}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB}g-=d.s}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g}else{if(g>0){f[e++]=g}}f.t=e;f.clamp()}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t)}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e)}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1)}d.s=0;d.clamp()}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0)}if(g!=null){this.copyTo(g)}return}if(g==null){g=nbi()}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g)}else{w.copyTo(d);k.copyTo(g)}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g)}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g)}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h)}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g)}if(a<0){BigInteger.ZERO.subTo(g,g)}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c)}return c}function Classic(a){this.m=a}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}function cSqrTo(a,b){a.squareTo(b);this.reduce(b)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b)}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b)}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f)}else{var b=f;f=a;a=b}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a)}else{c=new Montgomery(a)}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h)}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0)}if(e){BigInteger.ZERO.subTo(this,this)}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1)}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this)}if(this.isEven()){this.dAddOffset(1,0)}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this)}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1)}else{d[0]=0}this.fromString(d,256)}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e))}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8)}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b}}if((f&128)!=0){f|=-256}if(a==0&&(this.s&128)!=(f&128)){++a}if(a>0||f!=this.s){c[a++]=f}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d])}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g)}e.t=this.t}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d])}e.t=c.t}e.s=h(this.s,c.s);e.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a]}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a)}else{this.lShiftTo(b,a)}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a)}else{this.rShiftTo(b,a)}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16}if((a&255)==0){a>>=8;b+=8}if((a&15)==0){a>>=4;b+=4}if((a&3)==0){a>>=2;b+=2}if((a&1)==0){++b}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a)}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB}g+=d.s}f.s=(g<0)?-1:0;if(g>0){f[e++]=g}else{if(g<-1){f[e++]=this.DV+g}}f.t=e;f.clamp()}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0}++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t)}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d)}e.clamp()}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e)}d.clamp();d.drShiftTo(1,d)}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp()}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1)}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b)}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1}else{if(o<48){h=3}else{if(o<144){h=4}else{if(o<768){h=5}else{h=6}}}}}if(o<8){v=new Classic(f)}else{if(f.isEven()){v=new Barrett(f)}else{v=new Montgomery(f)}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s)}}d=h;while((x&1)==0){x>>=1;--d}if((o-=d)<0){o+=this.DB;--l}if(u){p[x].copyTo(b);u=false}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2}if(d>0){v.sqrTo(b,c)}else{y=b;b=c;c=y}v.mulTo(c,p[x],b)}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h)}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b)}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h)}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b)}else{h.subTo(b,h);h.rShiftTo(1,h)}}if(f>0){h.lShiftTo(f,h)}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e)}g.rShiftTo(1,g)}else{if(!e.isEven()){e.subTo(f,e)}}e.rShiftTo(1,e)}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k)}l.rShiftTo(1,l)}else{if(!k.isEven()){k.subTo(f,k)}}k.rShiftTo(1,k)}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g)}e.subTo(k,e)}else{h.subTo(i,h);if(j){l.subTo(g,l)}k.subTo(e,k)}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k)}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++]}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[e]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;if(typeof(module)!=="undefined"&&module.exports){module.exports=BigInteger};

	//prng.js

	/**
	 * A javascript implementation of a cryptographically-secure
	 * Pseudo Random Number Generator (PRNG). The Fortuna algorithm is mostly
	 * followed here. SHA-1 is used instead of SHA-256.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){if(typeof(window)!=="undefined"){var a=window.forge=window.forge||{};a.prng={}}else{if(typeof(module)!=="undefined"&&module.exports){var a={md:require("./md"),util:require("./util")};a.md.sha1.create();module.exports=a.prng={}}}var b=a.prng;b.create=function(g){var c={plugin:g,key:null,seed:null,time:null,reseeds:0,generated:0};var h=g.md;var f=new Array(32);for(var e=0;e<32;++e){f[e]=h.create()}c.pools=f;c.pool=0;c.generate=function(o){if(c.key===null){d()}var k=c.plugin.cipher;var j=c.plugin.increment;var p=c.plugin.formatKey;var n=c.plugin.formatSeed;var i=a.util.createBuffer();while(i.length()<o){var l=k(c.key,c.seed);c.generated+=l.length;i.putBytes(l);c.key=p(k(c.key,j(c.seed)));c.seed=n(k(c.key,c.seed));if(c.generated>=1048576){var m=+new Date();if(m-c.time<100){d()}}}return i.getBytes(o)};function d(){if(c.pools[0].messageLength<32){var t=(32-c.pools[0].messageLength)<<5;var s="";var j,q,n;var o=Math.floor(Math.random()*65535);while(s.length<t){q=16807*(o&65535);j=16807*(o>>16);q+=(j&32767)<<16;q+=j>>15;q=(q&2147483647)+(q>>31);o=q&4294967295;for(var m=0;m<3;++m){n=o>>>(m<<3);n^=Math.floor(Math.random()*255);s+=String.fromCharCode(n&255)}}c.collect(s)}else{var r=a.md.sha1.create();r.update(c.pools[0].digest().getBytes());c.pools[0].start();var l=1;for(var m=1;m<32;++m){l=(l==31)?2147483648:(l<<2);if(l%c.reseeds===0){r.update(c.pools[m].digest().getBytes());c.pools[m].start()}}var p=r.digest().getBytes();r.start();r.update(p);var u=r.digest().getBytes();c.key=c.plugin.formatKey(p);c.seed=c.plugin.formatSeed(u);++c.reseeds;c.generated=0;c.time=+new Date()}}c.collect=function(j){var m=j.length;for(var l=0;l<m;++l){c.pools[c.pool].update(j.substr(l,1));c.pool=(c.pool===31)?0:c.pool+1}if(c.pools[0].messageLength>=32){var k=+new Date();if(c.time===null||(k-c.time<100)){d()}}};c.collectInt=function(k,l){var j="";do{l-=8;j+=String.fromCharCode((k>>l)&255)}while(l>0);c.collect(j)};return c}})();

	//random.js

	/**
	 * An API for getting cryptographically-secure random bytes. The bytes are
	 * generated using the Fortuna algorithm devised by Bruce Schneier and
	 * Niels Ferguson.
	 *
	 * Getting strong random bytes is not yet easy to do in javascript. The only
	 * truish random entropy that can be collected is from the mouse, keyboard, or
	 * from timing with respect to page loads, etc. This generator makes a poor
	 * attempt at providing random bytes when those sources haven't yet provided
	 * enough entropy to initially seed or to reseed the PRNG.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2009-2012 Digital Bazaar, Inc.
	 */
	(function(d){if(typeof(window)!=="undefined"){var i=window.forge=window.forge||{};i.random={}}else{if(typeof(module)!=="undefined"&&module.exports){var i={aes:require("./aes"),md:require("./md"),prng:require("./prng"),util:require("./util")};module.exports=i.random={}}}var h={};var f=new Array(4);var c=i.util.createBuffer();h.formatKey=function(k){var e=i.util.createBuffer(k);k=new Array(4);k[0]=e.getInt32();k[1]=e.getInt32();k[2]=e.getInt32();k[3]=e.getInt32();return i.aes._expandKey(k,false)};h.formatSeed=function(e){tmp=i.util.createBuffer(e);e=new Array(4);e[0]=tmp.getInt32();e[1]=tmp.getInt32();e[2]=tmp.getInt32();e[3]=tmp.getInt32();return e};h.cipher=function(k,e){i.aes._updateBlock(k,e,f,false);c.putInt32(f[0]);c.putInt32(f[1]);c.putInt32(f[2]);c.putInt32(f[3]);return c.getBytes()};h.increment=function(e){++e[3];return e};h.md=i.md.sha1;var b=i.prng.create(h);b.collectInt(+new Date(),32);if(typeof(navigator)!=="undefined"){var a="";for(var j in navigator){try{if(typeof(navigator[j])=="string"){a+=navigator[j]}}catch(g){}}b.collect(a);a=null}if(d){d().mousemove(function(k){b.collectInt(k.clientX,16);b.collectInt(k.clientY,16)});d().keypress(function(k){b.collectInt(k.charCode,8)})}i.random.getBytes=function(e){return b.generate(e)}})(typeof(jQuery)!=="undefined"?jQuery:null);

	//oid.js

	/**
	 * Object IDs for ASN.1.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){var a={};if(typeof(window)!=="undefined"){var b=window.forge=window.forge||{}}else{if(typeof(module)!=="undefined"&&module.exports){var b={};module.exports=a}}b.pki=b.pki||{};b.pki.oids=a;a["1.2.840.113549.1.1.1"]="rsaEncryption";a.rsaEncryption="1.2.840.113549.1.1.1";a["1.2.840.113549.1.1.4"]="md5withRSAEncryption";a.md5withRSAEncryption="1.2.840.113549.1.1.4";a["1.2.840.113549.1.1.5"]="sha1withRSAEncryption";a.sha1withRSAEncryption="1.2.840.113549.1.1.5";a["1.2.840.113549.1.1.7"]="RSAES-OAEP";a["RSAES-OAEP"]="1.2.840.113549.1.1.7";a["1.2.840.113549.1.1.8"]="mgf1";a.mgf1="1.2.840.113549.1.1.8";a["1.2.840.113549.1.1.9"]="pSpecified";a.pSpecified="1.2.840.113549.1.1.9";a["1.2.840.113549.1.1.10"]="RSASSA-PSS";a["RSASSA-PSS"]="1.2.840.113549.1.1.10";a["1.2.840.113549.1.1.11"]="sha256WithRSAEncryption";a.sha256WithRSAEncryption="1.2.840.113549.1.1.11";a["1.2.840.113549.1.1.12"]="sha384WithRSAEncryption";a.sha384WithRSAEncryption="1.2.840.113549.1.1.12";a["1.2.840.113549.1.1.13"]="sha512WithRSAEncryption";a.sha512WithRSAEncryption="1.2.840.113549.1.1.13";a["1.3.14.3.2.26"]="sha1";a.sha1="1.3.14.3.2.26";a["2.16.840.1.101.3.4.2.1"]="sha256";a.sha256="2.16.840.1.101.3.4.2.1";a["2.16.840.1.101.3.4.2.2"]="sha384";a.sha384="2.16.840.1.101.3.4.2.2";a["2.16.840.1.101.3.4.2.3"]="sha512";a.sha512="2.16.840.1.101.3.4.2.3";a["1.2.840.113549.2.5"]="md5";a.md5="1.2.840.113549.2.5";a["1.2.840.113549.1.7.1"]="data";a.data="1.2.840.113549.1.7.1";a["1.2.840.113549.1.7.2"]="signedData";a.signedData="1.2.840.113549.1.7.2";a["1.2.840.113549.1.7.3"]="envelopedData";a.envelopedData="1.2.840.113549.1.7.3";a["1.2.840.113549.1.7.4"]="signedAndEnvelopedData";a.signedAndEnvelopedData="1.2.840.113549.1.7.4";a["1.2.840.113549.1.7.5"]="digestedData";a.digestedData="1.2.840.113549.1.7.5";a["1.2.840.113549.1.7.6"]="encryptedData";a.encryptedData="1.2.840.113549.1.7.6";a["1.2.840.113549.1.9.20"]="friendlyName";a.friendlyName="1.2.840.113549.1.9.20";a["1.2.840.113549.1.9.21"]="localKeyId";a.localKeyId="1.2.840.113549.1.9.21";a["1.2.840.113549.1.9.22.1"]="x509Certificate";a.x509Certificate="1.2.840.113549.1.9.22.1";a["1.2.840.113549.1.12.10.1.1"]="keyBag";a.keyBag="1.2.840.113549.1.12.10.1.1";a["1.2.840.113549.1.12.10.1.2"]="pkcs8ShroudedKeyBag";a.pkcs8ShroudedKeyBag="1.2.840.113549.1.12.10.1.2";a["1.2.840.113549.1.12.10.1.3"]="certBag";a.certBag="1.2.840.113549.1.12.10.1.3";a["1.2.840.113549.1.12.10.1.4"]="crlBag";a.crlBag="1.2.840.113549.1.12.10.1.4";a["1.2.840.113549.1.12.10.1.5"]="secretBag";a.secretBag="1.2.840.113549.1.12.10.1.5";a["1.2.840.113549.1.12.10.1.6"]="safeContentsBag";a.safeContentsBag="1.2.840.113549.1.12.10.1.6";a["1.2.840.113549.1.5.13"]="pkcs5PBES2";a.pkcs5PBES2="1.2.840.113549.1.5.13";a["1.2.840.113549.1.5.12"]="pkcs5PBKDF2";a.pkcs5PBKDF2="1.2.840.113549.1.5.12";a["1.2.840.113549.1.12.1.1"]="pbeWithSHAAnd128BitRC4";a.pbeWithSHAAnd128BitRC4="1.2.840.113549.1.12.1.1";a["1.2.840.113549.1.12.1.2"]="pbeWithSHAAnd40BitRC4";a.pbeWithSHAAnd40BitRC4="1.2.840.113549.1.12.1.2";a["1.2.840.113549.1.12.1.3"]="pbeWithSHAAnd3-KeyTripleDES-CBC";a["pbeWithSHAAnd3-KeyTripleDES-CBC"]="1.2.840.113549.1.12.1.3";a["1.2.840.113549.1.12.1.4"]="pbeWithSHAAnd2-KeyTripleDES-CBC";a["pbeWithSHAAnd2-KeyTripleDES-CBC"]="1.2.840.113549.1.12.1.4";a["1.2.840.113549.1.12.1.5"]="pbeWithSHAAnd128BitRC2-CBC";a["pbeWithSHAAnd128BitRC2-CBC"]="1.2.840.113549.1.12.1.5";a["1.2.840.113549.1.12.1.6"]="pbewithSHAAnd40BitRC2-CBC";a["pbewithSHAAnd40BitRC2-CBC"]="1.2.840.113549.1.12.1.6";a["1.2.840.113549.3.7"]="des-EDE3-CBC";a["des-EDE3-CBC"]="1.2.840.113549.3.7";a["2.16.840.1.101.3.4.1.2"]="aes128-CBC";a["aes128-CBC"]="2.16.840.1.101.3.4.1.2";a["2.16.840.1.101.3.4.1.22"]="aes192-CBC";a["aes192-CBC"]="2.16.840.1.101.3.4.1.22";a["2.16.840.1.101.3.4.1.42"]="aes256-CBC";a["aes256-CBC"]="2.16.840.1.101.3.4.1.42";a["2.5.4.3"]="commonName";a.commonName="2.5.4.3";a["2.5.4.5"]="serialName";a.serialName="2.5.4.5";a["2.5.4.6"]="countryName";a.countryName="2.5.4.6";a["2.5.4.7"]="localityName";a.localityName="2.5.4.7";a["2.5.4.8"]="stateOrProvinceName";a.stateOrProvinceName="2.5.4.8";a["2.5.4.10"]="organizationName";a.organizationName="2.5.4.10";a["2.5.4.11"]="organizationalUnitName";a.organizationalUnitName="2.5.4.11";a["1.2.840.113549.1.9.1"]="emailAddress";a.emailAddress="1.2.840.113549.1.9.1";a["2.5.29.1"]="authorityKeyIdentifier";a["2.5.29.2"]="keyAttributes";a["2.5.29.3"]="certificatePolicies";a["2.5.29.4"]="keyUsageRestriction";a["2.5.29.5"]="policyMapping";a["2.5.29.6"]="subtreesConstraint";a["2.5.29.7"]="subjectAltName";a["2.5.29.8"]="issuerAltName";a["2.5.29.9"]="subjectDirectoryAttributes";a["2.5.29.10"]="basicConstraints";a["2.5.29.11"]="nameConstraints";a["2.5.29.12"]="policyConstraints";a["2.5.29.13"]="basicConstraints";a["2.5.29.14"]="subjectKeyIdentifier";a.subjectKeyIdentifier="2.5.29.14";a["2.5.29.15"]="keyUsage";a.keyUsage="2.5.29.15";a["2.5.29.16"]="privateKeyUsagePeriod";a["2.5.29.17"]="subjectAltName";a.subjectAltName="2.5.29.17";a["2.5.29.18"]="issuerAltName";a.issuerAltName="2.5.29.18";a["2.5.29.19"]="basicConstraints";a.basicConstraints="2.5.29.19";a["2.5.29.20"]="cRLNumber";a["2.5.29.21"]="cRLReason";a["2.5.29.22"]="expirationDate";a["2.5.29.23"]="instructionCode";a["2.5.29.24"]="invalidityDate";a["2.5.29.25"]="cRLDistributionPoints";a["2.5.29.26"]="issuingDistributionPoint";a["2.5.29.27"]="deltaCRLIndicator";a["2.5.29.28"]="issuingDistributionPoint";a["2.5.29.29"]="certificateIssuer";a["2.5.29.30"]="nameConstraints";a["2.5.29.31"]="cRLDistributionPoints";a["2.5.29.32"]="certificatePolicies";a["2.5.29.33"]="policyMappings";a["2.5.29.34"]="policyConstraints";a["2.5.29.35"]="authorityKeyIdentifier";a["2.5.29.36"]="policyConstraints";a["2.5.29.37"]="extKeyUsage";a.extKeyUsage="2.5.29.37";a["2.5.29.46"]="freshestCRL";a["2.5.29.54"]="inhibitAnyPolicy"})();

	//rsa.js

	/**
	 * Javascript implementation of a basic RSA algorithms.
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 */
	(function(){if(typeof(window)!=="undefined"){var e=window.forge=window.forge||{}}else{if(typeof(module)!=="undefined"&&module.exports){var e={asn1:require("./asn1"),pki:{oids:require("./oids")},random:require("./random"),util:require("./util")};BigInteger=require("./jsbn");module.exports=e.pki.rsa={}}}var d=e.asn1;e.pki=e.pki||{};e.pki.rsa=e.pki.rsa||{};var b=e.pki;var c=function(h){var g;if(h.algorithm in e.pki.oids){g=e.pki.oids[h.algorithm]}else{throw {message:"Unknown message digest algorithm.",algorithm:h.algorithm}}var k=d.oidToDer(g).getBytes();var j=d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,true,[]);var f=d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,true,[]);f.value.push(d.create(d.Class.UNIVERSAL,d.Type.OID,false,k));f.value.push(d.create(d.Class.UNIVERSAL,d.Type.NULL,false,""));var i=d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,false,h.digest().getBytes());j.value.push(f);j.value.push(i);return d.toDer(j).getBytes()};var a=function(f,g,j){var k;if(j){k=f.modPow(g.e,g.n)}else{if(!g.dP){g.dP=g.d.mod(g.p.subtract(BigInteger.ONE))}if(!g.dQ){g.dQ=g.d.mod(g.q.subtract(BigInteger.ONE))}if(!g.qInv){g.qInv=g.q.modInverse(g.p)}var i=f.mod(g.p).modPow(g.dP,g.p);var h=f.mod(g.q).modPow(g.dQ,g.q);while(i.compareTo(h)<0){i=i.add(g.p)}k=i.subtract(h).multiply(g.qInv).mod(g.p).multiply(g.q).add(h)}return k};b.rsa.encrypt=function(h,u,v){var n=v;var q=e.util.createBuffer();var l=Math.ceil(u.n.bitLength()/8);if(v!==false&&v!==true){if(h.length>(l-11)){throw {message:"Message is too long to encrypt.",length:h.length,max:(l-11)}}q.putByte(0);q.putByte(v);var j=l-3-h.length;var f;if(v===0||v===1){n=false;f=(v===0)?0:255;for(var o=0;o<j;++o){q.putByte(f)}}else{n=true;for(var o=0;o<j;++o){f=Math.floor(Math.random()*255)+1;q.putByte(f)}}q.putByte(0)}q.putBytes(h);var t=new BigInteger(q.toHex(),16);var s=a(t,u,n);var r=s.toString(16);var p=e.util.createBuffer();var g=l-Math.ceil(r.length/2);while(g>0){p.putByte(0);--g}p.putBytes(e.util.hexToBytes(r));return p.getBytes()};b.rsa.decrypt=function(q,w,n,l){var g=e.util.createBuffer();var j=Math.ceil(w.n.bitLength()/8);if(q.length!=j){throw {message:"Encrypted message length is invalid.",length:q.length,expected:j}}var t=new BigInteger(e.util.createBuffer(q).toHex(),16);var u=a(t,w,n);var z=u.toString(16);var r=e.util.createBuffer();var f=j-Math.ceil(z.length/2);while(f>0){r.putByte(0);--f}r.putBytes(e.util.hexToBytes(z));if(l!==false){var p=r.getByte();var v=r.getByte();if(p!==0||(n&&v!==0&&v!==1)||(!n&&v!=2)||(n&&v===0&&typeof(l)==="undefined")){throw {message:"Encryption block is invalid."}}var h=0;if(v===0){h=j-3-l;for(var o=0;o<h;++o){if(r.getByte()!==0){throw {message:"Encryption block is invalid."}}}}else{if(v===1){h=0;while(r.length()>1){if(r.getByte()!==255){--r.read;break}++h}}else{if(v===2){h=0;while(r.length()>1){if(r.getByte()===0){--r.read;break}++h}}}}var s=r.getByte();if(s!==0||h!==(j-3-r.length())){throw {message:"Encryption block is invalid."}}}return r.getBytes()};b.rsa.createKeyPairGenerationState=function(g,i){if(typeof(g)==="string"){g=parseInt(g,10)}g=g||1024;var f={nextBytes:function(k){var n=+new Date();var j=e.random.getBytes(k.length);for(var l=0;l<k.length;++l){k[l]=j.charCodeAt(l)}var m=+new Date()}};var h={state:0,itrs:0,maxItrs:100,bits:g,rng:f,e:new BigInteger((i||65537).toString(16),16),p:null,q:null,qBits:g>>1,pBits:g-(g>>1),pqState:0,num:null,six:new BigInteger(null),addNext:2,keys:null};h.six.fromInt(6);return h};b.rsa.stepKeyPairGenerationState=function(g,j){var l=+new Date();var k;var o=0;while(g.keys===null&&(j<=0||o<j)){if(g.state===0){var p=(g.p===null)?g.pBits:g.qBits;var i=p-1;if(g.pqState===0){g.itrs=0;g.num=new BigInteger(p,g.rng);g.r=null;if(g.num.isEven()){g.num.dAddOffset(1,0)}if(!g.num.testBit(i)){g.num.bitwiseTo(BigInteger.ONE.shiftLeft(i),function(n,q){return n|q},g.num)}++g.pqState}else{if(g.pqState===1){if(g.addNext===null){var f=g.num.mod(g.six).byteValue();if(f===3){g.num.mod.dAddOffset(2);f=5}g.addNext=(f===1)?2:4}var h=g.num.isProbablePrime(1);if(h){++g.pqState}else{if(g.itrs<g.maxItrs){g.num.dAddOffset(g.addNext,0);if(g.num.bitLength()>p){g.addNext=null;g.num.subTo(BigInteger.ONE.shiftLeft(i),g.num)}else{g.addNext=(g.addNext===4)?2:4}++g.itrs}else{g.pqState=0}}}else{if(g.pqState===2){g.pqState=(g.num.subtract(BigInteger.ONE).gcd(g.e).compareTo(BigInteger.ONE)===0)?3:0}else{if(g.pqState===3){g.pqState=0;if(g.num.isProbablePrime(10)){if(g.p===null){g.p=g.num}else{g.q=g.num}if(g.p!==null&&g.q!==null){++g.state}}g.num=null}}}}}else{if(g.state===1){if(g.p.compareTo(g.q)<0){g.num=g.p;g.p=g.q;g.q=g.num}++g.state}else{if(g.state===2){g.p1=g.p.subtract(BigInteger.ONE);g.q1=g.q.subtract(BigInteger.ONE);g.phi=g.p1.multiply(g.q1);++g.state}else{if(g.state===3){if(g.phi.gcd(g.e).compareTo(BigInteger.ONE)===0){++g.state}else{g.p=null;g.q=null;g.state=0}}else{if(g.state===4){g.n=g.p.multiply(g.q);if(g.n.bitLength()===g.bits){++g.state}else{g.q=null;g.state=0}}else{if(g.state===5){var m=g.e.modInverse(g.phi);g.keys={privateKey:e.pki.rsa.setPrivateKey(g.n,g.e,m,g.p,g.q,m.mod(g.p1),m.mod(g.q1),g.q.modInverse(g.p)),publicKey:e.pki.rsa.setPublicKey(g.n,g.e)}}}}}}}k=+new Date();o+=k-l;l=k}return g.keys!==null};b.rsa.generateKeyPair=function(g,h){var f=b.rsa.createKeyPairGenerationState(g,h);b.rsa.stepKeyPairGenerationState(f,0);return f.keys};b.rsa.setPublicKey=function(h,g){var f={n:h,e:g};f.encrypt=function(i){return b.rsa.encrypt(i,f,2)};f.verify=function(m,i,j){var n=j===undefined?undefined:false;var l=b.rsa.decrypt(i,f,true,n);if(j===undefined){var k=d.fromDer(l);return m===k.value[1].value}else{return j.verify(m,l,f.n.bitLength())}};return f};b.rsa.setPrivateKey=function(h,i,j,g,f,l,k,o){var m={n:h,e:i,d:j,p:g,q:f,dP:l,dQ:k,qInv:o};m.decrypt=function(n){return b.rsa.decrypt(n,m,false)};m.sign=function(q,p){var n=false;if(p===undefined){p={encode:c};n=1}var r=p.encode(q,m.n.bitLength());return b.rsa.encrypt(r,m,n)};return m}})();

	//pki.js

	/**
	 * Javascript implementation of a basic Public Key Infrastructure, including
	 * support for RSA public and private keys.
	 *
	 * @author Dave Longley
	 * @author Stefan Siegl <stesie@brokenpipe.de>
	 *
	 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
	 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
	 *
	*/
	(function(){if(typeof(window)!=="undefined"){var f=window.forge=window.forge||{}}else{if(typeof(module)!=="undefined"&&module.exports){var f={aes:require("./aes"),asn1:require("./asn1"),des:require("./des"),md:require("./md"),mgf:require("./mgf"),pkcs5:require("./pbkdf2"),pki:{oids:require("./oids"),rsa:require("./rsa")},pss:require("./pss"),random:require("./random"),rc2:require("./rc2"),util:require("./util")};BigInteger=require("./jsbn");module.exports=f.pki;f.pkcs12=f.pkcs12||require("./pkcs12")}}var i=f.asn1;var c=f.pki=f.pki||{};var d=c.oids;c.pbe={};var l={};l.CN=d.commonName;l.commonName="CN";l.C=d.countryName;l.countryName="C";l.L=d.localityName;l.localityName="L";l.ST=d.stateOrProvinceName;l.stateOrProvinceName="ST";l.O=d.organizationName;l.organizationName="O";l.OU=d.organizationalUnitName;l.organizationalUnitName="OU";l.E=d.emailAddress;l.emailAddress="E";var p={name:"SubjectPublicKeyInfo",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,captureAsn1:"subjectPublicKeyInfo",value:[{name:"SubjectPublicKeyInfo.AlgorithmIdentifier",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"publicKeyOid"}]},{name:"SubjectPublicKeyInfo.subjectPublicKey",tagClass:i.Class.UNIVERSAL,type:i.Type.BITSTRING,constructed:false,value:[{name:"SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,optional:true,captureAsn1:"rsaPublicKey"}]}]};var k={name:"RSAPublicKey",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"RSAPublicKey.modulus",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"publicKeyModulus"},{name:"RSAPublicKey.exponent",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"publicKeyExponent"}]};var m={name:"Certificate",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"Certificate.TBSCertificate",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,captureAsn1:"tbsCertificate",value:[{name:"Certificate.TBSCertificate.version",tagClass:i.Class.CONTEXT_SPECIFIC,type:0,constructed:true,optional:true,value:[{name:"Certificate.TBSCertificate.version.integer",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"certVersion"}]},{name:"Certificate.TBSCertificate.serialNumber",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"certSerialNumber"},{name:"Certificate.TBSCertificate.signature",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"Certificate.TBSCertificate.signature.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"certinfoSignatureOid"},{name:"Certificate.TBSCertificate.signature.parameters",tagClass:i.Class.UNIVERSAL,optional:true,captureAsn1:"certinfoSignatureParams"}]},{name:"Certificate.TBSCertificate.issuer",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,captureAsn1:"certIssuer"},{name:"Certificate.TBSCertificate.validity",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"Certificate.TBSCertificate.validity.notBefore",tagClass:i.Class.UNIVERSAL,type:i.Type.UTCTIME,constructed:false,optional:true,capture:"certNotBefore"},{name:"Certificate.TBSCertificate.validity.notBefore (generalized)",tagClass:i.Class.UNIVERSAL,type:i.Type.GENERALIZEDTIME,constructed:false,optional:true,capture:"certNotBeforeGeneralized"},{name:"Certificate.TBSCertificate.validity.notAfter",tagClass:i.Class.UNIVERSAL,type:i.Type.UTCTIME,constructed:false,optional:true,capture:"certNotAfter"},{name:"Certificate.TBSCertificate.validity.notAfter",tagClass:i.Class.UNIVERSAL,type:i.Type.GENERALIZEDTIME,constructed:false,optional:true,capture:"certNotAfterGeneralized"}]},{name:"Certificate.TBSCertificate.subject",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,captureAsn1:"certSubject"},p,{name:"Certificate.TBSCertificate.issuerUniqueID",tagClass:i.Class.CONTEXT_SPECIFIC,type:1,constructed:true,optional:true,value:[{name:"Certificate.TBSCertificate.issuerUniqueID.id",tagClass:i.Class.UNIVERSAL,type:i.Type.BITSTRING,constructed:false,capture:"certIssuerUniqueId"}]},{name:"Certificate.TBSCertificate.subjectUniqueID",tagClass:i.Class.CONTEXT_SPECIFIC,type:2,constructed:true,optional:true,value:[{name:"Certificate.TBSCertificate.subjectUniqueID.id",tagClass:i.Class.UNIVERSAL,type:i.Type.BITSTRING,constructed:false,capture:"certSubjectUniqueId"}]},{name:"Certificate.TBSCertificate.extensions",tagClass:i.Class.CONTEXT_SPECIFIC,type:3,constructed:true,captureAsn1:"certExtensions",optional:true}]},{name:"Certificate.signatureAlgorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"Certificate.signatureAlgorithm.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"certSignatureOid"},{name:"Certificate.TBSCertificate.signature.parameters",tagClass:i.Class.UNIVERSAL,optional:true,captureAsn1:"certSignatureParams"}]},{name:"Certificate.signatureValue",tagClass:i.Class.UNIVERSAL,type:i.Type.BITSTRING,constructed:false,capture:"certSignature"}]};var h={name:"PrivateKeyInfo",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"PrivateKeyInfo.version",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyVersion"},{name:"PrivateKeyInfo.privateKeyAlgorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"privateKeyOid"}]},{name:"PrivateKeyInfo",tagClass:i.Class.UNIVERSAL,type:i.Type.OCTETSTRING,constructed:false,capture:"privateKey"}]};var o={name:"RSAPrivateKey",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"RSAPrivateKey.version",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyVersion"},{name:"RSAPrivateKey.modulus",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyModulus"},{name:"RSAPrivateKey.publicExponent",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyPublicExponent"},{name:"RSAPrivateKey.privateExponent",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyPrivateExponent"},{name:"RSAPrivateKey.prime1",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyPrime1"},{name:"RSAPrivateKey.prime2",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyPrime2"},{name:"RSAPrivateKey.exponent1",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyExponent1"},{name:"RSAPrivateKey.exponent2",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyExponent2"},{name:"RSAPrivateKey.coefficient",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"privateKeyCoefficient"}]};var n={name:"EncryptedPrivateKeyInfo",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"EncryptedPrivateKeyInfo.encryptionAlgorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"encryptionOid"},{name:"AlgorithmIdentifier.parameters",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,captureAsn1:"encryptionParams"}]},{name:"EncryptedPrivateKeyInfo.encryptedData",tagClass:i.Class.UNIVERSAL,type:i.Type.OCTETSTRING,constructed:false,capture:"encryptedData"}]};var r={name:"PBES2Algorithms",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"PBES2Algorithms.keyDerivationFunc",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"PBES2Algorithms.keyDerivationFunc.oid",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"kdfOid"},{name:"PBES2Algorithms.params",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"PBES2Algorithms.params.salt",tagClass:i.Class.UNIVERSAL,type:i.Type.OCTETSTRING,constructed:false,capture:"kdfSalt"},{name:"PBES2Algorithms.params.iterationCount",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,onstructed:true,capture:"kdfIterationCount"}]}]},{name:"PBES2Algorithms.encryptionScheme",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"PBES2Algorithms.encryptionScheme.oid",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"encOid"},{name:"PBES2Algorithms.encryptionScheme.iv",tagClass:i.Class.UNIVERSAL,type:i.Type.OCTETSTRING,constructed:false,capture:"encIv"}]}]};var u={name:"pkcs-12PbeParams",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"pkcs-12PbeParams.salt",tagClass:i.Class.UNIVERSAL,type:i.Type.OCTETSTRING,constructed:false,capture:"salt"},{name:"pkcs-12PbeParams.iterations",tagClass:i.Class.UNIVERSAL,type:i.Type.INTEGER,constructed:false,capture:"iterations"}]};var j={name:"rsapss",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"rsapss.hashAlgorithm",tagClass:i.Class.CONTEXT_SPECIFIC,type:0,constructed:true,value:[{name:"rsapss.hashAlgorithm.AlgorithmIdentifier",tagClass:i.Class.UNIVERSAL,type:i.Class.SEQUENCE,constructed:true,optional:true,value:[{name:"rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"hashOid"}]}]},{name:"rsapss.maskGenAlgorithm",tagClass:i.Class.CONTEXT_SPECIFIC,type:1,constructed:true,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier",tagClass:i.Class.UNIVERSAL,type:i.Class.SEQUENCE,constructed:true,optional:true,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"maskGenOid"},{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",tagClass:i.Class.UNIVERSAL,type:i.Type.SEQUENCE,constructed:true,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",tagClass:i.Class.UNIVERSAL,type:i.Type.OID,constructed:false,capture:"maskGenHashOid"}]}]}]},{name:"rsapss.saltLength",tagClass:i.Class.CONTEXT_SPECIFIC,type:2,optional:true,value:[{name:"rsapss.saltLength.saltLength",tagClass:i.Class.UNIVERSAL,type:i.Class.INTEGER,constructed:false,capture:"saltLength"}]},{name:"rsapss.trailerField",tagClass:i.Class.CONTEXT_SPECIFIC,type:3,optional:true,value:[{name:"rsapss.trailer.trailer",tagClass:i.Class.UNIVERSAL,type:i.Class.INTEGER,constructed:false,capture:"trailer"}]}]};c.RDNAttributesAsArray=function(z,y){var B=[];var C,v,A;for(var w=0;w<z.value.length;++w){C=z.value[w];for(var x=0;x<C.value.length;++x){A={};v=C.value[x];A.type=i.derToOid(v.value[0].value);A.value=v.value[1].value;A.valueTagClass=v.value[1].type;if(A.type in d){A.name=d[A.type];if(A.name in l){A.shortName=l[A.name]}}if(y){y.update(A.type);y.update(A.value)}B.push(A)}}return B};var b=function(z,w){if(w.constructor==String){w={shortName:w}}var y=null;var v;for(var x=0;y===null&&x<z.attributes.length;++x){v=z.attributes[x];if(w.type&&w.type===v.type){y=v}else{if(w.name&&w.name===v.name){y=v}else{if(w.shortName&&w.shortName===v.shortName){y=v}}}}return y};var e=function(B){var E=[];var F,w,y;for(var D=0;D<B.value.length;++D){y=B.value[D];for(var z=0;z<y.value.length;++z){w=y.value[z];F={};F.id=i.derToOid(w.value[0].value);F.critical=false;if(w.value[1].type===i.Type.BOOLEAN){F.critical=(w.value[1].value.charCodeAt(0)!==0);F.value=w.value[2].value}else{F.value=w.value[1].value}if(F.id in d){F.name=d[F.id];if(F.name==="keyUsage"){var I=i.fromDer(F.value);var H=0;var G=0;if(I.value.length>1){H=I.value.charCodeAt(1);G=I.value.length>2?I.value.charCodeAt(2):0}F.digitalSignature=(H&128)==128;F.nonRepudiation=(H&64)==64;F.keyEncipherment=(H&32)==32;F.dataEncipherment=(H&16)==16;F.keyAgreement=(H&8)==8;F.keyCertSign=(H&4)==4;F.cRLSign=(H&2)==2;F.encipherOnly=(H&1)==1;F.decipherOnly=(G&128)==128}else{if(F.name==="basicConstraints"){var I=i.fromDer(F.value);if(I.value.length>0){F.cA=(I.value[0].value.charCodeAt(0)!==0)}else{F.cA=false}if(I.value.length>1){var C=f.util.createBuffer(I.value[1].value);F.pathLenConstraint=C.getInt(C.length()<<3)}}else{if(F.name==="subjectAltName"||F.name==="issuerAltName"){F.altNames=[];var A;var I=i.fromDer(F.value);for(var x=0;x<I.value.length;++x){A=I.value[x];var v={type:A.type,value:A.value};F.altNames.push(v);switch(A.type){case 1:case 2:case 6:break;case 7:break;case 8:v.oid=i.derToOid(A.value);break;default:}}}}}}E.push(F)}}return E};var s=new RegExp("-----BEGIN [^-]+-----([A-Za-z0-9+/=\\s]+)-----END [^-]+-----");c.pemToDer=function(w){var x=null;var v=s.exec(w);if(v){x=f.util.createBuffer(f.util.decode64(v[1]))}else{throw"Invalid PEM format"}return x};var t=function(x,w){var z=null;var v=c.pemToDer(x);var y=i.fromDer(v);z=w(y);return z};var g=function(v){var w=v.toString(16);if(w[0]>="8"){w="00"+w}return f.util.hexToBytes(w)};var a=function(x,y,v){var z={};if(x!==d["RSASSA-PSS"]){return z}if(v){z={hash:{algorithmOid:d.sha1},mgf:{algorithmOid:d.mgf1,hash:{algorithmOid:d.sha1}},saltLength:20}}var w={};var A=[];if(!i.validate(y,j,w,A)){throw {message:"Cannot read RSASSA-PSS parameter block.",errors:A}}if(w.hashOid!==undefined){z.hash=z.hash||{};z.hash.algorithmOid=i.derToOid(w.hashOid)}if(w.maskGenOid!==undefined){z.mgf=z.mgf||{};z.mgf.algorithmOid=i.derToOid(w.maskGenOid);z.mgf.hash=z.mgf.hash||{};z.mgf.hash.algorithmOid=i.derToOid(w.maskGenHashOid)}if(w.saltLength!==undefined){z.saltLength=w.saltLength.charCodeAt(0)}return z};c.certificateFromPem=function(v,w){return t(v,function(x){return c.certificateFromAsn1(x,w)})};c.certificateToPem=function(w,x){var v=i.toDer(c.certificateToAsn1(w));v=f.util.encode64(v.getBytes(),x||64);return("-----BEGIN CERTIFICATE-----\r\n"+v+"\r\n-----END CERTIFICATE-----")};c.publicKeyFromPem=function(v){return t(v,c.publicKeyFromAsn1)};c.publicKeyToPem=function(w,x){var v=i.toDer(c.publicKeyToAsn1(w));v=f.util.encode64(v.getBytes(),x||64);return("-----BEGIN PUBLIC KEY-----\r\n"+v+"\r\n-----END PUBLIC KEY-----")};c.privateKeyFromPem=function(v){return t(v,c.privateKeyFromAsn1)};c.privateKeyToPem=function(w,x){var v=i.toDer(c.privateKeyToAsn1(w));v=f.util.encode64(v.getBytes(),x||64);return("-----BEGIN RSA PRIVATE KEY-----\r\n"+v+"\r\n-----END RSA PRIVATE KEY-----")};c.createCertificate=function(){var v={};v.version=2;v.serialNumber="00";v.signatureOid=null;v.signature=null;v.siginfo={};v.siginfo.algorithmOid=null;v.validity={};v.validity.notBefore=new Date();v.validity.notAfter=new Date();v.issuer={};v.issuer.getField=function(x){return b(v.issuer,x)};v.issuer.addField=function(x){w([x]);v.issuer.attributes.push(x)};v.issuer.attributes=[];v.issuer.hash=null;v.subject={};v.subject.getField=function(x){return b(v.subject,x)};v.subject.addField=function(x){w([x]);v.subject.attributes.push(x)};v.subject.attributes=[];v.subject.hash=null;v.extensions=[];v.publicKey=null;v.md=null;var w=function(y){var x;for(var z=0;z<y.length;++z){x=y[z];if(typeof(x.name)==="undefined"){if(x.type&&x.type in c.oids){x.name=c.oids[x.type]}else{if(x.shortName&&x.shortName in l){x.name=c.oids[l[x.shortName]]}}}if(typeof(x.type)==="undefined"){if(x.name&&x.name in c.oids){x.type=c.oids[x.name]}else{throw {message:"Attribute type not specified.",attribute:x}}}if(typeof(x.shortName)==="undefined"){if(x.name&&x.name in l){x.shortName=l[x.name]}}if(typeof(x.value)==="undefined"){throw {message:"Attribute value not specified.",attribute:x}}}};v.setSubject=function(x,y){w(x);v.subject.attributes=x;delete v.subject.uniqueId;if(y){v.subject.uniqueId=y}v.subject.hash=null};v.setIssuer=function(x,y){w(x);v.issuer.attributes=x;delete v.issuer.uniqueId;if(y){v.issuer.uniqueId=y}v.issuer.hash=null};v.setExtensions=function(A){var E;for(var C=0;C<A.length;++C){E=A[C];if(typeof(E.name)==="undefined"){if(E.id&&E.id in c.oids){E.name=c.oids[E.id]}}if(typeof(E.id)==="undefined"){if(E.name&&E.name in c.oids){E.id=c.oids[E.name]}else{throw {message:"Extension ID not specified.",extension:E}}}if(typeof(E.value)==="undefined"){if(E.name==="keyUsage"){var z=0;var G=0;var F=0;if(E.digitalSignature){G|=128;z=7}if(E.nonRepudiation){G|=64;z=6}if(E.keyEncipherment){G|=32;z=5}if(E.dataEncipherment){G|=16;z=4}if(E.keyAgreement){G|=8;z=3}if(E.keyCertSign){G|=4;z=2}if(E.cRLSign){G|=2;z=1}if(E.encipherOnly){G|=1;z=0}if(E.decipherOnly){F|=128;z=7}var H=String.fromCharCode(z);if(F!==0){H+=String.fromCharCode(G)+String.fromCharCode(F)}else{if(G!==0){H+=String.fromCharCode(G)}}E.value=i.create(i.Class.UNIVERSAL,i.Type.BITSTRING,false,H)}else{if(E.name==="basicConstraints"){E.value=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);if(E.cA){E.value.value.push(i.create(i.Class.UNIVERSAL,i.Type.BOOLEAN,false,String.fromCharCode(255)))}if(E.pathLenConstraint){var D=E.pathLenConstraint;var B=f.util.createBuffer();B.putInt(D,D.toString(2).length);E.value.value.push(i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,B.getBytes()))}}else{if(E.name==="subjectAltName"||E.name==="issuerAltName"){E.value=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);var x;for(var y=0;y<E.altNames.length;++y){x=E.altNames[y];var H=x.value;if(x.type===8){H=i.oidToDer(H)}E.value.value.push(i.create(i.Class.CONTEXT_SPECIFIC,x.type,false,H))}}}}if(typeof(E.value)==="undefined"){throw {message:"Extension value not specified.",extension:E}}}}v.extensions=A};v.getExtension=function(x){if(x.constructor==String){x={name:x}}var A=null;var z;for(var y=0;A===null&&y<v.extensions.length;++y){z=v.extensions[y];if(x.id&&z.id===x.id){A=z}else{if(x.name&&z.name===x.name){A=z}}}return A};v.sign=function(y){v.signatureOid=d.sha1withRSAEncryption;v.siginfo.algorithmOid=d.sha1withRSAEncryption;v.md=f.md.sha1.create();v.tbsCertificate=c.getTBSCertificate(v);var x=i.toDer(v.tbsCertificate);v.md.update(x.getBytes());v.signature=y.sign(v.md)};v.verify=function(x){var C=false;var D=x.md;if(D===null){if(v.signatureOid in d){var z=d[v.signatureOid];switch(z){case"sha1withRSAEncryption":D=f.md.sha1.create();break;case"md5withRSAEncryption":D=f.md.md5.create();break;case"sha256WithRSAEncryption":D=f.md.sha256.create();break;case"RSASSA-PSS":D=f.md.sha256.create();break}}if(D===null){throw {message:"Could not compute certificate digest. Unknown signature OID.",signatureOid:v.signatureOid}}var E=x.tbsCertificate||c.getTBSCertificate(x);var F=i.toDer(E);D.update(F.getBytes())}if(D!==null){var y=undefined;switch(x.signatureOid){case d.sha1withRSAEncryption:y=undefined;break;case d["RSASSA-PSS"]:var B,A;B=d[x.signatureParameters.mgf.hash.algorithmOid];if(B===undefined||f.md[B]===undefined){throw {message:"Unsupported MGF hash function.",oid:x.signatureParameters.mgf.hash.algorithmOid,name:B}}A=d[x.signatureParameters.mgf.algorithmOid];if(A===undefined||f.mgf[A]===undefined){throw {message:"Unsupported MGF function.",oid:x.signatureParameters.mgf.algorithmOid,name:A}}A=f.mgf[A].create(f.md[B].create());B=d[x.signatureParameters.hash.algorithmOid];if(B===undefined||f.md[B]===undefined){throw {message:"Unsupported RSASSA-PSS hash function.",oid:x.signatureParameters.hash.algorithmOid,name:B}}y=f.pss.create(f.md[B].create(),A,x.signatureParameters.saltLength);break}C=v.publicKey.verify(D.digest().getBytes(),x.signature,y)}return C};v.isIssuer=function(A){var C=false;var y=v.issuer;var z=A.subject;if(y.hash&&z.hash){C=(y.hash===z.hash)}else{if(y.attributes.length===z.attributes.length){C=true;var x,B;for(var D=0;C&&D<y.attributes.length;++D){x=y.attributes[D];B=z.attributes[D];if(x.type!==B.type||x.value!==B.value){C=false}}}}return C};return v};c.certificateFromAsn1=function(y,D){var E={};var C=[];if(!i.validate(y,m,E,C)){throw {message:"Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.",errors:C}}var x=i.derToOid(E.publicKeyOid);if(x!==c.oids.rsaEncryption){throw {message:"Cannot read public key. OID is not RSA."}}var z=c.createCertificate();z.version=E.certVersion?E.certVersion.charCodeAt(0):0;var v=f.util.createBuffer(E.certSerialNumber);z.serialNumber=v.toHex();z.signatureOid=f.asn1.derToOid(E.certSignatureOid);z.signatureParameters=a(z.signatureOid,E.certSignatureParams,true);z.siginfo.algorithmOid=f.asn1.derToOid(E.certinfoSignatureOid);z.siginfo.parameters=a(z.siginfo.algorithmOid,E.certinfoSignatureParams,false);var w=f.util.createBuffer(E.certSignature);++w.read;z.signature=w.getBytes();if(E.certNotBefore!==undefined){z.validity.notBefore=i.utcTimeToDate(E.certNotBefore)}else{if(E.certNotBeforeGeneralized!==undefined){z.validity.notBefore=i.generalizedTimeToDate(E.certNotBeforeGeneralized)}else{throw {message:"Cannot read notBefore time, neither provided as UTCTime nor as GeneralizedTime."}}}if(E.certNotAfter!==undefined){z.validity.notAfter=i.utcTimeToDate(E.certNotAfter)}else{if(E.certNotAfterGeneralized!==undefined){z.validity.notAfter=i.generalizedTimeToDate(E.certNotAfterGeneralized)}else{throw {message:"Cannot read notAfter time, neither provided as UTCTime nor as GeneralizedTime."}}}z.tbsCertificate=E.tbsCertificate;if(D){z.md=null;if(z.signatureOid in d){var x=d[z.signatureOid];switch(x){case"sha1withRSAEncryption":z.md=f.md.sha1.create();break;case"md5withRSAEncryption":z.md=f.md.md5.create();break;case"sha256WithRSAEncryption":z.md=f.md.sha256.create();break;case"RSASSA-PSS":z.md=f.md.sha256.create();break}}if(z.md===null){throw {message:"Could not compute certificate digest. Unknown signature OID.",signatureOid:z.signatureOid}}var F=i.toDer(z.tbsCertificate);z.md.update(F.getBytes())}var A=f.md.sha1.create();z.issuer.attributes=c.RDNAttributesAsArray(E.certIssuer,A);if(E.certIssuerUniqueId){z.issuer.uniqueId=E.certIssuerUniqueId}z.issuer.hash=A.digest().toHex();var B=f.md.sha1.create();z.subject.attributes=c.RDNAttributesAsArray(E.certSubject,B);if(E.certSubjectUniqueId){z.subject.uniqueId=E.certSubjectUniqueId}z.subject.hash=B.digest().toHex();if(E.certExtensions){z.extensions=e(E.certExtensions)}else{z.extensions=[]}z.publicKey=c.publicKeyFromAsn1(E.subjectPublicKeyInfo);return z};_dnToAsn1=function(B){var A=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);var v,C;var w=B.attributes;for(var x=0;x<w.length;++x){v=w[x];var z=v.value;var y=i.Type.PRINTABLESTRING;if("valueTagClass" in v){y=v.valueTagClass;if(y===i.Type.UTF8){z=f.util.encodeUtf8(z)}}C=i.create(i.Class.UNIVERSAL,i.Type.SET,true,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(v.type).getBytes()),i.create(i.Class.UNIVERSAL,y,false,z)])]);A.value.push(C)}return A};_extensionsToAsn1=function(y){var B=i.create(i.Class.CONTEXT_SPECIFIC,3,true,[]);var w=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);B.value.push(w);var z,v;for(var x=0;x<y.length;++x){z=y[x];v=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);w.value.push(v);v.value.push(i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(z.id).getBytes()));if(z.critical){v.value.push(i.create(i.Class.UNIVERSAL,i.Type.BOOLEAN,false,String.fromCharCode(255)))}var A=z.value;if(z.value.constructor!=String){A=i.toDer(A).getBytes()}v.value.push(i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,A))}return B};var q=function(v,x){switch(v){case d["RSASSA-PSS"]:var w=[];if(x.hash.algorithmOid!==undefined){w.push(i.create(i.Class.CONTEXT_SPECIFIC,0,true,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(x.hash.algorithmOid).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.NULL,false,"")])]))}if(x.mgf.algorithmOid!==undefined){w.push(i.create(i.Class.CONTEXT_SPECIFIC,1,true,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(x.mgf.algorithmOid).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(x.mgf.hash.algorithmOid).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.NULL,false,"")])])]))}if(x.saltLength!==undefined){w.push(i.create(i.Class.CONTEXT_SPECIFIC,2,true,[i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,String.fromCharCode(x.saltLength))]))}return i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,w);default:return i.create(i.Class.UNIVERSAL,i.Type.NULL,false,"")}};c.getTBSCertificate=function(w){var v=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.CONTEXT_SPECIFIC,0,true,[i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,String.fromCharCode(w.version))]),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,f.util.hexToBytes(w.serialNumber)),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(w.siginfo.algorithmOid).getBytes()),q(w.siginfo.algorithmOid,w.siginfo.parameters)]),_dnToAsn1(w.issuer),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.UTCTIME,false,i.dateToUtcTime(w.validity.notBefore)),i.create(i.Class.UNIVERSAL,i.Type.UTCTIME,false,i.dateToUtcTime(w.validity.notAfter))]),_dnToAsn1(w.subject),c.publicKeyToAsn1(w.publicKey)]);if(w.issuer.uniqueId){v.value.push(i.create(i.Class.CONTEXT_SPECIFIC,1,true,[i.create(i.Class.UNIVERSAL,i.Type.BITSTRING,false,String.fromCharCode(0)+w.issuer.uniqueId)]))}if(w.subject.uniqueId){v.value.push(i.create(i.Class.CONTEXT_SPECIFIC,2,true,[i.create(i.Class.UNIVERSAL,i.Type.BITSTRING,false,String.fromCharCode(0)+w.subject.uniqueId)]))}if(w.extensions.length>0){v.value.push(_extensionsToAsn1(w.extensions))}return v};c.distinguishedNameToAsn1=function(v){return _dnToAsn1(v)};c.certificateToAsn1=function(w){var v=w.tbsCertificate||c.getTBSCertificate(w);return i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[v,i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(w.signatureOid).getBytes()),q(w.signatureOid,w.signatureParameters)]),i.create(i.Class.UNIVERSAL,i.Type.BITSTRING,false,String.fromCharCode(0)+w.signature)])};c.createCaStore=function(y){var x={certs:{}};x.getIssuer=function(z){var A=null;if(z.issuer.hash in x.certs){A=x.certs[z.issuer.hash];if(A.constructor==Array){throw {message:"Resolving multiple issuer matches not implemented yet."}}}return A};x.addCertificate=function(A){if(A.constructor==String){A=f.pki.certificateFromPem(A)}if(A.subject.hash in x.certs){var z=x.certs[A.subject.hash];if(z.constructor!=Array){z=[z]}z.push(A)}else{x.certs[A.subject.hash]=A}};if(y){for(var w=0;w<y.length;++w){var v=y[w];x.addCertificate(v)}}return x};c.certificateError={bad_certificate:"forge.pki.BadCertificate",unsupported_certificate:"forge.pki.UnsupportedCertificate",certificate_revoked:"forge.pki.CertificateRevoked",certificate_expired:"forge.pki.CertificateExpired",certificate_unknown:"forge.pki.CertificateUnknown",unknown_ca:"forge.pki.UnknownCertificateAuthority"};c.verifyCertificateChain=function(B,D,v){D=D.slice(0);var x=D.slice(0);var w=new Date();var z=true;var F=null;var N=0;var A=null;do{var L=D.shift();if(w<L.validity.notBefore||w>L.validity.notAfter){F={message:"Certificate is not valid yet or has expired.",error:c.certificateError.certificate_expired,notBefore:L.validity.notBefore,notAfter:L.validity.notAfter,now:w}}else{var E=false;if(D.length>0){A=D[0];try{E=A.verify(L)}catch(I){}}else{var K=B.getIssuer(L);if(K===null){F={message:"Certificate is not trusted.",error:c.certificateError.unknown_ca}}else{if(K.constructor!==Array){K=[K]}while(!E&&K.length>0){A=K.shift();try{E=A.verify(L)}catch(I){}}}}if(F===null&&!E){F={message:"Certificate signature is invalid.",error:c.certificateError.bad_certificate}}}if(F===null&&!L.isIssuer(A)){F={message:"Certificate issuer is invalid.",error:c.certificateError.bad_certificate}}if(F===null){var O={keyUsage:true,basicConstraints:true};for(var H=0;F===null&&H<L.extensions.length;++H){var y=L.extensions[H];if(y.critical&&!(y.name in O)){F={message:"Certificate has an unsupported critical extension.",error:c.certificateError.unsupported_certificate}}}}if(!z||(D.length===0&&!A)){var G=L.getExtension("basicConstraints");var C=L.getExtension("keyUsage");if(C!==null){if(!C.keyCertSign||G===null){F={message:"Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",error:c.certificateError.bad_certificate}}}if(F===null&&G!==null&&!G.cA){F={message:"Certificate basicConstraints indicates the certificate is not a CA.",error:c.certificateError.bad_certificate}}}var J=(F===null)?true:F.error;var M=v?v(J,N,x):J;if(M===true){F=null}else{if(J===true){F={message:"The application rejected the certificate.",error:c.certificateError.bad_certificate}}if(M||M===0){if(M.constructor===Object){if(M.message){F.message=M.message}if(M.error){F.error=M.error}}else{if(M.constructor===String){F.error=M}}}throw F}z=false;++N}while(D.length>0);return true};c.publicKeyFromAsn1=function(y){var v={};var A=[];if(!i.validate(y,p,v,A)){throw {message:"Cannot read public key. ASN.1 object is not a SubjectPublicKeyInfo.",errors:A}}var w=i.derToOid(v.publicKeyOid);if(w!==c.oids.rsaEncryption){throw {message:"Cannot read public key. Unknown OID.",oid:w}}A=[];if(!i.validate(v.rsaPublicKey,k,v,A)){throw {message:"Cannot read public key. ASN.1 object is not an RSAPublicKey.",errors:A}}var z=f.util.createBuffer(v.publicKeyModulus).toHex();var x=f.util.createBuffer(v.publicKeyExponent).toHex();return c.setRsaPublicKey(new BigInteger(z,16),new BigInteger(x,16))};c.publicKeyToAsn1=function(v){return i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(c.oids.rsaEncryption).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.NULL,false,"")]),i.create(i.Class.UNIVERSAL,i.Type.BITSTRING,false,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.n)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.e))])])])};c.privateKeyFromAsn1=function(y){var E={};var D=[];if(i.validate(y,h,E,D)){y=i.fromDer(f.util.createBuffer(E.privateKey))}E={};D=[];if(!i.validate(y,o,E,D)){throw {message:"Cannot read private key. ASN.1 object is not an RSAPrivateKey.",errors:D}}var x,z,A,w,v,C,B,F;x=f.util.createBuffer(E.privateKeyModulus).toHex();z=f.util.createBuffer(E.privateKeyPublicExponent).toHex();A=f.util.createBuffer(E.privateKeyPrivateExponent).toHex();w=f.util.createBuffer(E.privateKeyPrime1).toHex();v=f.util.createBuffer(E.privateKeyPrime2).toHex();C=f.util.createBuffer(E.privateKeyExponent1).toHex();B=f.util.createBuffer(E.privateKeyExponent2).toHex();F=f.util.createBuffer(E.privateKeyCoefficient).toHex();return c.setRsaPrivateKey(new BigInteger(x,16),new BigInteger(z,16),new BigInteger(A,16),new BigInteger(w,16),new BigInteger(v,16),new BigInteger(C,16),new BigInteger(B,16),new BigInteger(F,16))};c.privateKeyToAsn1=function(v){return i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,String.fromCharCode(0)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.n)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.e)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.d)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.p)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.q)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.dP)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.dQ)),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,g(v.qInv))])};c.wrapRsaPrivateKey=function(v){var x=d.rsaEncryption;var y=i.oidToDer(x).getBytes();var w=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[]);w.value.push(i.create(i.Class.UNIVERSAL,i.Type.OID,false,y));w.value.push(i.create(i.Class.UNIVERSAL,i.Type.NULL,false,""));return i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,String.fromCharCode(0)),w,i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,i.toDer(v).getBytes())])};c.encryptPrivateKeyInfo=function(y,G,I){I=I||{};I.saltSize=I.saltSize||8;I.count=I.count||2048;I.algorithm=I.algorithm||"aes128";var A=f.random.getBytes(I.saltSize);var E=I.count;var F=f.util.createBuffer();F.putInt16(E);var J;var B;var v;if(I.algorithm.indexOf("aes")===0){var H;if(I.algorithm==="aes128"){J=16;H=d["aes128-CBC"]}else{if(I.algorithm==="aes192"){J=24;H=d["aes192-CBC"]}else{if(I.algorithm==="aes256"){J=32;H=d["aes256-CBC"]}else{throw {message:"Cannot encrypt private key. Unknown encryption algorithm.",algorithm:I.algorithm}}}}var D=f.pkcs5.pbkdf2(G,A,E,J);var w=f.random.getBytes(16);var C=f.aes.createEncryptionCipher(D);C.start(w);C.update(i.toDer(y));C.finish();v=C.output.getBytes();B=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(d.pkcs5PBES2).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(d.pkcs5PBKDF2).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,A),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,F.getBytes())]),]),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(H).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,w),])])])}else{if(I.algorithm==="3des"){J=24;var x=new f.util.ByteBuffer(A);var D=f.pkcs12.generateKey(G,x,1,E,J);var w=f.pkcs12.generateKey(G,x,2,E,J);var C=f.des.createEncryptionCipher(D);C.start(w);C.update(i.toDer(y));C.finish();v=C.output.getBytes();B=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OID,false,i.oidToDer(d["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes()),i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,A),i.create(i.Class.UNIVERSAL,i.Type.INTEGER,false,F.getBytes())])])}else{throw {message:"Cannot encrypt private key. Unknown encryption algorithm.",algorithm:I.algorithm}}}var z=i.create(i.Class.UNIVERSAL,i.Type.SEQUENCE,true,[B,i.create(i.Class.UNIVERSAL,i.Type.OCTETSTRING,false,v)]);return z};c.pbe.getCipherForPBES2=function(v,x,D){var E={};var C=[];if(!i.validate(x,r,E,C)){throw {message:"Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",errors:C}}v=i.derToOid(E.kdfOid);if(v!==c.oids.pkcs5PBKDF2){throw {message:"Cannot read encrypted private key. Unsupported key derivation function OID.",oid:v,supportedOids:["pkcs5PBKDF2"]}}v=i.derToOid(E.encOid);if(v!==c.oids["aes128-CBC"]&&v!==c.oids["aes192-CBC"]&&v!==c.oids["aes256-CBC"]){throw {message:"Cannot read encrypted private key. Unsupported encryption scheme OID.",oid:v,supportedOids:["aes128-CBC","aes192-CBC","aes256-CBC"]}}var y=E.kdfSalt;var B=f.util.createBuffer(E.kdfIterationCount);B=B.getInt(B.length()<<3);var F;if(v===c.oids["aes128-CBC"]){F=16}else{if(v===c.oids["aes192-CBC"]){F=24}else{if(v===c.oids["aes256-CBC"]){F=32}}}var A=f.pkcs5.pbkdf2(D,y,B,F);var w=E.encIv;var z=f.aes.createDecryptionCipher(A);z.start(w);return z};c.pbe.getCipherForPKCS12PBE=function(w,y,E){var F={};var B=[];if(!i.validate(y,u,F,B)){throw {message:"Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",errors:B}}var z=f.util.createBuffer(F.salt);var A=f.util.createBuffer(F.iterations);A=A.getInt(A.length()<<3);var G,v,D;switch(w){case c.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:G=24;v=8;D=f.des.startDecrypting;break;case c.oids["pbewithSHAAnd40BitRC2-CBC"]:G=5;v=8;D=function(J,I){var H=f.rc2.createDecryptionCipher(J,40);H.start(I,null);return H};break;default:throw {message:"Cannot read PKCS #12 PBE data block. Unsupported OID.",oid:w}}var C=f.pkcs12.generateKey(E,z,1,A,G);var x=f.pkcs12.generateKey(E,z,2,A,v);return D(C,x)};c.pbe.getCipher=function(w,x,v){switch(w){case c.oids.pkcs5PBES2:return c.pbe.getCipherForPBES2(w,x,v);break;case c.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:case c.oids["pbewithSHAAnd40BitRC2-CBC"]:return c.pbe.getCipherForPKCS12PBE(w,x,v);break;default:throw {message:"Cannot read encrypted PBE data block. Unsupported OID.",oid:w,supportedOids:["pkcs5PBES2","pbeWithSHAAnd3-KeyTripleDES-CBC","pbewithSHAAnd40BitRC2-CBC"]}}};c.decryptPrivateKeyInfo=function(B,x){var A=null;var w={};var C=[];if(!i.validate(B,n,w,C)){throw {message:"Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",errors:C}}var y=i.derToOid(w.encryptionOid);var v=c.pbe.getCipher(y,w.encryptionParams,x);var z=f.util.createBuffer(w.encryptedData);v.update(z);if(v.finish()){A=i.fromDer(v.output)}return A};c.encryptedPrivateKeyToPem=function(w,x){var v=i.toDer(w);v=f.util.encode64(v.getBytes(),x||64);return("-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n"+v+"\r\n-----END ENCRYPTED PRIVATE KEY-----")};c.encryptedPrivateKeyFromPem=function(w){var v=c.pemToDer(w);return i.fromDer(v)};c.encryptRsaPrivateKey=function(v,x,w){var y=c.wrapRsaPrivateKey(c.privateKeyToAsn1(v));y=c.encryptPrivateKeyInfo(y,x,w);return c.encryptedPrivateKeyToPem(y)};c.decryptRsaPrivateKey=function(w,v){var x=c.encryptedPrivateKeyFromPem(w);x=c.decryptPrivateKeyInfo(x,v);if(x!==null){x=c.privateKeyFromAsn1(x)}return x};c.setRsaPublicKey=c.rsa.setPublicKey;c.setRsaPrivateKey=c.rsa.setPrivateKey})();

	//tls.js

	/**
	 * A Javascript implementation of Transport Layer Security (TLS).
	 *
	 * @author Dave Longley
	 *
	 * Copyright (c) 2009-2012 Digital Bazaar, Inc.
	*/
	(function(){if(typeof(window)!=="undefined"){var N=window.forge=window.forge||{};N.tls={}}else{if(typeof(module)!=="undefined"&&module.exports){var N={aes:require("./aes"),asn1:require("./asn1"),hmac:require("./hmac"),md:require("./md"),pki:require("./pki"),random:require("./random"),util:require("./util")};N.pki.oids=require("./oids");N.pki.rsa=require("./rsa");module.exports=N.tls={}}}var O=function(Y,ak,ad,X){var ac=N.util.createBuffer();var am=(Y.length>>1);var ag=am+(Y.length&1);var ao=Y.substr(0,ag);var al=Y.substr(am,ag);var aj=N.util.createBuffer();var ae=N.hmac.create();ad=ak+ad;var aa=Math.ceil(X/16);var ab=Math.ceil(X/20);ae.start("MD5",ao);var an=N.util.createBuffer();aj.putBytes(ad);for(var Z=0;Z<aa;++Z){var af=new Date().valueOf();ae.start(null,null);ae.update(aj.getBytes());aj.putBuffer(ae.digest());ae.start(null,null);ae.update(aj.bytes()+ad);an.putBuffer(ae.digest())}ae.start("SHA1",al);var ah=N.util.createBuffer();aj.clear();aj.putBytes(ad);for(var Z=0;Z<ab;++Z){ae.start(null,null);ae.update(aj.getBytes());aj.putBuffer(ae.digest());ae.start(null,null);ae.update(aj.bytes()+ad);ah.putBuffer(ae.digest())}ac.putBytes(N.util.xorBytes(an.getBytes(),ah.getBytes(),X));return ac};var e=function(Y,Z,X,aa){};var j=function(Z,ab,Y){var aa=N.hmac.create();aa.start("SHA1",Z);var X=N.util.createBuffer();X.putInt32(ab[0]);X.putInt32(ab[1]);X.putByte(Y.type);X.putByte(Y.version.major);X.putByte(Y.version.minor);X.putInt16(Y.length);X.putBytes(Y.fragment.bytes());aa.update(X.getBytes());return aa.digest().getBytes()};var I=function(ac,Y,aa){var ab=false;try{var X=ac.deflate(Y.fragment.getBytes());Y.fragment=N.util.createBuffer(X);Y.length=X.length;ab=true}catch(Z){}return ab};var p=function(ac,Y,aa){var ab=false;try{var X=ac.inflate(Y.fragment.getBytes());Y.fragment=N.util.createBuffer(X);Y.length=X.length;ab=true}catch(Z){}return ab};var f=function(Y,aa){var ab=false;var ac=aa.macFunction(aa.macKey,aa.sequenceNumber,Y);Y.fragment.putBytes(ac);aa.updateSequenceNumber();var Z=aa.cipherState.init?null:aa.cipherState.iv;aa.cipherState.init=true;var X=aa.cipherState.cipher;X.start(Z);X.update(Y.fragment);if(X.finish(V)){Y.fragment=X.output;Y.length=Y.fragment.length();ab=true}return ab};var V=function(Z,X,Y){if(!Y){var aa=(X.length()==Z)?(Z-1):(Z-X.length()-1);X.fillWithByte(aa,aa+1)}return true};var r=function(ac,Z,aa){var ad=true;if(aa){var X=Z.length();var Y=Z.last();for(var ab=X-1-Y;ab<X-1;++ab){ad=ad&&(Z.at(ab)==Y)}if(ad){Z.truncate(Y+1)}}return ad};var S=function(ab,ag){var aa=false;var Y=ag.cipherState.init?null:ag.cipherState.iv;ag.cipherState.init=true;var ad=ag.cipherState.cipher;ad.start(Y);ad.update(ab.fragment);aa=ad.finish(r);var af=ag.macLength;var ae="";for(var Z=0;Z<af;++Z){ae+=String.fromCharCode(0)}var ac=ad.output.length();if(ac>=af){ab.fragment=ad.output.getBytes(ac-af);ae=ad.output.getBytes(af)}else{ab.fragment=ad.output.getBytes()}ab.fragment=N.util.createBuffer(ab.fragment);ab.length=ab.fragment.length();var X=ag.macFunction(ag.macKey,ag.sequenceNumber,ab);ag.updateSequenceNumber();aa=(X===ae)&&aa;return aa};var d=function(Z,Y){var X=0;switch(Y){case 1:X=Z.getByte();break;case 2:X=Z.getInt16();break;case 3:X=Z.getInt24();break;case 4:X=Z.getInt32();break}return N.util.createBuffer(Z.getBytes(X))};var n=function(Y,X,Z){Y.putInt(Z.length(),X<<3);Y.putBuffer(Z)};var g={};g.Version={major:3,minor:1};g.MaxFragment=(1<<14)-1024;g.ConnectionEnd={server:0,client:1};g.PRFAlgorithm={tls_prf_sha256:0};g.BulkCipherAlgorithm={none:null,rc4:0,des3:1,aes:2};g.CipherType={stream:0,block:1,aead:2};g.MACAlgorithm={none:null,hmac_md5:0,hmac_sha1:1,hmac_sha256:2,hmac_sha384:3,hmac_sha512:4};g.CompressionMethod={none:0,deflate:1};g.ContentType={change_cipher_spec:20,alert:21,handshake:22,application_data:23};g.HandshakeType={hello_request:0,client_hello:1,server_hello:2,certificate:11,server_key_exchange:12,certificate_request:13,server_hello_done:14,certificate_verify:15,client_key_exchange:16,finished:20};g.Alert={};g.Alert.Level={warning:1,fatal:2};g.Alert.Description={close_notify:0,unexpected_message:10,bad_record_mac:20,decryption_failed:21,record_overflow:22,decompression_failure:30,handshake_failure:40,bad_certificate:42,unsupported_certificate:43,certificate_revoked:44,certificate_expired:45,certificate_unknown:46,illegal_parameter:47,unknown_ca:48,access_denied:49,decode_error:50,decrypt_error:51,export_restriction:60,protocol_version:70,insufficient_security:71,internal_error:80,user_canceled:90,no_renegotiation:100};g.CipherSuites={TLS_RSA_WITH_AES_128_CBC_SHA:[0,47],TLS_RSA_WITH_AES_256_CBC_SHA:[0,53]};g.getCipherSuite=function(X){var aa=null;for(var Y in g.CipherSuites){var Z=g.CipherSuites[Y];if(Z[0]===X.charCodeAt(0)&&Z[1]===X.charCodeAt(1)){aa=Z;break}}return aa};g.handleUnexpected=function(Z,X){var Y=(!Z.open&&Z.entity===g.ConnectionEnd.client);if(!Y){Z.error(Z,{message:"Unexpected message. Received TLS record out of order.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.unexpected_message}})}};g.handleHelloRequest=function(Z,X,Y){if(!Z.handshaking&&Z.handshakes>0){g.queue(Z,g.createAlert({level:g.Alert.Level.warning,description:g.Alert.Description.no_renegotiation}));g.flush(Z)}Z.process()};g.parseHelloMessage=function(ag,af,Z){var aa=null;var ab=(ag.entity==g.ConnectionEnd.client);if(Z<38){ag.error(ag,{message:ab?"Invalid ServerHello message. Message too short.":"Invalid ClientHello message. Message too short.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{var ai=af.fragment;aa={version:{major:ai.getByte(),minor:ai.getByte()},random:N.util.createBuffer(ai.getBytes(32)),session_id:d(ai,1),extensions:[]};if(ab){aa.cipher_suite=ai.getBytes(2);aa.compression_method=ai.getByte()}else{aa.cipher_suites=d(ai,2);aa.compression_methods=d(ai,1)}if(ai.length()>0){var ac=d(ai,2);while(ac.length()>0){aa.extensions.push({type:[ac.getByte(),ac.getByte()],data:d(ac,2)})}if(!ab){for(var ae=0;ae<aa.extensions.length;++ae){var Y=aa.extensions[ae];if(Y.type[0]===0&&Y.type[1]===0){var X=d(Y.data,2);while(X.length()>0){var ah=X.getByte();if(ah!==0){break}ag.session.serverNameList.push(d(X,2).getBytes())}}}}}if(aa.version.major!==g.Version.major||aa.version.minor!==g.Version.minor){ag.error(ag,{message:"Incompatible TLS version.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.protocol_version}})}if(ab){ag.session.cipherSuite=g.getCipherSuite(aa.cipher_suite)}else{var ad=N.util.createBuffer(aa.cipher_suites.bytes());while(ad.length()>0){ag.session.cipherSuite=g.getCipherSuite(ad.getBytes(2));if(ag.session.cipherSuite!==null){break}}}if(ag.session.cipherSuite===null){ag.error(ag,{message:"No cipher suites in common.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.handshake_failure},cipherSuite:N.util.bytesToHex(aa.cipher_suite)})}if(ab){ag.session.compressionMethod=aa.compression_method}else{ag.session.compressionMethod=g.CompressionMethod.none}}return aa};g.createSecurityParameters=function(ad,aa){var Z;switch(ad.session.cipherSuite){case g.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA:Z=16;break;case g.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA:Z=32;break}var X=(ad.entity===g.ConnectionEnd.client);var Y=aa.random.bytes();var ac=X?ad.session.sp.client_random:Y;var ab=X?Y:g.createRandom().getBytes();ad.session.sp={entity:ad.entity,prf_algorithm:g.PRFAlgorithm.tls_prf_sha256,bulk_cipher_algorithm:g.BulkCipherAlgorithm.aes,cipher_type:g.CipherType.block,enc_key_length:Z,block_length:16,fixed_iv_length:16,record_iv_length:16,mac_algorithm:g.MACAlgorithm.hmac_sha1,mac_length:20,mac_key_length:20,compression_algorithm:ad.session.compressionMethod,pre_master_secret:null,master_secret:null,client_random:ac,server_random:ab}};g.handleServerHello=function(ab,X,Y){var aa=g.parseHelloMessage(ab,X,Y);if(!ab.fail){var Z=aa.session_id.bytes();if(Z===ab.session.id){ab.expect=T;ab.session.resuming=true;ab.session.sp.server_random=aa.random.bytes()}else{ab.expect=R;ab.session.resuming=false;g.createSecurityParameters(ab,aa)}ab.session.id=Z;ab.process()}};g.handleClientHello=function(ac,X,Y){var ab=g.parseHelloMessage(ac,X,Y);if(!ac.fail){var aa=ab.session_id.bytes();var Z=null;if(ac.sessionCache){Z=ac.sessionCache.getSession(aa);if(Z===null){aa=""}}if(aa.length===0){aa=N.random.getBytes(32)}ac.session.id=aa;ac.session.clientHelloVersion=ab.version;ac.session.sp=Z?Z.sp:{};if(Z!==null){ac.expect=M;ac.session.resuming=true;ac.session.sp.client_random=ab.random.bytes()}else{ac.expect=(ac.verifyClient!==false)?K:c;ac.session.resuming=false;g.createSecurityParameters(ac,ab)}ac.open=true;g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createServerHello(ac)}));if(ac.session.resuming){g.queue(ac,g.createRecord({type:g.ContentType.change_cipher_spec,data:g.createChangeCipherSpec()}));ac.state.pending=g.createConnectionState(ac);ac.state.current.write=ac.state.pending.write;g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createFinished(ac)}))}else{g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createCertificate(ac)}));g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createServerKeyExchange(ac)}));if(ac.verifyClient!==false){g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createCertificateRequest(ac)}))}g.queue(ac,g.createRecord({type:g.ContentType.handshake,data:g.createServerHelloDone(ac)}))}g.flush(ac);ac.process()}};g.handleCertificate=function(af,ad,X){if(X<3){af.error(af,{message:"Invalid Certificate message. Message too short.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{var ag=ad.fragment;var Y={certificate_list:d(ag,3)};var ab,aa;var ac=[];try{while(Y.certificate_list.length()>0){ab=d(Y.certificate_list,3);aa=N.asn1.fromDer(ab);ab=N.pki.certificateFromAsn1(aa,true);ac.push(ab)}}catch(ae){af.error(af,{message:"Could not parse certificate list.",cause:ae,send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.bad_certificate}})}if(!af.fail){var Z=(af.entity===g.ConnectionEnd.client);if((Z||af.verifyClient===true)&&ac.length===0){af.error(af,{message:Z?"No server certificate provided.":"No client certificate provided.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{if(ac.length===0){af.expect=Z?k:c}else{if(Z){af.session.serverCertificate=ac[0]}else{af.session.clientCertificate=ac[0]}if(g.verifyCertificateChain(af,ac)){af.expect=Z?k:c}}}af.process()}}};g.handleServerKeyExchange=function(Z,X,Y){if(Y>0){Z.error(Z,{message:"Invalid key parameters. Only RSA is supported.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.unsupported_certificate}})}else{Z.expect=L;Z.process()}};g.handleClientKeyExchange=function(ae,aa,ac){if(ac<48){ae.error(ae,{message:"Invalid key parameters. Only RSA is supported.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.unsupported_certificate}})}else{var X=aa.fragment;msg={enc_pre_master_secret:d(X,2).getBytes()};var Z=null;if(ae.getPrivateKey){try{Z=ae.getPrivateKey(ae,ae.session.serverCertificate);Z=N.pki.privateKeyFromPem(Z)}catch(ab){ae.error(ae,{message:"Could not get private key.",cause:ab,send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}}if(Z===null){ae.error(ae,{message:"No private key set.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}else{try{var ad=ae.session.sp;ad.pre_master_secret=Z.decrypt(msg.enc_pre_master_secret);var Y=ae.session.clientHelloVersion;if(Y.major!==ad.pre_master_secret.charCodeAt(0)||Y.minor!==ad.pre_master_secret.charCodeAt(1)){throw {message:"TLS version rollback attack detected."}}}catch(ab){ad.pre_master_secret=N.random.getBytes(48)}}}if(!ae.fail){ae.expect=M;if(ae.session.clientCertificate!==null){ae.expect=x}ae.process()}};g.handleCertificateRequest=function(ab,Y,Z){if(Z<3){ab.error(ab,{message:"Invalid CertificateRequest. Message too short.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{var X=Y.fragment;var aa={certificate_types:d(X,1),certificate_authorities:d(X,2)};ab.session.certificateRequest=aa;ab.expect=i;ab.process()}};g.handleCertificateVerify=function(ae,Y,ac){if(ac<2){ae.error(ae,{message:"Invalid CertificateVerify. Message too short.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{var X=Y.fragment;X.read-=4;var Z=X.bytes();X.read+=4;msg={signature:d(X,2).getBytes()};var ad=N.util.createBuffer();ad.putBuffer(ae.session.md5.digest());ad.putBuffer(ae.session.sha1.digest());ad=ad.getBytes();try{var ab=ae.session.clientCertificate;X=N.pki.rsa.decrypt(msg.signature,ab.publicKey,true,ad.length);if(X!==ad){throw {message:"CertificateVerify signature does not match."}}ae.session.md5.update(Z);ae.session.sha1.update(Z)}catch(aa){ae.error(ae,{message:"Bad signature in CertificateVerify.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.handshake_failure}})}if(!ae.fail){ae.expect=M;ae.process()}}};g.handleServerHelloDone=function(ac,X,aa){if(aa>0){ac.error(ac,{message:"Invalid ServerHelloDone message. Invalid length.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.record_overflow}})}else{if(ac.serverCertificate===null){var Z={message:"No server certificate provided. Not enough security.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.insufficient_security}};var Y=ac.verify(ac,Z.alert.description,depth,[]);if(Y===true){Z=null}else{if(Y||Y===0){if(Y.constructor==Object){if(Y.message){Z.message=Y.message}if(Y.alert){Z.alert.description=Y.alert}}else{if(Y.constructor==Number){Z.alert.description=Y}}}ac.error(ac,Z)}}}if(!ac.fail&&ac.session.certificateRequest!==null){X=g.createRecord({type:g.ContentType.handshake,data:g.createCertificate(ac)});g.queue(ac,X)}if(!ac.fail){X=g.createRecord({type:g.ContentType.handshake,data:g.createClientKeyExchange(ac)});g.queue(ac,X);ac.expect=a;var ab=function(ae,ad){if(ae.session.certificateRequest!==null&&ae.session.clientCertificate!==null){g.queue(ae,g.createRecord({type:g.ContentType.handshake,data:g.createCertificateVerify(ae,ad)}))}g.queue(ae,g.createRecord({type:g.ContentType.change_cipher_spec,data:g.createChangeCipherSpec()}));ae.state.pending=g.createConnectionState(ae);ae.state.current.write=ae.state.pending.write;g.queue(ae,g.createRecord({type:g.ContentType.handshake,data:g.createFinished(ae)}));ae.expect=T;g.flush(ae);ae.process()};if(ac.session.certificateRequest===null||ac.session.clientCertificate===null){ab(ac,null)}else{g.getClientSignature(ac,ab)}}};g.handleChangeCipherSpec=function(Z,Y){if(Y.fragment.getByte()!=1){Z.error(Z,{message:"Invalid ChangeCipherSpec message received.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.illegal_parameter}})}else{var X=(Z.entity===g.ConnectionEnd.client);if((Z.session.resuming&&X)||(!Z.session.resuming&&!X)){Z.state.pending=g.createConnectionState(Z)}Z.state.current.read=Z.state.pending.read;if((!Z.session.resuming&&X)||(Z.session.resuming&&!X)){Z.state.pending=null}Z.expect=X?P:G;Z.process()}};g.handleFinished=function(af,ad,Z){var ag=ad.fragment;ag.read-=4;var aa=ag.bytes();ag.read+=4;var ae=ad.fragment.getBytes();ag=N.util.createBuffer();ag.putBuffer(af.session.md5.digest());ag.putBuffer(af.session.sha1.digest());var ac=(af.entity===g.ConnectionEnd.client);var ah=ac?"server finished":"client finished";var X=af.session.sp;var Y=12;var ab=O;ag=ab(X.master_secret,ah,ag.getBytes(),Y);if(ag.getBytes()!==ae){af.error(af,{message:"Invalid verify_data in Finished message.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.decrypt_error}})}else{af.session.md5.update(aa);af.session.sha1.update(aa);if((af.session.resuming&&ac)||(!af.session.resuming&&!ac)){g.queue(af,g.createRecord({type:g.ContentType.change_cipher_spec,data:g.createChangeCipherSpec()}));af.state.current.write=af.state.pending.write;af.state.pending=null;g.queue(af,g.createRecord({type:g.ContentType.handshake,data:g.createFinished(af)}))}af.expect=ac?v:q;af.handshaking=false;++af.handshakes;af.peerCertificate=ac?af.session.serverCertificate:af.session.clientCertificate;if(af.sessionCache){af.session={id:af.session.id,sp:af.session.sp};af.session.sp.keys=null}else{af.session=null}g.flush(af);af.isConnected=true;af.connected(af);af.process()}};g.handleAlert=function(ab,Y){var X=Y.fragment;var aa={level:X.getByte(),description:X.getByte()};var Z;switch(aa.description){case g.Alert.Description.close_notify:Z="Connection closed.";break;case g.Alert.Description.unexpected_message:Z="Unexpected message.";break;case g.Alert.Description.bad_record_mac:Z="Bad record MAC.";break;case g.Alert.Description.decryption_failed:Z="Decryption failed.";break;case g.Alert.Description.record_overflow:Z="Record overflow.";break;case g.Alert.Description.decompression_failure:Z="Decompression failed.";break;case g.Alert.Description.handshake_failure:Z="Handshake failure.";break;case g.Alert.Description.bad_certificate:Z="Bad certificate.";break;case g.Alert.Description.unsupported_certificate:Z="Unsupported certificate.";break;case g.Alert.Description.certificate_revoked:Z="Certificate revoked.";break;case g.Alert.Description.certificate_expired:Z="Certificate expired.";break;case g.Alert.Description.certificate_unknown:Z="Certificate unknown.";break;case g.Alert.Description.illegal_parameter:Z="Illegal parameter.";break;case g.Alert.Description.unknown_ca:Z="Unknown certificate authority.";break;case g.Alert.Description.access_denied:Z="Access denied.";break;case g.Alert.Description.decode_error:Z="Decode error.";break;case g.Alert.Description.decrypt_error:Z="Decrypt error.";break;case g.Alert.Description.export_restriction:Z="Export restriction.";break;case g.Alert.Description.protocol_version:Z="Unsupported protocol version.";break;case g.Alert.Description.insufficient_security:Z="Insufficient security.";break;case g.Alert.Description.internal_error:Z="Internal error.";break;case g.Alert.Description.user_canceled:Z="User canceled.";break;case g.Alert.Description.no_renegotiation:Z="Renegotiation not supported.";break;default:Z="Unknown error.";break}if(aa.description===g.Alert.Description.close_notify){ab.close()}else{ab.error(ab,{message:Z,send:false,origin:(ab.entity===g.ConnectionEnd.client)?"server":"client",alert:aa});ab.process()}};g.handleHandshake=function(ac,Z){var X=Z.fragment;var aa=X.getByte();var ab=X.getInt24();if(ab>X.length()){ac.fragmented=Z;Z.fragment=N.util.createBuffer();X.read-=4;ac.process()}else{ac.fragmented=null;X.read-=4;var Y=X.bytes(ab+4);X.read+=4;if(aa in Q[ac.entity][ac.expect]){if(ac.entity===g.ConnectionEnd.server&&!ac.open&&!ac.fail){ac.handshaking=true;ac.session={serverNameList:[],cipherSuite:null,compressionMethod:null,serverCertificate:null,clientCertificate:null,md5:N.md.md5.create(),sha1:N.md.sha1.create()}}if(aa!==g.HandshakeType.hello_request&&aa!==g.HandshakeType.certificate_verify&&aa!==g.HandshakeType.finished){ac.session.md5.update(Y);ac.session.sha1.update(Y)}Q[ac.entity][ac.expect][aa](ac,Z,ab)}else{g.handleUnexpected(ac,Z)}}};g.handleApplicationData=function(Y,X){Y.data.putBuffer(X.fragment);Y.dataReady(Y);Y.process()};var h=0;var R=1;var k=2;var L=3;var i=4;var T=5;var P=6;var v=7;var a=8;var b=0;var K=1;var c=2;var x=3;var M=4;var G=5;var q=6;var U=7;var W=g.handleUnexpected;var J=g.handleChangeCipherSpec;var H=g.handleAlert;var F=g.handleHandshake;var E=g.handleApplicationData;var o=[];o[g.ConnectionEnd.client]=[[W,W,F,W],[W,H,F,W],[W,H,F,W],[W,H,F,W],[W,H,F,W],[J,H,W,W],[W,H,F,W],[W,H,F,E],[W,H,F,W]];o[g.ConnectionEnd.server]=[[W,W,F,W],[W,H,F,W],[W,H,F,W],[W,H,F,W],[J,H,W,W],[W,H,F,W],[W,H,F,E],[W,H,F,W]];var D=g.handleHelloRequest;var C=g.handleServerHello;var B=g.handleCertificate;var A=g.handleServerKeyExchange;var z=g.handleCertificateRequest;var y=g.handleServerHelloDone;var w=g.handleFinished;var Q=[];Q[g.ConnectionEnd.client]=[[W,W,C,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,B,A,z,y,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,A,z,y,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,W,z,y,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,W,W,y,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,w],[D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]];var u=g.handleClientHello;var t=g.handleClientKeyExchange;var s=g.handleCertificateVerify;Q[g.ConnectionEnd.server]=[[W,u,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,B,W,W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,t,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,s,W,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,w],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]];g.generateKeys=function(ac,ab){var aa=O;var Z=ab.client_random+ab.server_random;if(!ac.session.resuming){ab.master_secret=aa(ab.pre_master_secret,"master secret",Z,48).bytes();ab.pre_master_secret=null}Z=ab.server_random+ab.client_random;var Y=2*ab.mac_key_length+2*ab.enc_key_length+2*ab.fixed_iv_length;var X=aa(ab.master_secret,"key expansion",Z,Y);return{client_write_MAC_key:X.getBytes(ab.mac_key_length),server_write_MAC_key:X.getBytes(ab.mac_key_length),client_write_key:X.getBytes(ab.enc_key_length),server_write_key:X.getBytes(ab.enc_key_length),client_write_IV:X.getBytes(ab.fixed_iv_length),server_write_IV:X.getBytes(ab.fixed_iv_length)}};g.createConnectionState=function(ab){var Y=(ab.entity===g.ConnectionEnd.client);var X=function(){var ac={sequenceNumber:[0,0],macKey:null,macLength:0,macFunction:null,cipherState:null,cipherFunction:function(ad){return true},compressionState:null,compressFunction:function(ad){return true},updateSequenceNumber:function(){if(ac.sequenceNumber[1]==4294967295){ac.sequenceNumber[1]=0;++ac.sequenceNumber[0]}else{++ac.sequenceNumber[1]}}};return ac};var aa={read:X(),write:X()};aa.read.update=function(ad,ac){if(!aa.read.cipherFunction(ac,aa.read)){ad.error(ad,{message:"Could not decrypt record or bad MAC.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.bad_record_mac}})}else{if(!aa.read.compressFunction(ad,ac,aa.read)){ad.error(ad,{message:"Could not decompress record.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.decompression_failure}})}}return !ad.fail};aa.write.update=function(ad,ac){if(!aa.write.compressFunction(ad,ac,aa.write)){ad.error(ad,{message:"Could not compress record.",send:false,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}else{if(!aa.write.cipherFunction(ac,aa.write)){ad.error(ad,{message:"Could not encrypt record.",send:false,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}}return !ad.fail};if(ab.session){var Z=ab.session.sp;Z.keys=g.generateKeys(ab,Z);aa.read.macKey=Y?Z.keys.server_write_MAC_key:Z.keys.client_write_MAC_key;aa.write.macKey=Y?Z.keys.client_write_MAC_key:Z.keys.server_write_MAC_key;aa.read.macLength=aa.write.macLength=Z.mac_length;switch(Z.mac_algorithm){case g.MACAlgorithm.hmac_sha1:aa.read.macFunction=aa.write.macFunction=j;break;default:throw {message:"Unsupported MAC algorithm."}}switch(Z.bulk_cipher_algorithm){case g.BulkCipherAlgorithm.aes:aa.read.cipherState={init:false,cipher:N.aes.createDecryptionCipher(Y?Z.keys.server_write_key:Z.keys.client_write_key),iv:Y?Z.keys.server_write_IV:Z.keys.client_write_IV};aa.write.cipherState={init:false,cipher:N.aes.createEncryptionCipher(Y?Z.keys.client_write_key:Z.keys.server_write_key),iv:Y?Z.keys.client_write_IV:Z.keys.server_write_IV};aa.read.cipherFunction=S;aa.write.cipherFunction=f;break;default:throw {message:"Unsupported cipher algorithm."}}switch(Z.cipher_type){case g.CipherType.block:break;default:throw {message:"Unsupported cipher type."}}switch(Z.compression_algorithm){case g.CompressionMethod.none:break;case g.CompressionMethod.deflate:aa.read.compressFunction=p;aa.write.compressFunction=I;break;default:throw {message:"Unsupported compression algorithm."}}}return aa};g.createRandom=function(){var Z=new Date();var X=+Z+Z.getTimezoneOffset()*60000;var Y=N.util.createBuffer();Y.putInt32(X);Y.putBytes(N.random.getBytes(28));return Y};g.createRecord=function(Y){var X={type:Y.type,version:{major:g.Version.major,minor:g.Version.minor},length:Y.data.length(),fragment:Y.data};return X};g.createAlert=function(Y){var X=N.util.createBuffer();X.putByte(Y.level);X.putByte(Y.description);return g.createRecord({type:g.ContentType.alert,data:X})};g.createClientHello=function(ah){var ak=N.util.createBuffer();for(var ad=0;ad<ah.cipherSuites.length;++ad){var af=ah.cipherSuites[ad];ak.putByte(af[0]);ak.putByte(af[1])}var aj=ak.length();var al=N.util.createBuffer();al.putByte(g.CompressionMethod.none);var Y=al.length();var ai=N.util.createBuffer();if(ah.virtualHost){var aa=N.util.createBuffer();aa.putByte(0);aa.putByte(0);var X=N.util.createBuffer();X.putByte(0);n(X,2,N.util.createBuffer(ah.virtualHost));var ag=N.util.createBuffer();n(ag,2,X);n(aa,2,ag);ai.putBuffer(aa)}var ac=ai.length();if(ac>0){ac+=2}var ab=ah.session.id;var Z=ab.length+1+2+4+28+2+aj+1+Y+ac;var ae=N.util.createBuffer();ae.putByte(g.HandshakeType.client_hello);ae.putInt24(Z);ae.putByte(g.Version.major);ae.putByte(g.Version.minor);ae.putBytes(ah.session.sp.client_random);n(ae,1,N.util.createBuffer(ab));n(ae,2,ak);n(ae,1,al);if(ac>0){n(ae,2,ai)}return ae};g.createServerHello=function(aa){var Z=aa.session.id;var X=Z.length+1+2+4+28+2+1;var Y=N.util.createBuffer();Y.putByte(g.HandshakeType.server_hello);Y.putInt24(X);Y.putByte(g.Version.major);Y.putByte(g.Version.minor);Y.putBytes(aa.session.sp.server_random);n(Y,1,N.util.createBuffer(Z));Y.putByte(aa.session.cipherSuite[0]);Y.putByte(aa.session.cipherSuite[1]);Y.putByte(aa.session.compressionMethod);return Y};g.createCertificate=function(ag){var Y=(ag.entity===g.ConnectionEnd.client);var ab=null;if(ag.getCertificate){ab=ag.getCertificate(ag,Y?ag.session.certificateRequest:ag.session.serverNameList)}var ah=N.util.createBuffer();if(ab!==null){try{if((Array.isArray&&!Array.isArray(ab))||ab.constructor!==Array){ab=[ab]}var Z=null;for(var ac=0;ac<ab.length;++ac){var af=N.pki.pemToDer(ab);if(Z===null){Z=N.asn1.fromDer(af.bytes())}var aa=N.util.createBuffer();n(aa,3,af);ah.putBuffer(aa)}ab=N.pki.certificateFromAsn1(Z);if(Y){ag.session.clientCertificate=ab}else{ag.session.serverCertificate=ab}}catch(ae){ag.error(ag,{message:"Could not send certificate list.",cause:ae,send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.bad_certificate}})}}var X=3+ah.length();var ad=N.util.createBuffer();ad.putByte(g.HandshakeType.certificate);ad.putInt24(X);n(ad,3,ah);return ad};g.createClientKeyExchange=function(ac){var X=N.util.createBuffer();X.putByte(g.Version.major);X.putByte(g.Version.minor);X.putBytes(N.random.getBytes(46));var aa=ac.session.sp;aa.pre_master_secret=X.getBytes();var Y=ac.session.serverCertificate.publicKey;X=Y.encrypt(aa.pre_master_secret);var Z=X.length+2;var ab=N.util.createBuffer();ab.putByte(g.HandshakeType.client_key_exchange);ab.putInt24(Z);ab.putInt16(X.length);ab.putBytes(X);return ab};g.createServerKeyExchange=function(Z){var X=0;var Y=N.util.createBuffer();Y.putByte(g.HandshakeType.server_key_exchange);Y.putInt24(X);return Y};g.getClientSignature=function(Z,Y){var X=N.util.createBuffer();X.putBuffer(Z.session.md5.digest());X.putBuffer(Z.session.sha1.digest());X=X.getBytes();Z.getSignature=Z.getSignature||function(ae,aa,ad){var ab=null;if(ae.getPrivateKey){try{ab=ae.getPrivateKey(ae,ae.session.clientCertificate);ab=N.pki.privateKeyFromPem(ab)}catch(ac){ae.error(ae,{message:"Could not get private key.",cause:ac,send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}}if(ab===null){ae.error(ae,{message:"No private key set.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.internal_error}})}else{aa=N.pki.rsa.encrypt(aa,ab,1)}ad(ae,aa)};Z.getSignature(Z,X,Y)};g.createCertificateVerify=function(aa,X){var Y=X.length+2;var Z=N.util.createBuffer();Z.putByte(g.HandshakeType.certificate_verify);Z.putInt24(Y);Z.putInt16(X.length);Z.putBytes(X);return Z};g.createCertificateRequest=function(ae){var Z=N.util.createBuffer();Z.putByte(1);var Y=N.util.createBuffer();for(var ab in ae.caStore.certs){var aa=ae.caStore.certs[ab];var X=N.pki.distinguishedNameToAsn1(aa.subject);Y.putBuffer(N.asn1.toDer(X))}var ac=1+Z.length()+2+Y.length();var ad=N.util.createBuffer();ad.putByte(g.HandshakeType.certificate_request);ad.putInt24(ac);n(ad,1,Z);n(ad,2,Y);return ad};g.createServerHelloDone=function(Y){var X=N.util.createBuffer();X.putByte(g.HandshakeType.server_hello_done);X.putInt24(0);return X};g.createChangeCipherSpec=function(){var X=N.util.createBuffer();X.putByte(1);return X};g.createFinished=function(ae){var X=N.util.createBuffer();X.putBuffer(ae.session.md5.digest());X.putBuffer(ae.session.sha1.digest());var Y=(ae.entity===g.ConnectionEnd.client);var ac=ae.session.sp;var aa=12;var ab=O;var Z=Y?"client finished":"server finished";X=ab(ac.master_secret,Z,X.getBytes(),aa);var ad=N.util.createBuffer();ad.putByte(g.HandshakeType.finished);ad.putInt24(X.length());ad.putBuffer(X);return ad};g.queue=function(ae,Y){if(Y.type===g.ContentType.handshake){var X=Y.fragment.bytes();ae.session.md5.update(X);ae.session.sha1.update(X);X=null}var Z;if(Y.fragment.length()<=g.MaxFragment){Z=[Y]}else{Z=[];var ac=Y.fragment.bytes();while(ac.length>g.MaxFragment){Z.push(g.createRecord({type:Y.type,data:N.util.createBuffer(ac.slice(0,g.MaxFragment))}));ac=ac.slice(g.MaxFragment)}if(ac.length>0){Z.push(g.createRecord({type:Y.type,data:N.util.createBuffer(ac)}))}}for(var aa=0;aa<Z.length&&!ae.fail;++aa){var ad=Z[aa];var ab=ae.state.current.write;if(ab.update(ae,ad)){ae.records.push(ad)}}};g.flush=function(Z){for(var Y=0;Y<Z.records.length;++Y){var X=Z.records[Y];Z.tlsData.putByte(X.type);Z.tlsData.putByte(X.version.major);Z.tlsData.putByte(X.version.minor);Z.tlsData.putInt16(X.fragment.length());Z.tlsData.putBuffer(Z.records[Y].fragment)}Z.records=[];return Z.tlsDataReady(Z)};var m=function(X){switch(X){case true:return true;case N.pki.certificateError.bad_certificate:return g.Alert.Description.bad_certificate;case N.pki.certificateError.unsupported_certificate:return g.Alert.Description.unsupported_certificate;case N.pki.certificateError.certificate_revoked:return g.Alert.Description.certificate_revoked;case N.pki.certificateError.certificate_expired:return g.Alert.Description.certificate_expired;case N.pki.certificateError.certificate_unknown:return g.Alert.Description.certificate_unknown;case N.pki.certificateError.unknown_ca:return g.Alert.Description.unknown_ca;default:return g.Alert.Description.bad_certificate}};var l=function(X){switch(X){case true:return true;case g.Alert.Description.bad_certificate:return N.pki.certificateError.bad_certificate;case g.Alert.Description.unsupported_certificate:return N.pki.certificateError.unsupported_certificate;case g.Alert.Description.certificate_revoked:return N.pki.certificateError.certificate_revoked;case g.Alert.Description.certificate_expired:return N.pki.certificateError.certificate_expired;case g.Alert.Description.certificate_unknown:return N.pki.certificateError.certificate_unknown;case g.Alert.Description.unknown_ca:return N.pki.certificateError.unknown_ca;default:return N.pki.certificateError.bad_certificate}};g.verifyCertificateChain=function(aa,Y){try{N.pki.verifyCertificateChain(aa.caStore,Y,function Z(ae,ag,ad){var af=m(ae);var ac=aa.verify(aa,ae,ag,ad);if(ac!==true){if(ac.constructor===Object){var ab={message:"The application rejected the certificate.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.bad_certificate}};if(ac.message){ab.message=ac.message}if(ac.alert){ab.alert.description=ac.alert}throw ab}if(ac!==ae){ac=l(ac)}}return ac})}catch(X){if(X.constructor!==Object){X={send:true,alert:{level:g.Alert.Level.fatal,description:m(X)}}}if(!("send" in X)){X.send=true}if(!("alert" in X)){X.alert={level:g.Alert.Level.fatal,description:m(X.error)}}aa.error(aa,X)}return !aa.fail};g.createSessionCache=function(Y,X){var aa=null;if(Y&&Y.getSession&&Y.setSession&&Y.order){aa=Y}else{aa={};aa.cache=Y||{};aa.capacity=Math.max(X||100,1);aa.order=[];for(var Z in Y){if(aa.order.length<=X){aa.order.push(Z)}else{delete Y[Z]}}aa.getSession=function(ae){var ad=null;var ac=null;if(ae){ac=N.util.bytesToHex(ae)}else{if(aa.order.length>0){ac=aa.order[0]}}if(ac!==null&&ac in aa.cache){ad=aa.cache[ac];delete aa.cache[ac];for(var ab in aa.order){if(aa.order[ab]===ac){aa.order.splice(ab,1);break}}}return ad};aa.setSession=function(ad,ac){if(aa.order.length===aa.capacity){var ab=aa.order.shift();delete aa.cache[ab]}var ab=N.util.bytesToHex(ad);aa.order.push(ab);aa.cache[ab]=ac}}return aa};g.createConnection=function(af){var X=null;if(af.caStore){if((Array.isArray&&Array.isArray(af.caStore))||af.caStore.constructor==Array){X=N.pki.createCaStore(af.caStore)}else{X=af.caStore}}else{X=N.pki.createCaStore()}var ad=af.cipherSuites||null;if(ad===null){ad=[];ad.push(g.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA);ad.push(g.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA)}var aa=(af.server||false)?g.ConnectionEnd.server:g.ConnectionEnd.client;var Z=af.sessionCache?g.createSessionCache(af.sessionCache):null;var ab={entity:aa,sessionId:af.sessionId,caStore:X,sessionCache:Z,cipherSuites:ad,connected:af.connected,virtualHost:af.virtualHost||null,verifyClient:af.verifyClient||false,verify:af.verify||function(aj,ag,ai,ah){return ag},getCertificate:af.getCertificate||null,getPrivateKey:af.getPrivateKey||null,getSignature:af.getSignature||null,input:N.util.createBuffer(),tlsData:N.util.createBuffer(),data:N.util.createBuffer(),tlsDataReady:af.tlsDataReady,dataReady:af.dataReady,closed:af.closed,error:function(ai,ag){ag.origin=ag.origin||((ai.entity===g.ConnectionEnd.client)?"client":"server");if(ag.send){g.queue(ai,g.createAlert(ag.alert));g.flush(ai)}var ah=(ag.fatal!==false);if(ah){ai.fail=true}af.error(ai,ag);if(ah){ai.close(false)}},deflate:af.deflate||null,inflate:af.inflate||null};ab.reset=function(ag){ab.record=null;ab.session=null;ab.peerCertificate=null;ab.state={pending:null,current:null};ab.expect=(ab.entity===g.ConnectionEnd.client)?h:b;ab.fragmented=null;ab.records=[];ab.open=false;ab.handshakes=0;ab.handshaking=false;ab.isConnected=false;ab.fail=!(ag||typeof(ag)==="undefined");ab.input.clear();ab.tlsData.clear();ab.data.clear();ab.state.current=g.createConnectionState(ab)};ab.reset();var ae=function(aj,ag){var ai=ag.type-g.ContentType.change_cipher_spec;var ah=o[aj.entity][aj.expect];if(ai in ah){ah[ai](aj,ag)}else{g.handleUnexpected(aj,ag)}};var ac=function(aj){var ai=0;var ah=aj.input;var ag=ah.length();if(ag<5){ai=5-ag}else{aj.record={type:ah.getByte(),version:{major:ah.getByte(),minor:ah.getByte()},length:ah.getInt16(),fragment:N.util.createBuffer(),ready:false};if(aj.record.version.major!=g.Version.major||aj.record.version.minor!=g.Version.minor){aj.error(aj,{message:"Incompatible TLS version.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.protocol_version}})}}return ai};var Y=function(ak){var aj=0;var ah=ak.input;var ag=ah.length();if(ag<ak.record.length){aj=ak.record.length-ag}else{ak.record.fragment.putBytes(ah.getBytes(ak.record.length));var ai=ak.state.current.read;if(ai.update(ak,ak.record)){if(ak.fragmented!==null){if(ak.fragmented.type===ak.record.type){ak.fragmented.fragment.putBuffer(ak.record.fragment);ak.record=ak.fragmented}else{ak.error(ak,{message:"Invalid fragmented record.",send:true,alert:{level:g.Alert.Level.fatal,description:g.Alert.Description.unexpected_message}})}}ak.record.ready=true}}return aj};ab.handshake=function(ah){if(ab.entity!==g.ConnectionEnd.client){ab.error(ab,{message:"Cannot initiate handshake as a server.",fatal:false})}else{if(ab.handshaking){ab.error(ab,{message:"Handshake already in progress.",fatal:false})}else{if(ab.fail&&!ab.open&&ab.handshakes===0){ab.fail=false}ab.handshaking=true;ah=ah||"";var ag=null;if(ah.length>0){if(ab.sessionCache){ag=ab.sessionCache.getSession(ah)}if(ag===null){ah=""}}if(ah.length===0&&ab.sessionCache){ag=ab.sessionCache.getSession();if(ag!==null){ah=ag.id}}ab.session={id:ah,cipherSuite:null,compressionMethod:null,serverCertificate:null,certificateRequest:null,clientCertificate:null,sp:ag?ag.sp:{},md5:N.md.md5.create(),sha1:N.md.sha1.create()};ab.session.sp.client_random=g.createRandom().getBytes();ab.open=true;g.queue(ab,g.createRecord({type:g.ContentType.handshake,data:g.createClientHello(ab)}));g.flush(ab)}}};ab.process=function(ag){var ah=0;if(ag){ab.input.putBytes(ag)}if(!ab.fail){if(ab.record!==null&&ab.record.ready&&ab.record.fragment.isEmpty()){ab.record=null}if(ab.record===null){ah=ac(ab)}if(!ab.fail&&ab.record!==null&&!ab.record.ready){ah=Y(ab)}if(!ab.fail&&ab.record!==null&&ab.record.ready){ae(ab,ab.record)}}return ah};ab.prepare=function(ag){g.queue(ab,g.createRecord({type:g.ContentType.application_data,data:N.util.createBuffer(ag)}));return g.flush(ab)};ab.close=function(ag){if(!ab.fail&&ab.sessionCache&&ab.session){ab.sessionCache.setSession(ab.session.id,ab.session)}if(ab.open){ab.open=false;ab.input.clear();if(ab.isConnected||ab.handshaking){ab.isConnected=ab.handshaking=false;g.queue(ab,g.createAlert({level:g.Alert.Level.warning,description:g.Alert.Description.close_notify}));g.flush(ab)}ab.closed(ab)}ab.reset(ag)};return ab};N.tls.prf_tls1=O;N.tls.Alert=g.Alert;N.tls.CipherSuites=g.CipherSuites;N.tls.createSessionCache=g.createSessionCache;N.tls.createConnection=g.createConnection})();(function(){var d={};if(typeof(window)!=="undefined"){var g=window.forge=window.forge||{}}else{if(typeof(module)!=="undefined"&&module.exports){var g={util:require("./util")};module.exports=d}}g.md=g.md||{};g.md.algorithms=g.md.algorithms||{};g.md.md5=g.md.algorithms.md5=d;var f=null;var c=null;var i=null;var a=null;var b=false;var e=function(){f=String.fromCharCode(128);f+=g.util.fillString(String.fromCharCode(0),64);c=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12,5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2,0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9];i=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];a=new Array(64);for(var j=0;j<64;++j){a[j]=Math.floor(Math.abs(Math.sin(j+1))*4294967296)}b=true};var h=function(x,u,y){var v,q,p,o,n,m,j,k;var l=y.length();while(l>=64){q=x.h0;p=x.h1;o=x.h2;n=x.h3;for(k=0;k<16;++k){u[k]=y.getInt32Le();m=n^(p&(o^n));v=(q+m+a[k]+u[k]);j=i[k];q=n;n=o;o=p;p+=(v<<j)|(v>>>(32-j))}for(;k<32;++k){m=o^(n&(p^o));v=(q+m+a[k]+u[c[k]]);j=i[k];q=n;n=o;o=p;p+=(v<<j)|(v>>>(32-j))}for(;k<48;++k){m=p^o^n;v=(q+m+a[k]+u[c[k]]);j=i[k];q=n;n=o;o=p;p+=(v<<j)|(v>>>(32-j))}for(;k<64;++k){m=o^(p|~n);v=(q+m+a[k]+u[c[k]]);j=i[k];q=n;n=o;o=p;p+=(v<<j)|(v>>>(32-j))}x.h0=(x.h0+q)&4294967295;x.h1=(x.h1+p)&4294967295;x.h2=(x.h2+o)&4294967295;x.h3=(x.h3+n)&4294967295;l-=64}};d.create=function(){if(!b){e()}var j=null;var m=g.util.createBuffer();var k=new Array(16);var l={algorithm:"md5",blockLength:64,digestLength:16,messageLength:0};l.start=function(){l.messageLength=0;m=g.util.createBuffer();j={h0:1732584193,h1:4023233417,h2:2562383102,h3:271733878}};l.start();l.update=function(o,n){if(n==="utf8"){o=g.util.encodeUtf8(o)}l.messageLength+=o.length;m.putBytes(o);h(j,k,m);if(m.read>2048||m.length()===0){m.compact()}};l.digest=function(){var n=l.messageLength;var q=g.util.createBuffer();q.putBytes(m.bytes());q.putBytes(f.substr(0,64-((n+8)%64)));q.putInt32Le((n<<3)&4294967295);q.putInt32Le((n>>>29)&255);var o={h0:j.h0,h1:j.h1,h2:j.h2,h3:j.h3};h(o,k,q);var p=g.util.createBuffer();p.putInt32Le(o.h0);p.putInt32Le(o.h1);p.putInt32Le(o.h2);p.putInt32Le(o.h3);return p};return l}})();

	/*
	encode/decode : equivalent to utils functions
	*/
	var decode=function(data) {
		var l=data.length;
		var arr=[];
		for (var i=0;i<l;i++) {
			var n=(data[i].charCodeAt()).toString(16); //utf8 SYN --> hex 16
			arr.push(n.length>1?n:'0'+n);
		};
		return arr.join('');
	};

	var encode=function(data) {
		var l=data.length;
		var arr=[];
		for (var i=0;i<l;i=i+2) {
			arr.push(String.fromCharCode(parseInt(data[i]+data[i+1],16))); //hex 16 --> dec 22 --> utf8 SYN
		};
		return arr.join('');
	};

	// function to create certificate
	var createCert=function(cn) {
		console.log('Generating 512-bit key-pair and certificate for \"' + cn + '\".');
		var keys = forge.pki.rsa.generateKeyPair(512);
		console.log('key-pair created.');
		var cert = forge.pki.createCertificate();
		cert.serialNumber = '01';
		cert.validity.notBefore = new Date();
		cert.validity.notAfter = new Date();
		cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
		var attrs = [{
			name: 'commonName',
			value: cn
		}, {
			name: 'countryName',
			value: 'US'
		}, {
			shortName: 'ST',
			value: 'Virginia'
		}, {
			name: 'localityName',
			value: 'Blacksburg'
		}, {
			name: 'organizationName',
			value: 'Test'
		}, {
			shortName: 'OU',
			value: 'Test'
		}];
		cert.setSubject(attrs);
		cert.setIssuer(attrs);
		cert.setExtensions([{
			name: 'basicConstraints',
			cA: true
		}, {
			name: 'keyUsage',
			keyCertSign: true,
			digitalSignature: true,
			nonRepudiation: true,
			keyEncipherment: true,
			dataEncipherment: true
		}, {
			name: 'subjectAltName',
			altNames: [{
				type: 6, // URI
				value: 'http://myuri.com/webid#me'
		  }]
		}]);
		// FIXME: add subjectKeyIdentifier extension
		// FIXME: add authorityKeyIdentifier extension
		cert.publicKey = keys.publicKey;
		// self-sign certificate
		cert.sign(keys.privateKey);
		console.log('certificate created for \"' + cn + '\": \n' + forge.pki.certificateToPem(cert));
		return {
			cert: forge.pki.certificateToPem(cert),
			privateKey: forge.pki.privateKeyToPem(keys.privateKey)
		};
	};

	/* Note : the € symbol is used to check that the real utf-8 encoding (ie not binary one) is correct bot ways during the communication */
	var abstract_tls=function(socket,domain,server) {
		var type=server?'server':'client';
		var data=createCert(server?domain:'client');
		return forge.tls.createConnection({
			server: server?true:false,
			caStore: [data.cert], //TODO populate caStore
			sessionCache: {},
			// supported cipher suites in order of preference
			cipherSuites: [
				forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
				forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
			virtualHost: server?'':domain,
			verifyClient: false,
			verify: function(c, verified, depth, certs) {
				try {
					console.log('TLS '+type+' '+domain+' verifying certificate w/CN: \"' +certs[0].subject.getField('CN').value +'\", verified: ' + verified + '...');
				} catch(ee) {
					console.log('TLS '+type+' '+domain+' certificate verified');
				}; //TODO - Bug(?) crashes with openssl certificates
				return true; //TODO - remove when caStore is populated
			  //return verified;
			},
			connected: function(c) {
				console.log('TLS '+type+' '+domain+' connected...');
				// send message to server
				setTimeout(function() {
					var txt=forge.util.encodeUtf8('Hello '+((type==='server')?'client':'server')+' I want 100 € ');
					c.prepare(txt);
				}, 1);
			},
			getCertificate: function(c, hint) {
				console.log(type+' '+domain+' getting certificate ...');
				return data.cert;
			},
			getPrivateKey: function(c, cert) {
				return data.privateKey;
			},
			tlsDataReady: function(c) {
				// send TLS data to server
				if (!forge_buffers) {
					var a=c.tlsData.data.slice(0,c.tlsData.length_);
					if (a.length) {
						if (a[0]!==0) { //Bug to investigate - empty buffer sent by client after handshake
							c.tlsData.clear();
							socket.write(a);
						};
					};
				} else {
					var tmp=c.tlsData.getBytes();
					if (_node) {
						socket.write(new Buffer(decode(tmp),'hex'));
					} else {
						socket.write(tmp);
					};
				};
			},
			dataReady: function(c) {
				if (!forge_buffers) {
					var response = c.data.data.toString('utf8');
					console.log(type+' '+domain+' received : '+response);
				} else {
					console.log(type+' '+domain+' received : '+forge.util.decodeUtf8(c.data.getBytes()));
				};
			},
			closed: function(c) {
				console.log(type+' '+domain+' disconnected.');
			},
			error: function(c, error) {
				console.log(type+' '+domain+' error: ' + error.message);
			}
		});
	};

	if (_node) {
		/* use openssl to generate server certificate or function above */
		var options={
			key: fs.readFileSync('../lib/server-key.pem'),
			cert: fs.readFileSync('../lib/server.pem')
		};

		var tlsserver=tls.createServer(options, function(socket) {
			socket.on('data', function(data) {
				var resp=data.toString('utf8');
				console.log('server received : '+resp);
				this.write(new Buffer('Hello client, you won 100 €','utf8'));
			});
		});

		tlsserver.listen(9000, function() {
			console.log("TLS server launched");
		});

		var client_tls=function(domain,port,host) {
			var client=new net.Socket();
			client.on('connect',function() {
				console.log('TCP Client connected - doing handshake');
				this.abstract_client_tls=abstract_tls(this,domain);
				this.abstract_client_tls.handshake();
			});
			client.on('data',function(data) {
				this.abstract_client_tls.process(data);
			});
			client.connect(port,host);
		};

		var server_tls=function(domain,port) {
			var server=net.createServer(function(socket) {
				socket.abstract_client_tls=abstract_tls(socket,domain,true);
				socket.on('data',function(data) {
					this.abstract_client_tls.process(data);
				});
			});
			server.listen(port, function() {
				console.log("TCP server launched");
			});
		};

		/* Tests between the abstract-tls client over a TCP connection connected to a node.js TLS server */
		client_tls('www.abcdefg.com',9000);
		/* Can be tested with a real site too : */
		//client_tls('gstatic.google.com',443,'74.125.230.207');

		/* Tests between the abstract-tls client over a TCP connection connected to an abstract-tls server over a TCP connection */
		server_tls('www.xyz.com',9001);
		client_tls('www.xyz.com',9001);
		
	} else {
		/* Tests between virtual client and virtual server */
		var tls={};
		tls.server=abstract_tls({write:function(data) {tls.client.process(data)}},'www.aeiouy.com',true);
		tls.client=abstract_tls({write:function(data) {tls.server.process(data)}},'www.aeiouy.com');
		tls.client.handshake();
		/*
		Modify code above to adapt to the transport layer that you want to use inside the browser (websocket for example)
		*/
		
		/* Performances on iterating the virtual client/server handshake
		
		buffer_size=1024
		
			- data_view false + forge_buffer true
			FF (Nightly) - 34 ops/s
			Chrome - 34 ops/s
			Node.js - 12 ops/s
			
			- data view false + forge_buffer false
			FF (Nightly) - 25 ops/s
			Chrome - 34 ops/s
			Node.js - 7 ops/s
			
			- data view true + forge_buffer false
			FF (Nightly) - 25 ops/s
			Chrome - 25 ops/s
			Node.js - 0.3 ops/s (!!!)
		
		buffer_size=0
			Results are globally 1.5 to 2 times slower
		
		*/
		
		
	};
})();