// Verify the foreground PNGs contain real transparent pixels, not an opaque paper rectangle.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
for(const name of ['bottle','branch','journal']){
 const file=readFileSync(new URL(`../public/images/login/${name}.png`,import.meta.url));
 let width,height,depth,color;const chunks=[];
 for(let at=8;at<file.length;){const size=file.readUInt32BE(at),type=file.toString('ascii',at+4,at+8),data=file.subarray(at+8,at+8+size);at+=size+12;if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];color=data[9];}if(type==='IDAT')chunks.push(data);}
 assert.equal(depth,8);assert.equal(color,6,`${name}: expected RGBA`);
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4;let previous=Buffer.alloc(stride),transparent=0,maximum=0,edgeMaximum=0;
 for(let y=0;y<height;y++){
  const offset=y*(stride+1),filter=raw[offset],row=Buffer.from(raw.subarray(offset+1,offset+1+stride));
  for(let x=0;x<stride;x++){const left=x>=4?row[x-4]:0,up=previous[x],diagonal=x>=4?previous[x-4]:0;const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,diagonal);row[x]=(row[x]+predictor)&255;}
  for(let x=0;x<width;x++){const alpha=row[x*4+3];if(alpha===0)transparent++;maximum=Math.max(maximum,alpha);if(x===0||x===width-1||y===0||y===height-1)edgeMaximum=Math.max(edgeMaximum,alpha);}
  previous=row;
 }
 assert.ok(transparent>width*height*.2,`${name}: insufficient actual transparency`);
 assert.ok(maximum>=250,`${name}: subject must remain solid`);
 assert.ok(edgeMaximum<=2,`${name}: visible canvas edge`);
 console.log(`PASS: ${name} — RGBA, ${(100*transparent/width/height).toFixed(1)}% fully transparent; canvas edge alpha ≤ ${edgeMaximum}/255`);
}
