import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../src/lib/auth/redirect.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {safeReturnPath}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
for(const value of [null,'','https://evil.test','//evil.test','/\\evil.test','/\nevil','/login','/auth/callback','/register?next=/feed']) assert.equal(safeReturnPath(value),'/discover',String(value));
for(const value of ['/passport','/rakija/123?from=passport','/feed#rating']) assert.equal(safeReturnPath(value),value);
console.log('PASS: default Discover, valid internal return paths, external redirects and auth loops rejected');
