// Run: node qa/logic-tests.cjs. All network and storage are isolated mocks.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const path = require('node:path');
const results = [];
function setup() {
  const storage = new Map(); const events = []; const requests = [];
  const context = vm.createContext({ console, process: { env: {} }, Event, Map, JSON,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) },
    window: { dispatchEvent: e => events.push(e.type) },
    fetch: async (...args) => { requests.push(args); return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({success: true}) }; }
  });
  const cache = {};
  function load(name) {
    if (cache[name]) return cache[name];
    const module = { exports: {} };
    const source = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib',name+'.ts'),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInContext('(function(require,module,exports){'+source+'\n})',context)((id) => { if(id==='./api') return load('api'); throw Error(id); },module,module.exports);
    return cache[name]=module.exports;
  }
  return {storage,context,events,requests,api:load('api'),cart:load('cart')};
}
async function test(name, fn) { try { await fn(setup()); results.push({name,status:'PASS'}); } catch(e) {results.push({name,status:'FAIL',detail:e.message});} }
const meta = {productId:10,productName:'QA product',price:'12.50',storeName:'QA store'};
(async()=>{
  await test('Empty guest cart',async({cart})=>assert.equal((await cart.fetchFullCart()).summary.total,'0.00'));
  await test('Add and increment same variant',async({cart})=>{await cart.addToCart(1,2,meta);await cart.addToCart(1,1,meta);assert.equal(cart.getGuestCart()[0].quantity,3);assert.equal((await cart.fetchFullCart()).summary.total,'37.50');});
  await test('Update quantity',async({cart})=>{await cart.addToCart(1,1,meta);await cart.updateCartItemQuantity(1,1,4);assert.equal((await cart.fetchFullCart()).summary.total,'50.00');});
  await test('Remove guest item',async({cart})=>{await cart.addToCart(1,1,meta);await cart.removeCartItem(1,1);assert.equal(cart.getGuestCart().length,0);});
  await test('Clear guest cart',async({cart})=>{await cart.addToCart(1,1,meta);await cart.clearAllCart();assert.equal(cart.getGuestCart().length,0);});
  await test('Count quantities',async({cart})=>{await cart.addToCart(1,3,meta);assert.equal(await cart.fetchCartCount(),3);});
  await test('Malformed JSON recovery',async({storage,cart})=>{storage.set('viora_guest_cart','{broken');assert.equal(cart.getGuestCart().length,0);});
  await test('Valid JSON wrong shape recovery',async({storage,cart})=>{storage.set('viora_guest_cart','{}');assert.equal(await cart.fetchCartCount(),0);});
  await test('Unique store IDs in guest cart',async({cart})=>{await cart.addToCart(1,1,meta);await cart.addToCart(2,1,{...meta,storeName:'Second store'});const c=await cart.fetchFullCart();assert.equal(new Set(c.stores.map(s=>s.id)).size,2);});
  await test('Reject negative guest quantity',async({cart})=>{const r=await cart.addToCart(1,-2,meta);assert.equal(r.success,false);});
  await test('Preserve guest cart when merge HTTP fails',async({cart,api,context,storage})=>{await cart.addToCart(1,1,meta);context.fetch=async()=>({ok:false,status:500,headers:{get:()=> 'application/json'},json:async()=>({message:'failure'})});await api.syncGuestCartOnLogin();assert.ok(storage.has('viora_guest_cart'),'Guest cart was deleted after failed merge');});
  await test('Preserve guest cart when merge network fails',async({cart,api,context,storage})=>{await cart.addToCart(1,1,meta);context.fetch=async()=>{throw Error('offline')};await api.syncGuestCartOnLogin();assert.ok(storage.has('viora_guest_cart'),'Guest cart was deleted after network failure');});
  await test('Clear guest cart after successful merge',async({cart,api,storage})=>{await cart.addToCart(1,1,meta);await api.syncGuestCartOnLogin();assert.equal(storage.has('viora_guest_cart'),false);});
  await test('API sends customer token',async({api,requests})=>{api.setCustomerToken('test-only');await api.apiFetch('/cart');assert.equal(requests[0][1].headers.Authorization,'Bearer test-only');});
  await test('API preserves explicit auth header',async({api,requests})=>{api.setCustomerToken('test-only');await api.apiFetch('/auth/verify-email',{headers:{Authorization:'Bearer pending-test'}});assert.equal(requests[0][1].headers.Authorization,'Bearer pending-test');});
  await test('API reports network failure',async({api,context})=>{context.fetch=async()=>{throw Error('offline')};assert.equal((await api.apiFetch('/cart')).success,false);});
  await test('Logout removes customer and pending credentials',async({api})=>{api.setCustomerToken('test');api.setPendingToken('pending');api.setCustomerUser({id:1});api.removeCustomerToken();assert.equal(api.getCustomerToken(),null);assert.equal(api.getPendingToken(),null);assert.equal(api.getCustomerUser(),null);});
  fs.writeFileSync(path.join(__dirname,'logic-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  console.log(`${results.filter(r=>r.status==='PASS').length}/${results.length} passed`);
  process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})();
