/* Bounded synchronous LZW transport for the host's16KiB state envelope. No external storage. */
function verifierPack(value) {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',bytes=unescape(encodeURIComponent(JSON.stringify(value))),dict=new Map();for(let i=0;i<256;i++)dict.set(String.fromCharCode(i),i);
  let word='',next=256,binary='';const emit=n=>{binary+=String.fromCharCode(n>>8,n&255);};
  for(const ch of bytes){const pair=word+ch;if(dict.has(pair))word=pair;else{emit(dict.get(word));if(next<65535)dict.set(pair,next++);word=ch;}}if(word)emit(dict.get(word));
  let output='';for(let i=0;i<binary.length;i+=3){const a=binary.charCodeAt(i),b=binary.charCodeAt(i+1),c=binary.charCodeAt(i+2);output+=alphabet[a>>2]+alphabet[((a&3)<<4)|(Number.isNaN(b)?0:b>>4)]+(Number.isNaN(b)?'=':alphabet[((b&15)<<2)|(Number.isNaN(c)?0:c>>6)])+(Number.isNaN(c)?'=':alphabet[c&63]);}return output;
}
function verifierUnpack(packed) {
  if(typeof packed!=='string'||packed.length>24000||!/^[A-Za-z0-9+/]*={0,2}$/.test(packed)||packed.length%4)throw Error('Invalid packed state');
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',dict=[];for(let i=0;i<256;i++)dict[i]=String.fromCharCode(i);
  let binary='';for(let i=0;i<packed.length;i+=4){const a=alphabet.indexOf(packed[i]),b=alphabet.indexOf(packed[i+1]),c=alphabet.indexOf(packed[i+2]),d=alphabet.indexOf(packed[i+3]);binary+=String.fromCharCode((a<<2)|(b>>4));if(c>=0)binary+=String.fromCharCode(((b&15)<<4)|(c>>2));if(d>=0)binary+=String.fromCharCode(((c&3)<<6)|d);}
  if(binary.length%2)throw Error('Invalid packed bytes');let previous='',output='',next=256;
  for(let i=0;i<binary.length;i+=2){const code=(binary.charCodeAt(i)<<8)|binary.charCodeAt(i+1),entry=dict[code]??(code===next?previous+previous[0]:null);if(entry==null)throw Error('Invalid packed code');output+=entry;if(output.length>1000000)throw Error('State too large');if(previous&&next<65535)dict[next++]=previous+entry[0];previous=entry;}
  return JSON.parse(decodeURIComponent(escape(output)));
}
