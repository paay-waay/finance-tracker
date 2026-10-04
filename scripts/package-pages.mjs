import {cpSync,rmSync,mkdirSync} from 'node:fs';
// docs is generated deployment output; edit src, then rebuild.
rmSync(new URL('../docs/',import.meta.url),{recursive:true,force:true});
mkdirSync(new URL('../docs/',import.meta.url),{recursive:true});
cpSync(new URL('../dist/',import.meta.url),new URL('../docs/',import.meta.url),{recursive:true});
