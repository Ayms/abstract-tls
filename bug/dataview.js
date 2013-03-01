
var dvwLE=function(val,t,o) {
	var a=new DataView(t.buffer);
	a.setUint32(t.byteOffset+o,val,true);
};

var dvrLE=function(t,o) {
	var a=new DataView(t.buffer);
	return a.getUint32(t.byteOffset+o,true);
};

var newwLE=function(val,t,o) {
	if (val<0) {val=0xFFFFFFFF+1+val};
	var tmp=val.toString(16);
	while (tmp.length!==8) {tmp='0'+tmp};
	for (var i=7;i>=0;i=i-2) {
		t[o+(7-i)/2]=parseInt(tmp[i-1]+tmp[i],16);
	};
};

var newrLE=function(t,o) {
	var arr=[];
	for (var i=3;i>=0;i--) {
		var tmp=t[o+i].toString(16);
		arr.push(tmp.length===2?tmp:'0'+tmp)
	};
	return parseInt(arr.join(''),16);
};

var val=-1844613521;

var t=new Uint8Array(4);

var nt=new Uint8Array(4);

dvwLE(val,t,0);

console.log(t[0]+' '+t[1]+' '+t[2]+' '+t[3]);

newwLE(val,nt,0);

console.log(nt[0]+' '+nt[1]+' '+nt[2]+' '+nt[3]);

console.log(dvrLE(t,0));

console.log(newrLE(t,0));

var n=100000;

var t0=new Date().valueOf();

for (var i=0;i<n;i++) {
	dvwLE(val,t,0);
};

console.log(new Date().valueOf()-t0);

var t0=new Date().valueOf();

for (var i=0;i<n;i++) {
	newwLE(val,nt,0);
};

console.log(new Date().valueOf()-t0);

var t0=new Date().valueOf();

for (var i=0;i<n;i++) {
	dvrLE(t,0);
};

console.log(new Date().valueOf()-t0);

var t0=new Date().valueOf();

for (var i=0;i<n;i++) {
	newrLE(nt,0);
};

console.log(new Date().valueOf()-t0);

