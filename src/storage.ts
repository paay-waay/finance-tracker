import {migrateV1,validateBook,type Book} from './model';
// Keep the V1 origin/database/store/key unchanged. Never erase data on service-worker updates.
const db=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('vewu-finance',1);r.onupgradeneeded=()=>r.result.createObjectStore('book');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('blocked'));});
export async function loadBook():Promise<Book|null> {
  const d=await db();return new Promise((resolve,reject)=>{
    const tx=d.transaction('book','readwrite'),store=tx.objectStore('book'),r=store.get('current');let result:Book|null=null,failure:unknown=null;
    r.onsuccess=()=>{try{
      if(r.result===undefined)return;
      const original=r.result;result=migrateV1(original);
      if(original.schema===1){
        const key=`v1-before-v2:${original.id}`,snapshot=store.get(key);
        snapshot.onsuccess=()=>{if(snapshot.result===undefined)store.put(structuredClone(original),key);store.put(result,'current');};
      }
    }catch(e){failure=e;tx.abort();}};
    tx.oncomplete=()=>{d.close();resolve(result);};
    tx.onabort=()=>{d.close();reject(failure||new Error('migration'));};
    tx.onerror=()=>{failure=failure||new Error('migration');};
  });
}
export async function saveBook(book:Book) {
  const valid=validateBook(book),d=await db();return new Promise<void>((resolve,reject)=>{
    const tx=d.transaction('book','readwrite');tx.objectStore('book').put(valid,'current');
    tx.oncomplete=()=>{d.close();resolve();};tx.onabort=()=>{d.close();reject(new Error('save'));};
  });
}
export async function replaceBook(book:Book) {
  const valid=validateBook(book),d=await db();return new Promise<void>((resolve,reject)=>{
    const tx=d.transaction('book','readwrite'),store=tx.objectStore('book'),r=store.get('current');
    r.onsuccess=()=>{if(r.result!==undefined)store.put(r.result,'before-csv-import');store.put(valid,'current');};
    tx.oncomplete=()=>{d.close();resolve();};tx.onabort=()=>{d.close();reject(new Error('save'));};
  });
}
