import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { createRequire } from 'node:module'
const source = await build({entryPoints:['src/store/cartStore.js'],bundle:true,platform:'node',format:'cjs',write:false})
const storage = new Map()
globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}
function newStore(){const module={exports:{}};new Function('module','exports','require',source.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));return module.exports.default}
const shopA={id:1,name:'Local A'},shopB={id:2,name:'Local B'}
const product=(id,price,stock=4)=>({id,price,stock_quantity:stock,is_available:true,service_type:'product',name:`Item ${id}`})
test('one basket retains two shops and accurate totals',()=>{
 storage.clear();const store=newStore();store.getState().addItem(product(1,100),shopA,2);store.getState().addItem(product(2,50),shopB)
 assert.equal(store.getState().items.length,2);assert.equal(store.getState().count(),3);assert.equal(store.getState().total(),250)
 store.getState().removeItem(1);assert.equal(store.getState().total(),50);assert.equal(store.getState().items[0].business.id,2)
})
test('unavailable listings and excessive quantities cannot be added',()=>{
 storage.clear();const store=newStore();assert.equal(store.getState().addItem(product(1,100,0),shopA).unavailable,true)
 store.getState().addItem(product(1,100,2),shopA,2);assert.equal(store.getState().addItem(product(1,100,2),shopA).unavailable,true)
 assert.equal(store.getState().addItem({...product(2,20),service_type:'booking'},shopB).unavailable,true)
 assert.equal(store.getState().count(),2)
})
test('previous single-shop baskets migrate without losing their contents',async()=>{
 storage.clear();storage.set('loxionmart-cart',JSON.stringify({state:{items:[{service:product(7,25),quantity:2}],businessId:9,businessName:'Existing Shop'},version:0}))
 const store=newStore();await store.persist.rehydrate();assert.equal(store.getState().items[0].business.name,'Existing Shop');assert.equal(store.getState().total(),50)
})
