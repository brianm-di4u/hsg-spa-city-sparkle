// Explicit hook/Storage fault fixtures; no earned-gameplay claims.
const KEY='spa-city-sparkle:v1';
const saved=(p)=>p.evaluate((k)=>JSON.parse(localStorage.getItem(k)),KEY);
const raw=(p)=>p.evaluate((k)=>localStorage.getItem(k),KEY);
async function tab(t){const p=await t.page.context().newPage();await p.goto(t.page.url());await p.waitForFunction(()=>!!window.__game);return p;}
async function game(t){await t.game('newGame',{level:'w1-01',seed:7,tips:false});await t.waitIdle();}
export const tests=[
{name:'stale actual Sound control preserves exact settled saved state and tutorial flags',async run(t){
 const b=await tab(t);await game(t);const legal=await t.game('act','legal');await t.game('act','swap',...legal[0]);await t.waitIdle(8000);const before=await saved(t.page),engine=await t.game('engineState');
 await b.locator('[data-act="settings"]').click();await b.locator('[data-toggle="sound"]').click();const after=await saved(b);
 t.equal(after.current,before.current,'opaque current preserved');t.equal(after.tutorialSeen,before.tutorialSeen,'tutorial flags preserved');t.equal(after.boosters,before.boosters,'wallet preserved');
 await t.reload();await t.waitIdle();await t.page.locator('[data-act="continue"]').click();await t.waitIdle();t.equal(await t.game('engineState'),engine,'real Continue restores exact state in labelled fixture');await t.shot('save-stale-preference-preserved');await b.close();
}},
{name:'known foreign slot rejects booster before any engine mutation even in test context',async run(t){
 await game(t);const b=await tab(t);await b.evaluate(()=>window.__game.newGame({level:'w1-02'}));const before=await t.game('engineState'),stored=await raw(b);
 const r=await t.game('act','booster','shuffle');t.equal(r.valid,false,'stale normal action refused');t.equal(await t.game('engineState'),before,'entire engine state unchanged');t.equal(await raw(t.page),stored,'foreign stored board unchanged');await t.shot('save-stale-booster-refused');await b.close();
}},
{name:'dependent forced fixture win and unpaid cost abandon together after foreign slot',async run(t){
 await game(t);await t.page.evaluate(()=>{const old=Storage.prototype.setItem;window.__restoreFixtureStorage=()=>{Storage.prototype.setItem=old;};Storage.prototype.setItem=function(k,v){if(k==='spa-city-sparkle:v1')throw Error('fixture blocked publication');return old.call(this,k,v);};});
 await t.game('act','booster','shuffle');await t.waitIdle(8000);const b=await tab(t);await b.evaluate(()=>window.__game.newGame({level:'w1-02'}));const foreign=await raw(b);await t.page.evaluate(()=>window.__restoreFixtureStorage());
 await t.game('scene','win','w1-01');await t.waitIdle();t.equal(await raw(t.page),foreign,'no dependent win or cost publishes over foreign slot');
 await t.game('newGame',{level:'w1-01'});await t.game('newGame',{level:'w1-01'});const after=await saved(t.page);t.equal(after.progress,{},'unpublished dependent reward discarded too');t.equal(after.boosters.shuffle,1,'unpublished debit not charged alone');await t.shot('save-dependent-pair-abandoned');await b.close();
}},
{name:'failed Sound write plus real Volume input retains explicit pending settings and effects',async run(t){
 await t.waitIdle();await t.page.locator('[data-act="settings"]').click();await t.page.evaluate(()=>{const old=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k==='spa-city-sparkle:v1'&&fail){fail=false;throw Error('fixture failed Sound');}return old.call(this,k,v);};});
 await t.page.locator('[data-toggle="sound"]').click();await t.page.locator('#vol').click();await t.page.keyboard.press('Home');for(let i=0;i<4;i++)await t.page.keyboard.press('ArrowRight');const after=await saved(t.page);
 t.equal(after.settings.sound,false,'pending sound persisted');t.equal(after.settings.volume,.2,'actual volume persisted');t.equal((await t.state()).settings.sound,false,'runtime remains muted');await t.page.locator('[data-motion="reduced"]').click();t.equal(await t.page.evaluate(()=>document.body.classList.contains('reduced')),true,'actual reduced DOM effect');await t.shot('save-pending-preferences-recovered');
}},
{name:'fixture failed onLose clear then actual plus5 keeps resumed board and visible unsaved notice',async run(t){
 await game(t);await t.page.evaluate(()=>{const old=Storage.prototype.setItem;window.__restoreFixtureStorage=()=>{Storage.prototype.setItem=old;};Storage.prototype.setItem=function(k,v){if(k==='spa-city-sparkle:v1')throw Error('fixture blocked settlement');return old.call(this,k,v);};});
 const legal=await t.game('act','legal');await t.game('act','swap',...legal[0]);await t.waitIdle(8000);t.equal(await t.page.locator('#toast').textContent(),'Progress is not saved yet. Keep this tab open; storage is unavailable.','actual existing toast shows unsaved status');
 await t.game('scene','lose');await t.page.locator('[data-act="plus"]').click();await t.waitIdle(8000);const resumed=await t.game('engineState');t.equal(resumed.phase,'play','engine resumed by actual plus5 button');await t.page.evaluate(()=>window.__restoreFixtureStorage());const next=await t.game('act','legal');await t.game('act','swap',...next[0]);await t.waitIdle(8000);const after=await saved(t.page);t.equal(after.current.state,await t.game('engineState'),'resumed exact board persists instead of stale terminal clear');t.equal(after.boosters.plus5,0,'one plus5 debit');await t.shot('save-lose-plus5-recovered');
}},

{name:'unrelated actual Sound success retains visible unsaved state for unpaid board until recovery',async run(t){
 await game(t);await t.page.evaluate(()=>{const old=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k==='spa-city-sparkle:v1'&&fail){fail=false;throw Error('fixture failed settlement');}return old.call(this,k,v);};});await t.game('act','booster','shuffle');await t.waitIdle(8000);await t.page.keyboard.press('KeyP');await t.page.locator('[data-act="settings"]').click();await t.page.locator('[data-toggle="sound"]').click();t.equal((await t.state()).storageOk,false,'preferences did not acknowledge unpaid board');t.expect((await t.page.locator('[role="dialog"]').innerText()).includes('Storage is unavailable'),'existing settings shows unsaved status');await t.shot('save-preference-success-still-unsaved');
}},

];
