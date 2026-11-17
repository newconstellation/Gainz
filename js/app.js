(function(){
'use strict';
var KEY='trainer-proto-v1';

/* ---------- helpers ---------- */
var $=function(s){return document.querySelector(s);};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return Math.random().toString(36).slice(2,9);}
function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function addDays(n){var d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return iso(d);}
function TODAY(){return addDays(0);}
function parseISO(s){var p=String(s).split('-').map(Number);return new Date(p[0],(p[1]||1)-1,p[2]||1,12);}
function dayDiff(s){return Math.round((parseISO(s)-parseISO(TODAY()))/864e5);}
function fmtDate(s){var d=dayDiff(s);if(d===0)return'Today';if(d===1)return'Tomorrow';if(d===-1)return'Yesterday';return parseISO(s).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
function fmtLc(s){var t=fmtDate(s);return /^(Today|Tomorrow|Yesterday)$/.test(t)?t.toLowerCase():t;}
function relDay(s){var d=dayDiff(s);if(d===0)return'Today';if(d===1)return'Tomorrow';if(d===-1)return'Yesterday';return parseISO(s).toLocaleDateString('en-US',{weekday:'long'});}
function shortDate(s){return parseISO(s).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function firstName(n){return String(n).trim().split(/\s+/)[0];}
function initials(n){return String(n).trim().split(/\s+/).map(function(p){return p[0]||'';}).slice(0,2).join('').toUpperCase();}
function num(v){var n=parseFloat(v);return isNaN(n)?null:n;}
function clean(n){return +(+n).toFixed(1);}
function fmtW(w){var n=num(w);return n===null?'':clean(n)+' lb';}
function plural(n,w){return n+' '+w+(n===1?'':'s');}

var ICON={
  plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
  check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 4.8a3.3 3.3 0 010 6.4M18 14.8c2 .6 3.2 2.3 3.5 5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  book:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="19" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="5" y="6" width="3.5" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15.5" y="6" width="3.5" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 12h7" stroke="currentColor" stroke-width="2.2"/></svg>',
  list:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 19.5h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 15.5l4.5-5 3.5 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  home:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="7.5" width="12" height="13.5" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 5V4.5A1.5 1.5 0 0014.5 3h-9A1.5 1.5 0 004 4.5v11A1.5 1.5 0 005.5 17H6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  chat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5a2 2 0 012-2h9a2 2 0 012 2v6a2 2 0 01-2 2H9.5l-4 3.5v-3.5a2 2 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19.5 9.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H19v2.5l-3.5-2.5h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  music:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5.5l11-2V16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.2a4.3 4.3 0 017.5 2.6C19.5 15.4 12 20 12 20z" stroke-width="2" stroke-linejoin="round"/></svg>',
  trash:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  timer:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13.5V9.5M9.5 2.5h5M18.5 6.5l1.5-1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

/* ---------- starter exercise library ---------- */
var GROUPS=['Chest','Back','Shoulders','Arms','Legs','Core','Full body','Cardio','Mobility'];
var DEFAULT_CATS=GROUPS.map(function(g){return {id:slug(g),name:g};});
var EQ_SPECIAL=window.GAINZ_LIBRARY.EQ_SPECIAL;
function defaultEquip(name,type,group){
  if(EQ_SPECIAL[name])return EQ_SPECIAL[name].slice();
  var n=String(name).toLowerCase(),out=[];
  function add(){for(var i=0;i<arguments.length;i++)if(out.indexOf(arguments[i])<0)out.push(arguments[i]);}
  if(type==='Barbell'){add('Barbell','Weight plates');if(/squat|overhead press|rack pull|good morning|bench press/.test(n))add('Squat rack');if(/bench press|incline bench|decline bench|hip thrust|skull/.test(n))add('Bench');}
  else if(type==='Dumbbell'){add('Dumbbells');if(/bench|incline|fly|chest-supported|seated|single-arm|concentration|bulgarian/.test(n))add('Bench');if(/step-up/.test(n))add('Box or bench');}
  else if(type==='Cable'){add('Cable machine');if(/face pull|pull-through|crunch|pushdown/.test(n))add('Rope attachment');}
  else if(type==='Machine'){var m=/machine$/.test(n)?name:name.replace(/^(lying|seated|standing|reverse) /i,'')+' machine';add(m.charAt(0).toUpperCase()+m.slice(1));}
  else if(type==='Kettlebell')add('Kettlebell');
  else if(type==='Bodyweight'&&(group==='Core'||/bridge/.test(n)))add('Mat');
  return out;
}
var NO_LOAD=['mat','pull-up bar','dip station','plyo box','bench','box or bench','anchor or partner','back extension bench','stability ball','bosu','trx suspension trainer','cones','agility ladder','hurdles','partner','partner or wall','dowel or empty barbell','sliders'];
function isBodyweight(e){if(e.equip==='Bodyweight')return true;var q=e.equipment||[];return q.every(function(x){return NO_LOAD.indexOf(String(x).toLowerCase())>-1;});}
function catIdOf(e){var id=e.cat||slug(e.group||''),g=0;while(S.catMerged&&S.catMerged[id]&&g++<20)id=S.catMerged[id];for(var i=0;i<S.cats.length;i++)if(S.cats[i].id===id)return id;return 'uncategorized';}
function catName(id){for(var i=0;i<S.cats.length;i++)if(S.cats[i].id===id)return S.cats[i].name;return 'Uncategorized';}
function equipText(e){return e.equipment&&e.equipment.length?e.equipment.join(', '):'No equipment';}
function exSub(e){return catName(catIdOf(e))+'. '+equipText(e);}
function liveLib(){return S.library.filter(function(e){return !e.deleted;});}
function normEx(e){if(!Array.isArray(e.equipment))e.equipment=defaultEquip(e.name,e.equip,e.group);if(!e.cat)e.cat=slug(e.group||'');return e;}
var LIB_TXT=window.GAINZ_LIBRARY.LIB_TXT;
var LIB_ACE=window.GAINZ_LIBRARY.LIB_ACE;

/* ---------- demo data ---------- */
function blankLog(n){var a=[];for(var i=0;i<n;i++)a.push({w:'',r:'',done:false});return a;}

/* ---------- state ---------- */
var S={ready:false,clients:[],workouts:[],templates:[],programs:[],posts:[],comments:[],likes:[],seen:{},library:[],cats:clone(DEFAULT_CATS),catMerged:{},trainer:{name:'Myra Gourley',first:'Myra'},role:'trainer',viewAs:'c-sarah',freeTimer:null},route,stack=[],draft=null,draft0='';
var ui={libQ:'',libG:'All',pickQ:'',pickG:'All',picked:0,tcfg:null,tctx:null,pendingNav:null};
var PREF_KEY='trainer-proto-prefs',MODE='loading',DB=null,readOnly=false,overrides={},got={};
function clone(x){return x?JSON.parse(JSON.stringify(x)):null;}
function builtinLib(){return (LIB_TXT+'\n'+LIB_ACE).split('\n').map(function(l){var p=l.split('|');return {id:slug(p[1]),name:p[1],group:p[0],cat:slug(p[0]),equip:p[2],equipment:p.length>3?(p[3]?p[3].split(';'):[]):defaultEquip(p[1],p[2],p[0]),video:'',custom:false,deleted:false};});}
function ensureCats(){DEFAULT_CATS.forEach(function(d){if(!S.cats.some(function(c){return c.id===d.id;})&&!(S.catMerged&&S.catMerged[d.id]))S.cats.push(clone(d));});}
function setTrainer(name){name=name||'Myra Gourley';S.trainer={name:name,first:firstName(name)};}
function loadPrefs(){try{var p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');if(p.role==='client'||p.role==='trainer')S.role=p.role;if(p.viewAs)S.viewAs=p.viewAs;if(p.freeTimer)S.freeTimer=p.freeTimer;if(p.seen)S.seen=p.seen;}catch(e){}}
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify({role:S.role,viewAs:S.viewAs,freeTimer:S.freeTimer,seen:S.seen}));}catch(e){}}

/* shared storage: every device that opens this page sees the same clients and workouts */
/* ---------- hosted mode: Supabase sign-in ---------- */
var CLOUD=window.GainzCloud||null,HOSTED=!!(CLOUD&&CLOUD.auth.enabled),ACCOUNT=null,authUi={email:'',sent:false,busy:false,err:''};
function initCloud(){
  if(!CLOUD.auth.ready){MODE='error';authUi.err='The sign-in service didn\u2019t load. Check your connection and reload.';render();return;}
  try{var q=new URLSearchParams(location.search);if(q.get('email'))authUi.email=q.get('email');}catch(e){}
  var started=false;
  function go2(sess){
    if(started)return;
    if(!sess){MODE='signin';render();return;}
    started=true;MODE='loading';render();
    CLOUD.auth.whoami().then(function(m){
      ACCOUNT={email:m.email||sess.user.email,role:m.role,clientId:m.client_id};
      if(m.role!=='trainer'&&m.role!=='client'){MODE='nomember';render();return;}
      S.role=m.role;if(m.role==='client')S.viewAs=m.client_id;
      try{if(location.search)history.replaceState(null,'',location.pathname+location.hash);}catch(e){}
      route=homeRoute();stack=[];
      startDb(CLOUD.openDb());
    },function(){started=false;MODE='error';authUi.err='Couldn\u2019t check your account. Reload to try again.';render();});
  }
  CLOUD.auth.onChange(function(ev,sess){if(ev==='SIGNED_OUT'){location.replace(location.pathname);return;}if(sess)go2(sess);});
  CLOUD.auth.session().then(go2,function(){MODE='signin';render();});
}
function authScreen(){
  var h='<div class="auth"><div class="auth-brand"><b>Gainz</b><span>Workout Tracker</span></div>';
  if(MODE==='signin'){
    if(authUi.sent)h+='<h1>Check your email</h1><p class="lede">We sent a sign-in link to <b>'+esc(authUi.email)+'</b>. Open it on this device, or type the 6-digit code from the email.</p>'+
      '<label class="field"><span>Code</span><input id="au-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></label>'+
      (authUi.err?'<p class="err">'+esc(authUi.err)+'</p>':'')+
      '<button class="btn btn-primary btn-block" data-act="authCode"'+(authUi.busy?' disabled':'')+'>Sign in with code</button>'+
      '<button class="btn-link" data-act="authBack">Use a different email</button>';
    else h+='<h1>Sign in</h1><p class="lede">Enter the email your trainer has for you. We\u2019ll email you a sign-in link. No password needed.</p>'+
      '<label class="field"><span>Email</span><input id="au-email" type="email" autocomplete="email" inputmode="email" maxlength="254" value="'+esc(authUi.email)+'" placeholder="you@example.com"></label>'+
      (authUi.err?'<p class="err">'+esc(authUi.err)+'</p>':'')+
      '<button class="btn btn-primary btn-block" data-act="authSend"'+(authUi.busy?' disabled':'')+'>Email me a sign-in link</button>';
  }else if(MODE==='nomember'){
    h+='<h1>Almost there</h1><p class="lede">You\u2019re signed in as <b>'+esc(ACCOUNT&&ACCOUNT.email)+'</b>, but this email isn\u2019t linked to a client yet. Ask your trainer to add this exact email to your client profile, then reload this page.</p>'+
      '<button class="btn btn-primary btn-block" data-act="authReload">Reload</button><button class="btn btn-block" data-act="signOut">Sign out</button>';
  }else if(MODE==='error'){
    h+='<h1>Something went wrong</h1><p class="lede">'+esc(authUi.err)+'</p><button class="btn btn-primary btn-block" data-act="authReload">Reload</button>';
  }else h+='<p class="lede">Loading\u2026</p>';
  return h+'</div>';
}
function initStore(){
  if(HOSTED){initCloud();return;}
  var p=null;
  try{if(window.claude&&typeof window.claude.use==='function')p=window.claude.use('db');}catch(e){p=null;}
  if(!p){startLocal();return;}
  Promise.resolve(p).then(function(db){if(db)startDb(db);else startLocal();},function(){startLocal();});
}
function startLocal(){
  MODE='local';
  try{var d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&d.workouts){S.clients=d.clients||[];S.workouts=d.workouts||[];S.templates=d.templates||[];S.programs=d.programs||[];S.posts=d.posts||[];S.comments=d.comments||[];S.likes=d.likes||[];S.library=d.library||[];if(Array.isArray(d.cats)&&d.cats.length)S.cats=d.cats;S.catMerged=d.catMerged||{};ensureCats();}}catch(e){}
  if(!S.library.length)S.library=builtinLib();S.library.forEach(normEx);
  setTrainer('Myra Gourley');S.ready=true;render();
}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify({version:1,clients:S.clients,workouts:S.workouts,templates:S.templates,programs:S.programs,posts:S.posts,comments:S.comments,likes:S.likes,library:S.library,cats:S.cats,catMerged:S.catMerged}));}catch(e){}}
function docsOf(snap){return snap.docs.map(function(d){var x=clone(d.data())||{};x.id=d.id;return x;});}
function rebuildLib(){
  var lib=builtinLib(),idx={};lib.forEach(function(e){idx[e.id]=e;});
  Object.keys(overrides).forEach(function(id){
    var o=overrides[id],e=idx[id];
    if(!e){e={id:id,name:o.name||'Exercise',group:o.group||'',cat:'',equip:o.equip||'',equipment:null,video:'',custom:true,deleted:false};lib.push(e);}
    if(typeof o.name==='string'&&o.name)e.name=o.name;
    if(typeof o.cat==='string'&&o.cat)e.cat=o.cat;else if(!e.cat&&o.group)e.cat=slug(o.group);
    if(Array.isArray(o.equipment))e.equipment=o.equipment.slice();
    if(typeof o.video==='string')e.video=o.video;
    e.deleted=!!o.deleted;normEx(e);
  });
  S.library=lib;
}
function normW(w){w.items=w.items||[];w.items.forEach(function(it){if(!it.log)it.log=blankLog(it.sets||1);});return w;}
function dbErr(e){if(e&&e.code==='revoked')toast('Access to this page changed. Reload it to keep going.');else if(HOSTED&&!S.ready&&MODE!=='error'){MODE='error';authUi.err='Couldn\u2019t load your workouts. Check your connection and reload.';render();}}
function onData(){if(!(got.clients&&got.workouts&&got.templates&&got.exercises&&got.settings&&got.library&&got.posts&&got.comments&&got.likes&&got.programs))return;if(!S.ready){S.ready=true;render();return;}requestRender();}
function startDb(db){
  DB=db;MODE='db';
  db.collection('clients').onSnapshot(function(sn){S.clients=docsOf(sn).sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});got.clients=true;onData();},dbErr);
  db.collection('programs').onSnapshot(function(sn){S.programs=docsOf(sn).sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});got.programs=true;onData();},dbErr);
  db.collection('posts').onSnapshot(function(sn){S.posts=docsOf(sn);got.posts=true;onData();},dbErr);
  db.collection('comments').onSnapshot(function(sn){S.comments=docsOf(sn);got.comments=true;onData();},dbErr);
  db.collection('likes').onSnapshot(function(sn){S.likes=docsOf(sn);got.likes=true;onData();},dbErr);
  db.collection('templates').onSnapshot(function(sn){S.templates=docsOf(sn).sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});got.templates=true;onData();},dbErr);
  db.collection('workouts').onSnapshot(function(sn){S.workouts=docsOf(sn).map(normW);got.workouts=true;onData();},dbErr);
  db.collection('exercises').onSnapshot(function(sn){overrides={};sn.docs.forEach(function(d){overrides[d.id]=clone(d.data())||{};});rebuildLib();got.exercises=true;onData();},dbErr);
  db.doc('settings/library').onSnapshot(function(d){var x=d.exists?d.data():null;S.cats=x&&Array.isArray(x.categories)&&x.categories.length?clone(x.categories):clone(DEFAULT_CATS);S.catMerged=x&&x.merged?clone(x.merged):{};ensureCats();got.library=true;onData();},dbErr);
  db.doc('settings/trainer').onSnapshot(function(d){var x=d.exists?d.data():null;setTrainer(x&&x.name);got.settings=true;onData();},dbErr);
}
var inflight={},again={};
function writeDoc(path,getBody,retried){
  if(MODE!=='db'){saveLocal();return;}
  if(readOnly)return;
  if(inflight[path]){again[path]=getBody;return;}
  inflight[path]=true;
  var body=getBody(),pr;
  try{pr=body===null?DB.doc(path).delete():DB.doc(path).set(body);}catch(e){pr=Promise.reject({code:'invalid_argument'});}
  function fin(){inflight[path]=false;var g=again[path];if(g){delete again[path];writeDoc(path,g);}}
  pr.then(fin,function(e){
    var code=e&&e.code;
    if(code==='unavailable'&&!retried){inflight[path]=false;setTimeout(function(){var g=again[path]||getBody;delete again[path];writeDoc(path,g,true);},600+Math.random()*800);return;}
    if(code==='invalid_argument'){readOnly=true;toast('You have view-only access, so changes won\u2019t be saved.');}
    else if(code==='permission_denied')toast('You don\u2019t have permission to change that.');
    else if(code==='rejected')toast('That change couldn\u2019t be saved because something in it isn\u2019t valid.');
    else toast('That change didn\u2019t save. Check your connection and try again.');
    fin();
  });
}
function persistW(id){writeDoc('workouts/'+id,function(){var w=workout(id);if(!w)return null;var b=clone(w);delete b.id;return b;});}
function removeW(id){writeDoc('workouts/'+id,function(){return null;});}
function persistC(id){writeDoc('clients/'+id,function(){var c=client(id);if(!c)return null;var b=clone(c);delete b.id;return b;});}
function persistEx(id){writeDoc('exercises/'+id,function(){var e=ex(id),c=catIdOf(e);return {name:e.name,cat:c==='uncategorized'?(e.cat||''):c,equipment:(e.equipment||[]).slice(),video:e.video||'',custom:!!e.custom,deleted:!!e.deleted};});}
function tplOf(id){for(var i=0;i<S.templates.length;i++)if(S.templates[i].id===id)return S.templates[i];return null;}
function persistT(id){writeDoc('templates/'+id,function(){var t=tplOf(id);if(!t)return null;var b=clone(t);delete b.id;return b;});}
function removeT(id){writeDoc('templates/'+id,function(){return null;});}
function persistLib(){writeDoc('settings/library',function(){return {categories:clone(S.cats),merged:clone(S.catMerged)||{}};});}
function findIn(arr,id){for(var i=0;i<arr.length;i++)if(arr[i].id===id)return arr[i];return null;}
function persistIn(col,arr,id){writeDoc(col+'/'+id,function(){var x=findIn(arr(),id);if(!x)return null;var b=clone(x);delete b.id;return b;});}
function removeDoc(col,id){writeDoc(col+'/'+id,function(){return null;});}
var DESKQ=window.matchMedia?window.matchMedia('(min-width: 960px)'):null;
function isDesk(){return !!(DESKQ&&DESKQ.matches);}
if(DESKQ){var onDesk=function(){if(MUSIC)document.documentElement.style.setProperty('--mh',isDesk()?'0px':(MUSIC.h+46)+'px');if(S.ready&&!typing())render();};if(DESKQ.addEventListener)DESKQ.addEventListener('change',onDesk);else if(DESKQ.addListener)DESKQ.addListener(onDesk);}
var renderPending=false;
function typing(){var a=document.activeElement;return !!(a&&a!==document.body&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&$('#main').contains(a));}
function requestRender(){if(typing()){renderPending=true;return;}render();}

function ex(id){for(var i=0;i<S.library.length;i++)if(S.library[i].id===id)return S.library[i];return {id:id,name:'Unknown exercise',group:'',equip:'',video:''};}
function client(id){for(var i=0;i<S.clients.length;i++)if(S.clients[i].id===id)return S.clients[i];return null;}
function workout(id){for(var i=0;i<S.workouts.length;i++)if(S.workouts[i].id===id)return S.workouts[i];return null;}
function wsFor(cid){return S.workouts.filter(function(w){return w.clientId===cid;});}
function byDate(a,b){return a.date.localeCompare(b.date);}
function upcoming(cid){return wsFor(cid).filter(function(w){return w.status==='assigned'&&!w.programId;}).sort(byDate);}
function missed(){return [];}
function started(w){return w.status==='assigned'&&w.items.some(function(it){return it.log.some(function(s){return s.done;});});}
function completed(cid){return wsFor(cid).filter(function(w){return w.status==='completed';}).sort(function(a,b){return b.date.localeCompare(a.date)||((b.completedAt||0)-(a.completedAt||0));});}

function bestSet(it){var best=null,u=it.unit==='time'?'time':'';it.log.forEach(function(s){if(!s.done)return;var w=num(s.w)||0,r=parseInt(s.r,10)||0;if(!w&&!r)return;if(!best||w>best.w||(w===best.w&&r>best.r))best={w:w,r:r,u:u};});return best;}
function fmtT(x){x=+x||0;if(x<60)return x+' sec';if(x%60===0)return (x/60)+' min';return mmss(x)+' min';}
function setShort(b){if(b.u==='time')return (b.w>0?clean(b.w)+' × ':'')+fmtT(b.r);return b.w>0?clean(b.w)+' × '+b.r:b.r+' reps';}
function setLong(b){if(b.u==='time')return (b.w>0?clean(b.w)+' lb × ':'')+fmtT(b.r);return b.w>0?clean(b.w)+' lb × '+b.r:b.r+' reps';}
function history(cid,exId){
  var out=[];
  wsFor(cid).filter(function(w){return w.status==='completed';}).sort(function(a,b){return a.date.localeCompare(b.date)||((a.completedAt||0)-(b.completedAt||0));})
    .forEach(function(w){w.items.forEach(function(it){if(it.exId!==exId)return;var b=bestSet(it);if(b)out.push({w:w,item:it,best:b});});});
  return out;
}
function lastBest(cid,exId,excludeId){var h=history(cid,exId).filter(function(x){return x.w.id!==excludeId;});return h.length?h[h.length-1]:null;}
function before(a,b){return a.date<b.date||(a.date===b.date&&(a.completedAt||0)<(b.completedAt||0));}
function prsIn(w){
  var res=[];
  w.items.forEach(function(it){
    var b=bestSet(it);if(!b||b.w<=0)return;
    var max=0,had=false;
    S.workouts.forEach(function(p){if(p.clientId!==w.clientId||p.status!=='completed'||p.id===w.id||!before(p,w))return;
      p.items.forEach(function(pi){if(pi.exId!==it.exId)return;var pb=bestSet(pi);if(pb){had=true;max=Math.max(max,pb.w);}});});
    if(had&&b.w>max&&!res.some(function(r){return r.exId===it.exId;}))res.push({exId:it.exId,w:b.w,r:b.r,u:b.u});
  });
  return res;
}
function targetText(it){var e=ex(it.exId),w=fmtW(it.weight),cat=catIdOf(e);return {main:it.sets+' × '+(it.unit==='time'?fmtT(it.reps):esc(it.reps)),sub:w?'at '+w:((cat==='mobility'||cat==='cardio'||it.timer||bandOnly(e))?'':isBodyweight(e)?'bodyweight':'weight your choice')};}
function getItem(el){var w=workout(el.dataset.w);if(!w)return [null,null];var it=null;w.items.forEach(function(x){if(x.id===el.dataset.it)it=x;});return [w,it];}

/* ---------- video ---------- */
function videoEmbed(url){
  if(!url)return null;var m;
  if((m=url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)))
    return {src:'https://www.youtube-nocookie.com/embed/'+m[1]+'?rel=0&playsinline=1',host:'YouTube',open:'https://www.youtube.com/watch?v='+m[1]};
  if((m=url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]{6,}))?/i)))
    return {src:'https://player.vimeo.com/video/'+m[1]+(m[2]?'?h='+m[2]:''),host:'Vimeo',open:url};
  return null;
}

/* ---------- navigation ---------- */
function homeRoute(){return S.role==='trainer'?{name:'dashboard',params:{}}:{name:'home',params:{}};}
function go(name,params){stopRest();stack.push(route);route={name:name,params:params||{}};render();window.scrollTo(0,0);}
function back(){stopRest();route=stack.pop()||homeRoute();render();window.scrollTo(0,0);}
function tab(name){stopRest();stack=[];route={name:name,params:{}};render();window.scrollTo(0,0);}
function backBtn(){return '<button class="back" data-act="back">'+ICON.back+'Back</button>';}

/* ---------- sheets, toast, rest timer ---------- */
function openSheet(html,opts){opts=opts||{};var tt=$('#toast');if(tt)tt.classList.remove('show');var r=$('#sheet-root');r.innerHTML='<div class="scrim" data-act="'+(opts.onClose||'closeSheet')+'"></div><div class="sheet'+(opts.tall?' tall':'')+'" role="dialog" aria-modal="true">'+html+'</div>';r.className='open';}
function closeSheet(){var r=$('#sheet-root');r.innerHTML='';r.className='';render();}
var toastT;
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show');},2600);}
var rest={end:0,id:null,cid:null};
function restOn(cid){var c=client(cid);return !c||c.restTimer!==false;}
function startRest(sec,cid){rest.cid=cid||null;rest.end=Date.now()+sec*1000;clearInterval(rest.id);rest.id=setInterval(tick,250);tick();}
function tick(){var el=$('#rest');var left=Math.ceil((rest.end-Date.now())/1000);if(left<=0){stopRest();toast('Rest is up. Ready for the next set.');return;}el.hidden=false;el.querySelector('.rest-t').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');}
function stopRest(){clearInterval(rest.id);rest.id=null;var el=$('#rest');if(el)el.hidden=true;}

/* ---------- shared pieces ---------- */
function empty(title,text,action){return '<div class="empty"><h2>'+title+'</h2><p>'+text+'</p>'+(action||'')+'</div>';}
function workoutRow(w){
  var d=parseISO(w.date),tag='';
  if(w.status==='completed'){var n=prsIn(w).length;tag=(S.role==='trainer'&&w.trainerSeen===false)?'<span class="tag acc">New</span>':n?'<span class="tag pr">'+n+' PR'+(n>1?'s':'')+'</span>':'<span class="tag ok">Done</span>';}
  else if(w.date===TODAY())tag='<span class="tag acc">Today</span>';
  var started=w.status==='assigned'&&w.items.some(function(it){return it.log.some(function(s){return s.done;});});
  return '<button class="row" data-act="openWorkout" data-id="'+w.id+'"><span class="dblock"><b>'+d.getDate()+'</b><small>'+d.toLocaleDateString('en-US',{month:'short'})+'</small></span><span class="row-main"><span class="row-title">'+esc(w.title)+'</span><span class="row-sub">'+(w.programTitle?esc(w.programTitle)+', ':'')+relDay(w.date)+', '+plural(w.items.length,'exercise')+(started?', in progress':'')+'</span></span>'+tag+'</button>';
}
function chips(active,act){
  var o=[['All','All']].concat(S.cats.map(function(c){return [c.id,c.name];}));
  if(liveLib().some(function(e){return catIdOf(e)==='uncategorized';}))o.push(['uncategorized','Uncategorized']);
  if(act==='libGroup')o.push(['Custom','Added by you']);
  return o.map(function(g){return '<button class="chip'+(g[0]===active?' on':'')+'" data-act="'+act+'" data-g="'+esc(g[0])+'">'+esc(g[1])+'</button>';}).join('');
}
function normQ(x){return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function stemW(w){return w.length>3?w.replace(/(ies)$/,'y').replace(/(sses)$/,'ss').replace(/([^s])s$/,'$1'):w;}
function searchText(e){var t=normQ([e.name,catName(catIdOf(e)),(e.equipment||[]).join(' '),e.equip||'',e.custom?'custom added by you':''].join(' ')).split(' ').map(stemW).join(' ');return {sp:' '+t+' ',cp:t.replace(/ /g,'')};}
function matchQ(e,toks){if(!toks.length)return 3;var h=searchText(e),nm=' '+normQ(e.name).split(' ').map(stemW).join(' ')+' ';
  for(var i=0;i<toks.length;i++){var t=toks[i];if(h.sp.indexOf(' '+t)<0&&h.cp.indexOf(t)<0)return 0;}
  var inName=toks.every(function(t){return nm.indexOf(' '+t)>-1;});return inName?(nm.indexOf(' '+toks[0])===0?3:2):1;}
function filterLib(q,g){var toks=normQ(q).split(' ').filter(Boolean).map(stemW);
  var out=[];liveLib().forEach(function(e,i){if(g==='Custom'&&!e.custom)return;if(g!=='All'&&g!=='Custom'&&catIdOf(e)!==g)return;var sc=matchQ(e,toks);if(sc)out.push({e:e,s:sc,i:i});});
  out.sort(function(a,b){return b.s-a.s||a.i-b.i;});return out.map(function(x){return x.e;});}
function noMatch(q,g,act,other){
  var inAll=g!=='All'&&q.trim()&&filterLib(q,'All').length;
  return '<div class="row"><span class="row-main"><span class="row-sub">'+(inAll?'No matches in this category.':'No matches for “'+esc(q.trim())+'”. Try a name, muscle group, or piece of equipment'+other+'.')+'</span>'+(inAll?'<button class="btn-link" data-act="'+act+'" data-g="All" style="align-self:flex-start">Show '+(function(n){return n===1?'1 match':n+' matches';})(filterLib(q,'All').length)+' in all categories</button>':'')+'</span></div>';
}

/* ---------- trainer: clients ---------- */
function clientStatus(c){
  var open=upcoming(c.id),dn=completed(c.id),progs=activeProgs(c.id),st;
  var recentPR=dn.filter(function(w){return w.date>=addDays(-7);}).some(function(w){return prsIn(w).length>0;});
  var inProg=wsFor(c.id).filter(started)[0],todayW=open.filter(function(w){return w.date===TODAY();})[0],nextW=open.filter(function(w){return w.date>=TODAY();})[0]||open[0];
  if(inProg)st={text:'In progress: '+inProg.title};
  else if(dn[0]&&dn[0].date===TODAY())st={text:'Finished '+dn[0].title+' today',cls:'ok'};
  else if(todayW)st={text:'Today: '+todayW.title};
  else if(progs.length){var ps=progStats(progs[0]);st={text:progs[0].title+': '+ps.done+' of '+ps.total+' sessions done'};}
  else if(nextW)st={text:'Next: '+nextW.title+(nextW.date>=TODAY()?', '+fmtLc(nextW.date):'')};
  else if(!wsFor(c.id).length)st={text:'Invited, no workouts yet'};
  else st={text:'Nothing scheduled'};
  var unseen=dn.some(function(w){return w.trainerSeen===false;});
  st.badge=unseen?'<span class="tag acc">New results</span>':recentPR?'<span class="tag pr">New PR</span>':'';
  return st;
}
function vClients(p){p=p||{};
  var wkAgo=addDays(-7),fin=0;
  S.workouts.forEach(function(w){if(w.status==='completed'&&w.date>=wkAgo&&client(w.clientId))fin++;});
  var summary='In the last 7 days your clients finished '+plural(fin,'workout')+'.';
  var fresh=S.workouts.filter(function(w){return w.status==='completed'&&w.trainerSeen===false&&client(w.clientId);}).sort(function(a,b){return (b.completedAt||0)-(a.completedAt||0);});
  var review=fresh.length?'<h3>New results</h3><div class="list review">'+fresh.map(function(w){var c=client(w.clientId),n=prsIn(w).length;
    var sub='Finished '+fmtLc(w.date)+(n?', '+n+' PR'+(n>1?'s':''):'')+(w.effort?', felt '+w.effort.toLowerCase():'')+(w.clientSummary?'. \u201c'+w.clientSummary.slice(0,70)+(w.clientSummary.length>70?'\u2026':'')+'\u201d':'');
    return '<button class="row" data-act="openWorkout" data-id="'+w.id+'"><span class="avatar" aria-hidden="true">'+esc(initials(c.name))+'</span><span class="row-main"><span class="row-title">'+esc(c.name)+': '+esc(w.title)+'</span><span class="row-sub">'+esc(sub)+'</span></span><span class="tag acc">New</span></button>';}).join('')+'</div><h3>All clients</h3>':'';
  var rows=S.clients.map(function(c){var st=clientStatus(c);return '<button class="row" data-act="openClient" data-id="'+c.id+'"><span class="avatar" aria-hidden="true">'+esc(initials(c.name))+'</span><span class="row-main"><span class="row-title">'+esc(c.name)+'</span><span class="row-sub '+(st.cls||'')+'">'+esc(st.text)+'</span></span>'+st.badge+'</button>';}).join('');
  if(isDesk()&&S.clients.length){
    var sc=client(p.sel)||S.clients[0];p.sel=sc.id;
    var drows=S.clients.map(function(c){var st=clientStatus(c);return '<button class="row'+(c.id===sc.id?' sel':'')+'" data-act="openClient" data-id="'+c.id+'"'+(c.id===sc.id?' aria-current="true"':'')+'><span class="avatar" aria-hidden="true">'+esc(initials(c.name))+'</span><span class="row-main"><span class="row-title">'+esc(c.name)+'</span><span class="row-sub '+(st.cls||'')+'">'+esc(st.text)+'</span></span>'+st.badge+'</button>';}).join('');
    return '<div class="split"><div class="split-list"><div class="page-head"><h1>Clients</h1><button class="btn sm" data-act="addClient">'+ICON.plus+'Add client</button></div><p class="lede" style="margin:-4px 0 16px">'+summary+'</p><div class="list">'+drows+'</div></div><div class="split-main">'+clientPanel(sc,p,false)+'</div></div>';
  }
  return '<div class="page-head"><h1>Clients</h1><button class="btn sm" data-act="addClient">'+ICON.plus+'Add client</button></div>'+(S.clients.length?'<p class="lede" style="margin:-4px 0 16px">'+summary+'</p><div class="list">'+rows+'</div>':empty('No clients yet','Add your first client to start building workouts.'));
}
function vClient(p){
  var c=client(p.id);if(!c)return backBtn()+empty('Client not found','They may have been removed.');
  return clientPanel(c,p,true);
}
function clientPanel(c,p,withBack){
  var sub=p.sub||'plan';
  var head=(withBack?backBtn():'')+'<div class="page-head"><div><h1>'+esc(c.name)+'</h1>'+(c.goal?'<p class="lede">'+esc(c.goal)+'</p>':'')+'</div></div>'+
    '<div class="home-msg"><div><b>Motivation on '+esc(firstName(c.name))+'\u2019s home screen</b><p>'+(c.motivation?'\u201c'+esc(c.motivation)+'\u201d':'<span class="muted">None yet. Add a line '+esc(firstName(c.name))+' sees under their name.</span>')+'</p>'+(c.playlist&&musicInfo(c.playlist)?'<p class="muted">Workout music: '+esc(musicInfo(c.playlist).host)+(c.playlistBy==='trainer'?', picked by you':', picked by '+esc(firstName(c.name)))+'</p>':'')+'</div><button class="btn sm" data-act="editHome" data-id="'+c.id+'">Edit</button></div>'+
    '<div class="actions"><button class="btn btn-primary" data-act="newWorkout" data-id="'+c.id+'">'+ICON.plus+'New workout</button><button class="btn" data-act="newProgram" data-id="'+c.id+'">'+ICON.plus+'New program</button><button class="btn" data-act="setMax" data-c="'+c.id+'">1-rep max</button><button class="btn" data-act="invite" data-id="'+c.id+'">Invite link</button></div>'+
    '<div class="seg" role="tablist"><button role="tab" aria-selected="'+(sub==='plan')+'" class="'+(sub==='plan'?'on':'')+'" data-act="clientSub" data-sub="plan">Workouts</button><button role="tab" aria-selected="'+(sub==='progress')+'" class="'+(sub==='progress'?'on':'')+'" data-act="clientSub" data-sub="progress">Gainz</button></div>';
  return head+(sub==='plan'?planList(c):progressView(c.id,p));
}
function planList(c){
  var up=upcoming(c.id),d=completed(c.id),progs=S.programs.filter(function(p){return p.clientId===c.id&&!p.isTemplate;});
  if(!progs.length&&!up.length&&!d.length)return empty('No workouts yet','Build '+esc(firstName(c.name))+'\u2019s first workout or multi-week program, then send the invite link so they can open it on their phone.','<div class="actions" style="justify-content:center"><button class="btn btn-primary" data-act="newWorkout" data-id="'+c.id+'">New workout</button><button class="btn" data-act="newProgram" data-id="'+c.id+'">New program</button></div>');
  var h='';
  if(progs.length)h+='<h3>Programs</h3>'+progs.map(programGrid).join('');
  h+='<h3>Single workouts</h3>'+(up.length?'<div class="list">'+up.map(workoutRow).join('')+'</div>':'<p class="muted">None to do. Tap New workout to add one.</p>');
  if(d.length)h+='<h3>Completed</h3><div class="list">'+d.map(workoutRow).join('')+'</div>';
  return h;
}

/* ---------- workout detail ---------- */
function vWorkout(p){return '<div class="narrow">'+vWorkoutBody(p)+'</div>';}
function vWorkoutBody(p){
  var w=workout(p.id);if(!w)return backBtn()+empty('Workout not found','It may have been deleted.');
  var c=client(w.clientId),isT=S.role==='trainer';
  if(w.status==='completed')return completedDetail(w,c,isT);
  var started=w.items.some(function(it){return it.log.some(function(s){return s.done;});});
  var items=w.items.map(function(it,i){var e=ex(it.exId),t=targetText(it);
    return '<div class="plan-item"><span class="b-n">'+(i+1)+'</span><div class="plan-main"><div class="plan-top"><b>'+esc(e.name)+'</b>'+
      (e.video?'<button class="tag vid" data-act="video" data-ex="'+e.id+'">'+ICON.play+'Video</button>':'<button class="tag add" data-act="editEx" data-ex="'+e.id+'">Add video</button>')+
      '</div><span class="plan-target">'+t.main+' '+t.sub+(wType(it.type)?'. '+wType(it.type).name+', aim for RPE '+wType(it.type).rpe:'')+(e.equipment&&e.equipment.length?'. '+esc(e.equipment.join(', ')):'')+(it.done?' <span class="tag ok">'+ICON.check+'Done</span>':'')+'</span>'+(it.timer?'<span class="tline">'+ICON.timer+esc(timerText(it.timer))+'</span>':'')+(it.note?'<span class="plan-note">'+esc(it.note)+'</span>':'')+
      (it.log.some(function(s){return s.done;})?'<div class="setchips">'+setChips(it)+'</div>':'')+(it.clientNote?'<blockquote><b>'+esc(firstName(c.name))+':</b> '+esc(it.clientNote)+'</blockquote>':'')+'</div></div>';}).join('');
  return backBtn()+'<div class="page-head"><div><h1>'+esc(w.title)+'</h1><p class="lede">For '+esc(c.name)+', '+(w.programTitle?esc(w.programTitle)+', ':'')+fmtLc(w.date)+'</p></div></div>'+
    (w.timer?'<div class="timer-card"><div><b>Workout timer</b><span>'+esc(timerText(w.timer))+'</span></div></div>':'')+(started||exDoneCount(w)?'<p class="hint">'+esc(firstName(c.name))+' is working through this: '+exDoneCount(w)+' of '+plural(w.items.length,'exercise')+' done.</p>':'')+
    (w.notes?'<div class="note-box"><b>Workout notes</b><p>'+esc(w.notes)+'</p></div>':'')+
    '<div class="plan">'+items+'</div>'+
    '<div class="mt"><button class="btn btn-primary btn-block big" data-act="logWorkout" data-id="'+w.id+'">Log this session in person</button></div>'+
    '<div class="actions"><button class="btn" data-act="editWorkout" data-id="'+w.id+'">Edit</button><button class="btn" data-act="dupWorkout" data-id="'+w.id+'">Duplicate</button><button class="btn btn-danger" data-act="delWorkout" data-id="'+w.id+'">Delete</button></div>'+
    '<button class="btn-link" data-act="wToTemplate" data-id="'+w.id+'">'+ICON.copy+'Save as template</button>';
}
function completedDetail(w,c,isT){
  var prs=prsIn(w);
  var by=w.loggedBy==='trainer'?'Logged in person with '+S.trainer.first:(isT?'Logged by '+esc(firstName(c.name)):'Logged by you');
  var prBox=prs.length?'<div class="pr-box"><b>New personal record'+(prs.length>1?'s':'')+'</b><ul>'+prs.map(function(p){return '<li>'+esc(ex(p.exId).name)+': '+setLong(p)+'</li>';}).join('')+'</ul></div>':'';
  var anyUnder=false,anyOver=false;
  var items=w.items.map(function(it){
    var e=ex(it.exId),t=targetText(it),tw=num(it.weight),tr=parseInt(it.reps,10)||0;
    var ds=it.log.filter(function(s){return s.done;}),isPR=prs.some(function(p){return p.exId===it.exId;});
    var sets=ds.length?ds.map(function(s){var sw=num(s.w)||0,sr=parseInt(s.r,10)||0;var under=(tw!==null&&sw<tw)||(tr&&sr<tr),over=!under&&((tw!==null&&sw>tw)||(tr&&sr>tr));if(under)anyUnder=true;if(over)anyOver=true;return '<span class="setchip'+(under?' under':over?' over':'')+'">'+setShort({w:sw,r:sr,u:it.unit})+'</span>';}).join(''):'<span class="muted">Skipped</span>';
    return '<div class="plan-item"><div class="plan-main"><div class="plan-top"><b>'+esc(e.name)+'</b><span>'+(isPR?'<span class="tag pr">PR</span> ':'')+(e.video?'<button class="tag vid" data-act="video" data-ex="'+e.id+'">'+ICON.play+'Video</button>':'')+'</span></div><span class="plan-target">Planned '+t.main+' '+t.sub+'</span>'+(it.timer?'<span class="tline">'+ICON.timer+esc(timerText(it.timer))+(it.timerResult?'. Result: '+esc(it.timerResult):'')+'</span>':'')+'<div class="setchips">'+sets+(it.rpe?'<span class="tag">RPE '+it.rpe+'</span>':'')+'</div>'+
      (it.clientNote?'<blockquote><b>'+(w.loggedBy==='trainer'?'Session note':(isT?esc(firstName(c.name)):'Your note'))+':</b> '+esc(it.clientNote)+'</blockquote>':'')+'</div></div>';}).join('');
  return backBtn()+'<div class="page-head"><div><h1>'+esc(w.title)+'</h1><p class="lede">'+(isT?esc(c.name)+', ':'')+'completed '+fmtLc(w.date)+'. '+by+'.</p></div></div>'+
    ((w.clientSummary||w.effort)?'<div class="note-box"><b>'+(w.loggedBy==='trainer'?'Session note':(isT?esc(firstName(c.name))+'\u2019s note':'Your note'))+(w.effort?', felt '+esc(w.effort.toLowerCase()):'')+'</b>'+(w.clientSummary?'<p>'+esc(w.clientSummary)+'</p>':'')+'</div>':'')+prBox+(w.timer?'<div class="timer-card"><div><b>Workout timer</b><span>'+esc(timerText(w.timer))+'</span>'+(w.timerResult?'<small class="result">Result: '+esc(w.timerResult)+'</small>':'')+'</div></div>':'')+
    '<div class="plan">'+items+'</div>'+((anyUnder||anyOver)?'<p class="hint">'+(anyUnder?'Sets in red came in under the planned weight or reps. ':'')+(anyOver?'Sets in green beat the planned weight or reps.':'')+'</p>':'')+
    (isT?'<div class="actions"><button class="btn" data-act="dupWorkout" data-id="'+w.id+'">Duplicate</button><button class="btn" data-act="wToTemplate" data-id="'+w.id+'">'+ICON.copy+'Save as template</button></div>':'<div class="actions"><button class="btn" data-act="shareToCommunity" data-id="'+w.id+'">'+ICON.chat+'Share to community</button></div>');
}

/* ---------- logging (client, or trainer in person) ---------- */
function vLog(p){
  var w=workout(p.id);if(!w)return backBtn()+empty('Workout not found','It may have been deleted.');
  var c=client(w.clientId),isT=S.role==='trainer';
  if(w.status==='completed')return completedDetail(w,c,isT);
  var cards=w.items.map(function(it){return exCard(w,it,isT);}).join(''),pg=w.programId?progOf(w.programId):null;
  return backBtn()+'<div class="page-head"><div><h1>'+esc(w.title)+'</h1><p class="lede">'+(w.programId?esc(w.programTitle||'Program')+(pg?', week '+(w.week+1)+' of '+pg.weeks:''):fmtDate(w.date))+(isT?', in person with '+esc(firstName(c.name)):'')+'</p></div><button class="btn sm" data-act="freeTimer">'+ICON.timer+'Timer</button></div>'+
    (w.programId?'<label class="field date-field"><span>Day completed</span><input type="date" value="'+esc(w.date)+'" max="'+TODAY()+'" data-ch="sessDate" data-w="'+w.id+'"></label>':'')+
    (w.notes?'<div class="note-box"><b>'+(isT?'Workout notes':'From '+esc(S.trainer.first))+'</b><p>'+esc(w.notes)+'</p></div>':'')+
    (function(){var q=[];w.items.forEach(function(it){(ex(it.exId).equipment||[]).forEach(function(x){if(q.indexOf(x)<0)q.push(x);});});return q.length?'<div class="note-box"><b>Equipment for this workout</b><p>'+esc(q.join(', '))+'</p></div>':'';})()+
    timerCard(w)+'<div class="ex-grid">'+cards+'</div>'+
    '<div class="cta-bar"><button class="btn btn-primary btn-block big stack" data-act="finish" data-id="'+w.id+'">Finish workout<span class="cta-sub">'+exDoneCount(w)+' of '+plural(w.items.length,'exercise')+' done</span></button></div>';
}
function numCls(it,f,v){v=String(v==null?'':v).trim();if(v==='')return '';var t=f==='w'?num(it.weight):(parseInt(it.reps,10)||null),x=f==='w'?num(v):parseInt(v,10);if(t===null||t===undefined||isNaN(t)||x===null||x===undefined||isNaN(x))return '';return x<t?' under':x>t?' over':'';}
function exDoneCount(w){return w.items.filter(function(it){return it.done;}).length;}
function setChips(it){var ds=it.log.filter(function(s){return s.done;});return (ds.length?ds.map(function(s){return '<span class="setchip">'+setShort({w:num(s.w)||0,r:parseInt(s.r,10)||0,u:it.unit})+'</span>';}).join(''):'<span class="muted">No sets logged</span>')+(it.rpe?'<span class="tag">RPE '+it.rpe+'</span>':'');}
function exCard(w,it,isT){
  var e=ex(it.exId),t=targetText(it),last=lastBest(w.clientId,it.exId,w.id),v=videoEmbed(e.video);
  var attrs=' data-w="'+w.id+'" data-it="'+it.id+'"';
  if(it.done){
    return '<section class="ex ex-done"><div class="ex-head"><h2>'+esc(e.name)+'</h2><span class="tag ok">'+ICON.check+'Done</span></div>'+
      '<div class="setchips">'+setChips(it)+'</div>'+(it.timerResult?'<span class="result">Result: '+esc(it.timerResult)+'</span>':'')+
      (it.clientNote?'<blockquote><b>'+(isT?'Session note':'Your note')+':</b> '+esc(it.clientNote)+'</blockquote>':'')+
      '<button class="btn-link" data-act="exUndo"'+attrs+'>Edit</button></section>';
  }
  var rows=it.log.map(function(s,i){
    return '<div class="set'+(s.done?' done':'')+'"><span class="set-n">'+(i+1)+'</span>'+
      '<input class="num'+numCls(it,'w',s.w)+'" type="text" inputmode="decimal" enterkeyhint="next" aria-label="Set '+(i+1)+' weight in pounds" placeholder="'+esc(it.weight||'–')+'" value="'+esc(s.w)+'" data-in="setVal" data-f="w" data-i="'+i+'"'+attrs+'>'+
      '<input class="num'+numCls(it,'r',s.r)+'" type="text" inputmode="numeric" enterkeyhint="done" aria-label="Set '+(i+1)+(it.unit==='time'?' seconds':' reps')+'" placeholder="'+esc(it.reps)+'" value="'+esc(s.r)+'" data-in="setVal" data-f="r" data-i="'+i+'"'+attrs+'>'+
      '<button class="check'+(s.done?' on':'')+'" aria-pressed="'+s.done+'" aria-label="Set '+(i+1)+' done" data-act="toggleSet" data-i="'+i+'"'+attrs+'>'+ICON.check+'</button></div>';
  }).join('');
  var vbtn=v?'<button class="btn sm" data-act="video" data-ex="'+e.id+'">'+ICON.play+'Video</button>':(isT?'<button class="tag add" data-act="editEx" data-ex="'+e.id+'">Add video</button>':'');
  return '<section class="ex"><div class="ex-head"><h2>'+esc(e.name)+'</h2>'+vbtn+'</div>'+
    '<p class="target"><b>'+t.main+'</b>'+t.sub+'</p>'+(wType(it.type)?'<p class="goal">Goal: '+wType(it.type).name.toLowerCase()+', '+wtRange(wType(it.type))+'. Aim for RPE '+wType(it.type).rpe+'.</p>':'')+(e.equipment&&e.equipment.length?'<p class="equip">Equipment: '+esc(e.equipment.join(', '))+'</p>':'')+
    (it.note?'<p class="coach-note">'+esc(it.note)+'</p>':'')+
    (last?'<p class="last">Last time: '+setLong(last.best)+', '+fmtLc(last.w.date)+(last.item.rpe?', RPE '+last.item.rpe:'')+'</p>':'')+
    (it.timer?'<div class="ex-timer"><span>'+ICON.timer+esc(timerText(it.timer))+'</span><button class="btn btn-primary sm" data-act="ckStart"'+attrs+'>Start</button></div>'+(it.timerResult?'<span class="result">Result: '+esc(it.timerResult)+'</span>':''):'')+
    '<div class="sets"><div class="set set-h" aria-hidden="true"><span></span><span>lb</span><span>'+(it.unit==='time'?'Sec':'Reps')+'</span><span>Done</span></div>'+rows+'</div>'+
    '<div class="ex-foot"><button class="btn-link" data-act="addSet"'+attrs+'>Add set</button>'+(it.log.length>1?'<button class="btn-link muted" data-act="removeSet"'+attrs+'>Remove last set</button>':'')+'</div>'+
    rpeBlock(it,attrs)+'<textarea class="note-in" rows="1" placeholder="'+(isT?'Session note (optional)':'Note for '+esc(S.trainer.first)+' (optional)')+'" data-in="clientNote"'+attrs+'>'+esc(it.clientNote)+'</textarea>'+
    '<button class="btn btn-block ex-complete" data-act="exDone"'+attrs+'>'+ICON.check+'Mark exercise done</button></section>';
}

/* ---------- builder ---------- */
function startDraft(cid,src,mode){
  ui.pickQ='';ui.pickG='All';
  draft={kind:'workout',id:mode==='edit'?src.id:null,clientId:cid,title:src?src.title:'',date:src&&mode==='edit'?src.date:TODAY(),notes:src?src.notes:'',
    timer:src?clone(src.timer):null,type:src?src.type||'':'',
    items:(src?src.items:[]).map(function(it){return {id:mode==='edit'?it.id:uid(),exId:it.exId,type:it.type||'',sets:String(it.sets),reps:it.reps,weight:it.weight,note:it.note,timer:clone(it.timer)};})};
  draft0=JSON.stringify(draft);
}
function newDraftItem(exId){var last=draft.clientId?lastBest(draft.clientId,exId):null,t=wType(draft.type),reps=t?String(t.reps):(last?String(last.item.reps):'10');
  return {id:uid(),exId:exId,type:draft.type||'',sets:'3',reps:reps,weight:draft.clientId?autoWeight(draft.clientId,exId,draft.type,reps):'',note:'',timer:null};}
function startTemplateDraft(src){
  ui.pickQ='';ui.pickG='All';
  draft={kind:'template',id:src?src.id:null,clientId:null,title:src?src.title:'',date:'',notes:src?src.notes||'':'',timer:src?clone(src.timer):null,type:src?src.type||'':'',
    items:(src?src.items:[]).map(function(it){return {id:src&&src.id?it.id:uid(),exId:it.exId,type:it.type||'',sets:String(it.sets),reps:it.reps,weight:it.weight||'',note:it.note||'',timer:clone(it.timer)};})};
  draft0=JSON.stringify(draft);
}
function lastW(cid,exId){var lb=cid?lastBest(cid,exId):null;return lb&&lb.best.w>0?String(clean(lb.best.w)):'';}
function vBuilder(){
  var prog=draft&&draft.kind==='program',body=prog?vProgramBuilder():vBuilderBody();
  return (isDesk()&&draft&&!prog)?'<div class="build-grid"><div class="build-main">'+body+'</div><aside class="lib-pane" aria-label="Exercise library">'+libPane()+'</aside></div>':body;
}
function dTypeRow(d,a,isT,c){
  var t=wType(d.type),e=ex(d.exId),sug='';
  if(!isT&&c){var al=autoLoad(c.id,d.exId,d.type,d.reps);
    if(al)sug=(String(al.w)!==String(num(d.weight)===null?'':clean(num(d.weight)))?'Suggested <b>'+al.w+' lb</b> <button class="btn-link" data-act="dUseW" data-id="'+d.id+'" data-w="'+al.w+'">Use it</button>. ':'Weight set from '+(al.t?'the '+al.t.name.toLowerCase()+' target':esc(firstName(c.name))+'’s last RPE')+'. ')+autoWhy(al);
    else if(t&&canLoad(e))sug='No 1RM for '+esc(firstName(c.name))+' on this lift yet. <button class="btn-link" data-act="setMax" data-c="'+c.id+'" data-ex="'+d.exId+'">Add a 1RM</button>';}
  else if(isT&&t&&canLoad(e))sug='Leave weight blank and each client gets about '+Math.round(100*loadPct(t.reps,t.rpe))+'% of their own 1RM when you assign it.';
  return '<div class="b-type"><label>Type<select data-ch="dItemType"'+a+'>'+typeOpts(d.type)+'</select></label><p class="sug">'+(t?typeHint(t):'')+sug+'</p></div>';
}
function vBuilderBody(){
  if(!draft)return backBtn()+empty('Nothing to edit','Open a client and tap New workout.');
  var isT=draft.kind==='template',c=isT?null:client(draft.clientId);
  if(!isT&&!c)return backBtn()+empty('Client not found','They may have been removed.');
  var items=draft.items.length?draft.items.map(function(d,i){
    var e=ex(d.exId),last=isT?null:lastBest(draft.clientId,d.exId,draft.id);
    var a=' data-id="'+d.id+'"';
    var info=isT?(e.video?'Has video':'No video yet'):(last?'Last: '+setLong(last.best)+', '+shortDate(last.w.date):'First time for '+esc(firstName(c.name)))+(e.video?'':', no video yet');
    return '<div class="b-item"><div class="b-head"><span class="b-n">'+(i+1)+'</span><div class="b-title"><b>'+esc(e.name)+'</b><small>'+info+'</small></div>'+
      '<div class="b-tools"><button class="icon-btn" aria-label="Move up" data-act="moveItem" data-dir="-1"'+a+(i===0?' disabled':'')+'>'+ICON.up+'</button><button class="icon-btn" aria-label="Move down" data-act="moveItem" data-dir="1"'+a+(i===draft.items.length-1?' disabled':'')+'>'+ICON.down+'</button><button class="icon-btn" aria-label="Remove '+esc(e.name)+'" data-act="removeItem"'+a+'>'+ICON.x+'</button></div></div>'+
      '<div class="b-grid"><label>Sets<input type="text" inputmode="numeric" value="'+esc(d.sets)+'" data-in="dItem" data-f="sets"'+a+'></label><label>Reps<input type="text" inputmode="text" value="'+esc(d.reps)+'" data-in="dItem" data-f="reps"'+a+'></label><label>Weight (lb)<input type="text" inputmode="decimal" placeholder="'+(isT?'Auto':'Optional')+'" value="'+esc(d.weight)+'" data-in="dItem" data-f="weight"'+a+'></label></div>'+dTypeRow(d,a,isT,c)+
      '<input class="b-note" type="text" placeholder="Coaching cue (optional)" value="'+esc(d.note)+'" data-in="dItem" data-f="note"'+a+'>'+
      '<div class="b-timer">'+(d.timer?'<button class="tchip" data-act="tEdit" data-scope="item"'+a+'>'+ICON.timer+esc(timerText(d.timer))+'</button>':'<button class="btn-link" data-act="tEdit" data-scope="item"'+a+'>'+ICON.timer+'Add timer (EMOM, AMRAP, intervals)</button>')+'</div></div>';
  }).join(''):'<div class="b-empty">No exercises yet. Tap Add exercise below to pick from the library or write in your own.</div>';
  var fromTpl=(!isT&&!draft.id&&!draft.items.length&&S.templates.length)?'<button class="btn btn-block" style="margin-bottom:14px" data-act="useTemplate">'+ICON.copy+'Start from a template</button>':'';
  return backBtn()+'<div class="page-head"><div><h1>'+(isT?(draft.id?'Edit template':'New template'):(draft.id?'Edit workout':'New workout'))+'</h1><p class="lede">'+(isT?'Reusable. Assign it to one client or all of them from the Templates tab.':'For '+esc(c.name))+'</p></div></div>'+fromTpl+
    '<label class="field"><span>'+(isT?'Template name':'Workout name')+'</span><input type="text" value="'+esc(draft.title)+'" placeholder="e.g. Lower body A" data-in="draftField" data-f="title"></label>'+
    (isT?'':'<label class="field"><span>Date</span><input type="date" value="'+esc(draft.date)+'" data-in="draftField" data-f="date"></label>')+
    '<div class="field"><span>Workout type (optional)</span>'+typeChips(draft.type,'dType')+'<p class="hint" style="margin:8px 0 0">'+(wType(draft.type)?typeHint(wType(draft.type))+'Applied to every exercise. Change any one below.':'Pick a training goal to fill in reps and a starting weight'+(isT?' for each client':' from '+esc(firstName(c.name))+'\u2019s 1RM and RPE')+'.')+'</p></div>'+
    '<label class="field"><span>Notes for the whole workout (optional)</span><textarea data-in="draftField" data-f="notes" placeholder="e.g. Warm up for 5 to 10 minutes first.">'+esc(draft.notes)+'</textarea></label>'+
    '<div class="field"><span>Workout timer (optional)</span>'+(draft.timer?'<button class="tchip" data-act="tEdit" data-scope="workout">'+ICON.timer+esc(timerText(draft.timer))+'</button>':'<button class="btn btn-block" data-act="tEdit" data-scope="workout">'+ICON.timer+'Add workout timer</button>')+'</div>'+
    '<h3>Exercises</h3>'+items+
    (isT?'<p class="hint">Leave weight blank and each client gets a weight when you assign it: from their 1RM and RPE if the exercise has a type, otherwise from their last session.</p>':'')+
    (!isT&&draft.items.length?'<button class="btn-link" data-act="draftToTemplate">'+ICON.copy+'Save these exercises as a template</button>':'')+
    (isT&&draft.id?'<button class="btn-link btn-danger" data-act="delTemplate">Delete template</button>':'')+
    '<div class="cta-bar cta-row"><button class="btn big desk-hide" data-act="pickEx">'+ICON.plus+'Add exercise</button><button class="btn btn-primary big" data-act="saveDraft">'+(isT?'Save template':draft.id?'Save changes':'Assign to '+esc(firstName(c.name)))+'</button></div>';
}
function libPane(below){
  var to=below&&draft&&draft.kind==='program'?'<div class="lib-to" role="group" aria-label="Day to add exercises to"><span>Add to</span>'+draft.days.map(function(d,di){return '<button type="button" class="chip'+(ui.pdDay===di?' on':'')+'" aria-pressed="'+(ui.pdDay===di)+'" data-act="pdTarget" data-d="'+di+'">'+esc(d.name||'Day '+(di+1))+'</button>';}).join('')+'</div>':'';
  return '<div class="pane-head"><h3>Exercise library</h3><button class="btn sm" data-act="newExercise" data-ctx="builder">'+ICON.plus+'Write in your own</button></div>'+to+
    '<input class="search" id="pick-q" type="search" placeholder="Search name, muscle, or equipment" value="'+esc(ui.pickQ)+'" data-in="pickSearch" autocomplete="off">'+
    '<div class="chips" id="pick-chips">'+chips(ui.pickG,'pickGroup')+'</div><div class="list pane-list" id="pick-list">'+pickRows()+'</div><p class="hint" style="margin:8px 0 0">Click an exercise to add it to '+(draft&&draft.kind==='program'&&draft.days[ui.pdDay]?esc(draft.days[ui.pdDay].name||'this day'):'the workout')+'.</p>';
}
function pickRows(){
  var list=filterLib(ui.pickQ,ui.pickG);
  if(!list.length)return noMatch(ui.pickQ,ui.pickG,'pickGroup',', or write in your own');
  var dItems=draft?(draft.kind==='program'?((draft.days[ui.pdDay]||{items:[]}).items):draft.items):[];
  return list.map(function(e){var n=dItems.filter(function(i){return i.exId===e.id;}).length;
    return '<button class="row" data-act="pickAdd" data-ex="'+e.id+'"><span class="row-main"><span class="row-title">'+esc(e.name)+'</span><span class="row-sub">'+esc(exSub(e))+'</span></span>'+(n?'<span class="tag acc">Added</span>':(e.video?'<span class="tag vid">'+ICON.play+'Video</span>':''))+'</button>';}).join('');
}
function pickSheet(){
  ui.pickQ='';ui.pickG='All';ui.picked=0;
  openSheet('<div class="sheet-head"><h2 class="sheet-title">Add exercises</h2><button class="btn btn-primary sm" id="pick-done" data-act="closeSheet">Done</button></div>'+
    '<input class="search" id="pick-q" type="search" placeholder="Search name, muscle, or equipment" data-in="pickSearch" autocomplete="off">'+
    '<div class="chips" id="pick-chips">'+chips(ui.pickG,'pickGroup')+'</div>'+
    '<div class="list" style="margin-bottom:12px"><button class="row custom-row" data-act="newExercise" data-ctx="builder">'+ICON.plus+'<span class="row-main"><span class="row-title">Write in your own exercise</span><span class="row-sub">Add it once and reuse it for any client.</span></span></button></div>'+
    '<div class="list" id="pick-list">'+pickRows()+'</div>',{tall:true});
}

/* ---------- library ---------- */
function libRows(){
  var list=filterLib(ui.libQ,ui.libG);
  if(!list.length)return (ui.libG==='Custom'&&!ui.libQ.trim())?'<div class="row"><span class="row-main"><span class="row-sub">Exercises you add show up here.</span></span></div>':noMatch(ui.libQ,ui.libG,'libGroup',', or add it as a new exercise');
  if(isDesk())return list.map(function(e){return '<button class="row lrow" data-act="editEx" data-ex="'+e.id+'"><span class="lc-name">'+esc(e.name)+'</span><span class="lc-sub">'+esc(catName(catIdOf(e)))+'</span><span class="lc-sub">'+esc(equipText(e))+'</span><span>'+(e.video?'<span class="tag vid">'+ICON.play+'Video</span>':'<span class="muted">None</span>')+'</span><span class="edit-lbl">Edit</span></button>';}).join('');
  return list.map(function(e){return '<button class="row" data-act="editEx" data-ex="'+e.id+'"><span class="row-main"><span class="row-title">'+esc(e.name)+'</span><span class="row-sub">'+esc(exSub(e))+'</span></span><span class="row-end">'+(e.video?'<span class="tag vid">'+ICON.play+'Video</span>':'')+'<span class="edit-lbl">Edit</span></span></button>';}).join('');
}
function vLibrary(){
  var live=liveLib(),withVid=live.filter(function(e){return e.video;}).length;
  if(ui.libG!=='All'&&ui.libG!=='Custom'&&ui.libG!=='uncategorized'&&!S.cats.some(function(c){return c.id===ui.libG;}))ui.libG='All';
  return '<div class="page-head"><h1>Exercises</h1></div>'+
    '<p class="lede" style="margin:-4px 0 12px">'+live.length+' exercises, '+withVid+' with video. Tap an exercise to change its name, category, equipment, or video, or to delete it.</p>'+
    '<div class="actions" style="margin-top:0"><button class="btn" data-act="newExercise" data-ctx="library">'+ICON.plus+'New exercise</button><button class="btn" data-act="editCats">Edit categories</button></div>'+
    '<input class="search" type="search" placeholder="Search by name, muscle group, or equipment" value="'+esc(ui.libQ)+'" data-in="libSearch" autocomplete="off">'+
    '<div class="chips">'+chips(ui.libG,'libGroup')+'</div>'+(isDesk()?'<div class="list"><div class="lhead" aria-hidden="true"><span>Name</span><span>Category</span><span>Equipment needed</span><span>Video</span><span></span></div><div id="lib-list">'+libRows()+'</div></div>':'<div class="list" id="lib-list">'+libRows()+'</div>');
}
function exEditor(id,ctx){
  var e=id?ex(id):null,cat=e?catIdOf(e):(S.cats.some(function(c){return c.id===ui.libG;})?ui.libG:S.cats[0].id);
  if(cat==='uncategorized')cat=S.cats[0].id;
  ui.exd={id:id||null,ctx:ctx||'library',equipment:e?(e.equipment||[]).slice():[]};
  openSheet('<h2 class="sheet-title">'+(id?'Edit exercise':'New exercise')+'</h2>'+(id?'':'<p>It goes into your library, so you can reuse it for any client.</p>')+
    '<label class="field"><span>Name</span><input id="xe-name" type="text" value="'+esc(e?e.name:'')+'" placeholder="e.g. Banded hip walk" autocomplete="off"></label>'+
    '<label class="field"><span>Category</span><select id="xe-cat">'+S.cats.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===cat?' selected':'')+'>'+esc(c.name)+'</option>';}).join('')+'</select></label>'+
    '<div class="field"><span>Equipment needed</span><div class="chiprow" id="eqbox">'+eqChips()+'</div>'+
    '<div class="add-row"><input id="eq-new" type="text" list="eq-list" placeholder="Add equipment, e.g. Squat rack" autocomplete="off"><button class="btn" data-act="eqAdd">Add</button></div>'+
    '<datalist id="eq-list">'+allEquip().map(function(q){return '<option value="'+esc(q)+'">';}).join('')+'</datalist></div>'+
    '<label class="field"><span>Video link (optional)</span><input id="xe-video" type="url" value="'+esc(e?e.video:'')+'" placeholder="https://youtu.be/..." autocomplete="off"></label>'+
    '<p class="hint" style="margin-top:-6px">Upload to YouTube as unlisted (private videos won\u2019t play for clients), or to Vimeo, then paste the share link here.</p>'+
    '<p class="err" id="xe-err" hidden></p>'+
    '<button class="btn btn-primary btn-block" data-act="exSave">'+(id?'Save changes':'Save exercise')+'</button>'+
    (id&&e.video?'<button class="btn btn-block" data-act="video" data-ex="'+e.id+'">'+ICON.play+'Watch current video</button>':'')+
    (id?'<button class="btn btn-block btn-danger" data-act="exDelete">Delete exercise</button>':'')+
    '<button class="btn btn-block" data-act="closeSheet">Cancel</button>');
  if(!id)setTimeout(function(){var i=$('#xe-name');if(i)i.focus();},60);
}
function eqChips(){return ui.exd.equipment.length?ui.exd.equipment.map(function(q,i){return '<button class="chip on" data-act="eqRemove" data-i="'+i+'" aria-label="Remove '+esc(q)+'">'+esc(q)+' \u00d7</button>';}).join(''):'<span class="muted">No equipment needed. Add items below.</span>';}
function allEquip(){var o={};S.library.forEach(function(e){(e.equipment||[]).forEach(function(q){o[q]=1;});});return Object.keys(o).sort();}
function addEquip(v){v=String(v||'').trim();if(!v)return;v=v.charAt(0).toUpperCase()+v.slice(1);if(ui.exd.equipment.some(function(q){return q.toLowerCase()===v.toLowerCase();}))return;ui.exd.equipment.push(v);}
function setSheet(html){var sh=$('#sheet-root .sheet');if(sh){sh.innerHTML=html;sh.scrollTop=0;}}
function catSheet(){ui.catd={cats:clone(S.cats),merged:clone(S.catMerged)||{},confirm:null};openSheet('<div id="catbox">'+catHTML()+'</div>');}
function draftCatOf(e){var id=e.cat||slug(e.group||''),g=0;while(ui.catd.merged[id]&&g++<20)id=ui.catd.merged[id];return id;}
function catCount(id){return liveLib().filter(function(e){return draftCatOf(e)===id;}).length;}
function catHTML(){
  var d=ui.catd;
  if(d.confirm){
    var c=d.cats.filter(function(x){return x.id===d.confirm;})[0],n=catCount(d.confirm),others=d.cats.filter(function(x){return x.id!==d.confirm;});
    return '<h2 class="sheet-title">Delete '+esc(c.name)+'?</h2><p>'+(n?'Its '+plural(n,'exercise')+' will move to the category you pick. No exercises are deleted.':'It has no exercises in it.')+'</p>'+
      (n?'<label class="field"><span>Move its exercises to</span><select id="cat-move">'+others.map(function(o){return '<option value="'+esc(o.id)+'">'+esc(o.name)+'</option>';}).join('')+'</select></label>':'')+
      '<button class="btn btn-danger-fill btn-block" data-act="catDelConfirm">Delete category</button><button class="btn btn-block" data-act="catBack">Back</button>';
  }
  return '<h2 class="sheet-title">Edit categories</h2><p>Rename, reorder, add, or remove the categories that group your exercises. Numbers show how many exercises are in each.</p>'+
    '<div class="list">'+d.cats.map(function(c,i){return '<div class="row cat-row"><input type="text" value="'+esc(c.name)+'" data-in="catName" data-cat="'+esc(c.id)+'" aria-label="Category name"><span class="muted cat-n">'+catCount(c.id)+'</span>'+
      '<button class="icon-btn" data-act="catMove" data-dir="-1" data-cat="'+esc(c.id)+'"'+(i===0?' disabled':'')+' aria-label="Move up">'+ICON.up+'</button>'+
      '<button class="icon-btn" data-act="catMove" data-dir="1" data-cat="'+esc(c.id)+'"'+(i===d.cats.length-1?' disabled':'')+' aria-label="Move down">'+ICON.down+'</button>'+
      '<button class="icon-btn" data-act="catDel" data-cat="'+esc(c.id)+'"'+(d.cats.length<2?' disabled':'')+' aria-label="Delete '+esc(c.name)+'">'+ICON.x+'</button></div>';}).join('')+'</div>'+
    '<div class="add-row" style="margin:12px 0 14px"><input id="cat-new" type="text" placeholder="New category, e.g. Mobility" autocomplete="off"><button class="btn" data-act="catAdd">Add</button></div>'+
    '<p class="err" id="cat-err" hidden></p>'+
    '<button class="btn btn-primary btn-block" data-act="catSave">Save categories</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>';
}
function catRefresh(){var b=$('#catbox');if(b)b.innerHTML=catHTML();}
function catErr(m){var e=$('#cat-err');if(e){e.textContent=m;e.hidden=false;}}
function videoSheet(id){
  var e=ex(id),v=videoEmbed(e.video);
  if(!v){toast('No video for this exercise yet.');return;}
  openSheet('<h2 class="sheet-title">'+esc(e.name)+'</h2><div class="video"><iframe src="'+esc(v.src)+'" title="'+esc(e.name)+' video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+
    '<p class="hint">Video not playing? <a href="'+esc(v.open)+'" target="_blank" rel="noopener">Open it in '+v.host+'</a>.</p><button class="btn btn-block" data-act="closeSheet">Close</button>');
}

/* ---------- workout types, 1-rep max, RPE ---------- */
var WTYPES=[{id:'endurance',name:'Endurance',lo:15,hi:25,reps:15,rpe:7},{id:'stability',name:'Stability',lo:12,hi:15,reps:12,rpe:7},{id:'hypertrophy',name:'Hypertrophy',lo:8,hi:12,reps:10,rpe:8},{id:'strength',name:'Strength',lo:4,hi:6,reps:5,rpe:9},{id:'power',name:'Power',lo:5,hi:5,reps:5,rpe:6}];
function wType(id){for(var i=0;i<WTYPES.length;i++)if(WTYPES[i].id===id)return WTYPES[i];return null;}
function wtRange(t){return t.lo===t.hi?t.lo+' reps':t.lo+'–'+t.hi+' reps';}
function rng(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a;}
function typeChips(cur,act){cur=cur||'';return '<div class="tchips" role="group" aria-label="Workout type">'+[['','None']].concat(WTYPES.map(function(t){return [t.id,t.name];})).map(function(x){var t=wType(x[0]),on=cur===x[0];return '<button type="button" class="chip'+(on?' on':'')+'" aria-pressed="'+on+'" data-act="'+act+'" data-t="'+x[0]+'">'+x[1]+(t?'<small>'+(t.lo===t.hi?t.lo:t.lo+'–'+t.hi)+'</small>':'')+'</button>';}).join('')+'</div>';}
function typeOpts(cur){return '<option value="">No type</option>'+WTYPES.map(function(t){return '<option value="'+t.id+'"'+(cur===t.id?' selected':'')+'>'+t.name+' '+(t.lo===t.hi?t.lo:t.lo+'\u2013'+t.hi)+'</option>';}).join('');}
function typeHint(t){return t?t.name+': '+wtRange(t)+', aim for RPE '+t.rpe+'. ':'';}
function rirOf(rpe){rpe=+rpe;return rpe>0?Math.max(0,Math.min(5,10-rpe)):0;}
function loadPct(reps,rpe){return 1/(1+(reps+rirOf(rpe))/30);}
function roundW(x){return x<25?Math.round(x/2.5)*2.5:Math.round(x/5)*5;}
function bandOnly(e){var q=(e.equipment||[]).map(function(x){return String(x).toLowerCase();});return q.some(function(x){return /band|tubing/.test(x);})&&q.every(function(x){return /band|tubing|partner|mat|bench|wall/.test(x);});}
function canLoad(e){if(!e)return false;var c=catIdOf(e);return !isBodyweight(e)&&!bandOnly(e)&&c!=='mobility'&&c!=='cardio';}
var RPE_REPS={10:'Max effort, no reps left',9:'Could have done 1 more rep',8:'Could have done 2 more reps',7:'Could have done 3 more reps',6:'Could have done 4 more reps',5:'Could have done 5 or more',4:'Light',3:'Light',2:'Very light',1:'Very light'};
var RPE_FEEL={10:'Max effort',9:'Very hard',8:'Hard',7:'Challenging',6:'Moderate',5:'Moderate',4:'Light',3:'Light',2:'Very light',1:'Very light'};
function rpeCap(it){return it.rpe?'RPE '+it.rpe+': '+(it.unit==='time'?RPE_FEEL:RPE_REPS)[it.rpe]:'How hard was the toughest set? 10 is max effort.';}
function rpeBlock(it,attrs){return '<div class="rpe" role="group" aria-label="RPE, rate of perceived exertion"><div class="rpe-top"><b>RPE</b><span class="rpe-cap">'+rpeCap(it)+'</span></div><div class="rpe-row">'+rng(10).map(function(i){var v=i+1,on=it.rpe===v;return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" aria-label="RPE '+v+'" data-act="rpe" data-v="'+v+'"'+attrs+'>'+v+'</button>';}).join('')+'</div></div>';}
function setE1(w,r,rpe){return w>0&&r>0?e1rm(w,r+rirOf(rpe)):0;}
/* best current 1RM: a newer RPE-rated session beats an older tested max; otherwise tested, otherwise the best estimate from logged sets */
function maxInfo(cid,exId,noTest){
  var c=client(cid);if(!c)return null;var t=!noTest&&c.maxes&&c.maxes[exId],R=null,E=null;
  history(cid,exId).forEach(function(x){if(x.item.unit==='time')return;var rpe=+x.item.rpe||0,best=null;
    x.item.log.forEach(function(s){if(!s.done)return;var w=num(s.w)||0,r=parseInt(s.r,10)||0;if(w<=0||r<1||r>15)return;var v=setE1(w,r,rpe);if(!best||v>best.v)best={v:v,w:w,r:r,rpe:rpe,date:x.w.date};});
    if(!best)return;if(rpe)R=best;if(!E||best.v>E.v)E=best;});
  var T=t&&+t.w>0?{v:+t.w,src:'tested',date:t.date||''}:null;
  if(R&&(!T||R.date>=T.date))return {v:R.v,src:'rpe',set:R,date:R.date};
  if(T)return (E&&E.date>T.date&&E.v>T.v)?{v:E.v,src:'est',set:E,date:E.date}:T;
  return E?{v:E.v,src:'est',set:E,date:E.date}:null;
}
function maxText(m,lower){if(!m)return '';var v=clean(roundW(m.v)),s;
  if(m.src==='tested')s='1RM '+v+' lb (tested'+(m.date?' '+shortDate(m.date):'')+')';
  else s='Est. 1RM '+v+' lb (from '+clean(m.set.w)+' × '+m.set.r+(m.set.rpe?' at RPE '+m.set.rpe:'')+', '+shortDate(m.date)+')';
  return lower?s.replace(/^Est\./,'est.'):s;}
function autoLoad(cid,exId,typeId,reps,unit){
  var e=ex(exId);if(!cid||unit==='time'||!canLoad(e))return null;
  var t=wType(typeId),n=parseInt(reps,10)||(t?t.reps:0);if(!n||n>30)return null;
  var lb=lastBest(cid,exId);if(!t&&!(lb&&+lb.item.rpe))return null;
  var m=maxInfo(cid,exId);if(!m)return null;
  var rpe=t?t.rpe:8,pct=loadPct(n,rpe),w=m.v*pct,capped='';
  if(lb&&lb.best.w>0&&Math.abs((parseInt(lb.item.reps,10)||lb.best.r)-n)<=3){var lo=lb.best.w*0.9,hi=lb.best.w*1.1;if(w>hi){w=hi;capped='up';}else if(w<lo){w=lo;capped='down';}}
  w=roundW(w);if(w<=0)return null;
  return {w:String(clean(w)),m:m,pct:Math.round(100*pct),reps:n,rpe:rpe,t:t,capped:capped};
}
function autoWeight(cid,exId,typeId,reps,unit){var a=autoLoad(cid,exId,typeId,reps,unit);return a?a.w:(cid?lastW(cid,exId):'');}
function autoWhy(a){return a.reps+' reps at RPE '+a.rpe+' is about '+a.pct+'% of '+maxText(a.m,true)+(a.capped?', held to 10% '+(a.capped==='up'?'above':'below')+' last time':'')+'.';}
function maxesBlock(cid){
  var c=client(cid);if(!c)return '';var isT=S.role==='trainer',mx=c.maxes||{},ids=Object.keys(mx).filter(function(id){return mx[id]&&+mx[id].w>0&&findIn(S.library,id);}).sort(function(a,b){return ex(a).name.localeCompare(ex(b).name);});
  if(!isT&&!ids.length)return '';
  var rows=ids.map(function(id){var inner='<span class="row-main"><span class="row-title">'+esc(ex(id).name)+'</span><span class="row-sub">'+clean(mx[id].w)+' lb'+(mx[id].date?', tested '+fmtLc(mx[id].date):'')+'</span></span>';
    return isT?'<button class="row" data-act="setMax" data-c="'+cid+'" data-ex="'+id+'">'+inner+'<span class="tag">Edit</span></button>':'<div class="row">'+inner+'</div>';}).join('');
  return '<div class="sec-head"><h3>Tested 1-rep maxes</h3>'+(isT?'<button class="btn sm" data-act="setMax" data-c="'+cid+'">'+ICON.plus+'Add</button>':'')+'</div>'+
    (ids.length?'<div class="list">'+rows+'</div>':'<p class="muted">None yet. Add a tested max, or let Gainz estimate one from logged sets and RPE.</p>');
}
function mxEst(cid,exId){if(!exId)return '';var m=maxInfo(cid,exId,true);return m?'Gainz estimate from logged sets: '+maxText(m,true).replace(/^est\. /,'')+'.':'No estimate yet. One shows up after '+esc(firstName(client(cid).name))+' logs this lift with weight.';}
function maxSheet(cid,exId){
  var c=client(cid);if(!c)return;var mx=c.maxes||{},cur=exId&&mx[exId],done=exIdsFor(cid);
  var loadable=liveLib().filter(canLoad).sort(function(a,b){return a.name.localeCompare(b.name);});
  var opt=function(e){return '<option value="'+e.id+'"'+(e.id===exId?' selected':'')+'>'+esc(e.name)+'</option>';};
  var sel=exId?'<p class="tsum">'+esc(ex(exId).name)+'</p><input type="hidden" id="mx-ex" value="'+esc(exId)+'">':
    '<label class="field"><span>Exercise</span><select id="mx-ex" data-ch="mxEx"><option value="">Pick an exercise</option>'+(done.length?'<optgroup label="Logged by '+esc(firstName(c.name))+'">'+loadable.filter(function(e){return done.indexOf(e.id)>-1;}).map(opt).join('')+'</optgroup>':'')+'<optgroup label="All exercises">'+loadable.map(opt).join('')+'</optgroup></select></label>';
  openSheet('<h2 class="sheet-title">'+(cur?'Edit':'Add')+' a tested 1-rep max</h2><p class="muted" style="margin:0 0 14px">For '+esc(c.name)+'. Workout types use it to suggest starting weights. Without one, Gainz estimates it from logged sets and RPE.</p>'+sel+
    '<p class="hint" id="mx-est" style="margin:-4px 0 14px">'+mxEst(cid,exId)+'</p>'+
    '<div class="mx-grid"><label class="field"><span>1-rep max (lb)</span><input id="mx-w" type="text" inputmode="decimal" value="'+(cur?esc(String(cur.w)):'')+'" placeholder="e.g. 185"></label><label class="field"><span>Date tested</span><input id="mx-d" type="date" max="'+TODAY()+'" value="'+esc(cur&&cur.date||TODAY())+'"></label></div>'+
    '<p class="err" id="mx-err" hidden></p><button class="btn btn-primary btn-block big" data-act="mxSave" data-c="'+cid+'">Save</button>'+
    '<button class="btn btn-block btn-danger" id="mx-del" data-act="mxDel" data-c="'+cid+'"'+(cur?'':' hidden')+'>Remove this 1RM</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');
}
function refreshDraftLoads(cid,exId){if(!draft||draft.kind!=='workout'||draft.clientId!==cid)return;draft.items.forEach(function(d){if(d.exId===exId&&d.type){var a=autoLoad(cid,exId,d.type,d.reps);if(a)d.weight=a.w;}});}
function applyDType(d,t){d.type=t?t.id:'';if(!t)return;var r=String(d.reps||'').trim();if(!r||/^\d+(\s*[-–]\s*\d+)?$/.test(r))d.reps=String(t.reps);if(draft&&draft.clientId){var a=autoLoad(draft.clientId,d.exId,t.id,d.reps);if(a)d.weight=a.w;}}
function applyProgType(it,t){if(it.unit==='time')return;it.type=t?t.id:'';if(t)it.rx=it.rx.map(function(x){var r=parseRx(x,'reps');return (r?r.sets:3)+'x'+t.reps;});}

/* ---------- copy one week of a program exercise to the weeks after it ---------- */
function cpCalc(){var c=ui.cp,it=c&&pItem(c.d,c.i);if(!it)return null;var base=parseRx(it.rx[c.from],it.unit),bw=num(it.wt[c.from]),rows=[];
  if(!base)return {err:'Week '+(c.from+1)+' needs sets × '+(it.unit==='time'?'seconds':'reps')+' first, like 3x10.',it:it};
  for(var k=c.from+1;k<draft.weeks;k++){var n=k-c.from;rows.push({k:k,sets:Math.max(1,Math.min(20,Math.round(base.sets+n*(c.ds||0)))),reps:Math.max(1,Math.round(base.reps+n*(c.dr||0))),w:(c.auto||bw===null)?null:Math.max(0,clean(bw+n*(c.dw||0)))});}
  return {it:it,base:base,bw:bw,rows:rows};}
function cpPrev(){var r=cpCalc();if(!r)return '';if(r.err)return '<p class="err">'+r.err+'</p>';var u=r.it.unit,wt=function(w){return w===null?'Auto':clean(w)+' lb';};
  var tr=function(k,sets,reps,w,src){return '<tr'+(src?' class="src"':'')+'><td>Week '+(k+1)+(src?' (copied)':'')+'</td><td>'+rxView({sets:sets,reps:reps},u)+'</td><td>'+wt(w)+'</td></tr>';};
  return '<table class="cp-prev"><thead><tr><th>Week</th><th>'+(u==='time'?'Sets × time':'Sets × reps')+'</th><th>Weight</th></tr></thead><tbody>'+tr(ui.cp.from,r.base.sets,r.base.reps,r.bw,true)+r.rows.map(function(x){return tr(x.k,x.sets,x.reps,x.w);}).join('')+'</tbody></table>'+
    (!ui.cp.auto&&r.bw===null?'<p class="hint" style="margin:-6px 0 14px">Week '+(ui.cp.from+1)+' has no weight, so later weeks stay on Auto (worked out from 1RM and RPE).'+(ui.cp.dw?' Type a week '+(ui.cp.from+1)+' weight to add pounds each week.':'')+'</p>':'');}
function cpLabel(){var a=ui.cp.from+2,b=draft.weeks;return a===b?'Copy to week '+b:'Copy to weeks '+a+'–'+b;}
function cpRefresh(){var p=$('#cp-prev');if(p)p.innerHTML=cpPrev();var g=$('#cp-go');if(g)g.textContent=cpLabel();}
function cpSheet(){var c=ui.cp,it=pItem(c.d,c.i);if(!it)return;var e=ex(it.exId),u=it.unit==='time';
  var stp=function(f,lbl,step){return '<div class="stp"><span id="cpl-'+f+'">'+lbl+'</span><span class="stp-row"><button type="button" data-act="cpStep" data-f="'+f+'" data-v="'+(-step)+'" aria-label="Less">−</button><input type="text" inputmode="decimal" id="cp-'+f+'" aria-labelledby="cpl-'+f+'" value="'+(c[f]||0)+'" data-in="cpField" data-f="'+f+'"><button type="button" data-act="cpStep" data-f="'+f+'" data-v="'+step+'" aria-label="More">+</button></span></div>';};
  openSheet('<h2 class="sheet-title">Copy '+esc(e.name)+'</h2><p class="muted" style="margin:0 0 14px">Copy one week to every week after it, adding or taking away a little each week.</p>'+
    '<label class="field"><span>Copy from</span><select data-ch="cpFrom">'+rng(draft.weeks-1).map(function(k){return '<option value="'+k+'"'+(k===c.from?' selected':'')+'>Week '+(k+1)+': '+esc(it.rx[k]||'blank')+(String(it.wt[k]||'').trim()?' @ '+esc(it.wt[k])+' lb':'')+'</option>';}).join('')+'</select></label>'+
    '<p class="plabel">Each week after, change by</p><div class="cp-grid">'+stp('ds','Sets',1)+stp('dr',u?'Seconds':'Reps',u?5:1)+stp('dw','Weight (lb)',5)+'</div>'+
    (u||!canLoad(e)?'':'<label class="check-row cp-auto"><input type="checkbox" data-ch="cpAuto"'+(c.auto?' checked':'')+'> Leave later weeks’ weight on Auto, worked out each session from 1RM and RPE</label>')+
    '<div id="cp-prev">'+cpPrev()+'</div><button class="btn btn-primary btn-block big" id="cp-go" data-act="cpApply">'+cpLabel()+'</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');}

/* ---------- program builder helpers ---------- */
function pbAutoLine(it,cid,cname){
  if(it.unit==='time'||!canLoad(ex(it.exId)))return '';
  var k=-1;for(var j=0;j<it.wt.length;j++)if(!String(it.wt[j]||'').trim()){k=j;break;}if(k<0)return '';
  if(!cid)return '<p class="sug">Blank weights are worked out for each client when they start that day, from '+(it.type?'their 1RM and RPE':'their last session and RPE')+'.</p>';
  var r=parseRx(it.rx[k],it.unit),a=r?autoLoad(cid,it.exId,it.type,r.reps,it.unit):null,lw=lastW(cid,it.exId);
  if(a)return '<p class="sug">Auto weight for week '+(k+1)+' right now: <b>'+a.w+' lb</b>. '+autoWhy(a)+' It updates each session from '+esc(cname)+'’s RPE.</p>';
  if(lw)return '<p class="sug">Blank weeks start from '+esc(cname)+'’s last weight (<b>'+lw+' lb</b>).'+(it.type?'':' Pick a type to base it on 1RM and RPE instead.')+'</p>';
  return '<p class="sug">No lifting data for '+esc(cname)+' on this yet, so blank weeks are their pick. <button class="btn-link" data-act="setMax" data-c="'+cid+'" data-ex="'+it.exId+'">Add a 1RM</button></p>';
}

/* ---------- full program table ---------- */
function sessItem(x,it,ii){var s=x.items[ii];if(s&&s.exId===it.exId)return s;for(var i=0;i<x.items.length;i++)if(x.items[i].exId===it.exId)return x.items[i];return null;}
function vProgramView(p){
  var pg=progOf(p.id),isT=S.role==='trainer';
  if(!pg||(!isT&&pg.clientId!==S.viewAs))return backBtn()+empty('Program not found','It may have been deleted.');
  var c=pg.clientId?client(pg.clientId):null,st=progStats(pg),cw=curWeek(pg),N=pg.weeks;
  var head='<thead><tr><th class="pt-ex" scope="col">Exercise</th>'+rng(N).map(function(k){return '<th scope="col"'+(k===cw&&c?' class="cur"':'')+'>Week '+(k+1)+(k===cw&&c&&st.done<st.total?', now':'')+'</th>';}).join('')+'</tr></thead>';
  var body=pg.days.map(function(d,di){
    var dayRow='<tr class="pt-day"><th class="pt-ex" scope="rowgroup">'+esc(d.name)+'<small>'+plural(d.items.length,'exercise')+'</small></th>'+rng(N).map(function(k){var x=c?sessFor(pg,k,di):null,lbl=d.name+', week '+(k+1),at=' data-act="pStart" data-p="'+pg.id+'" data-w="'+k+'" data-d="'+di+'"';
      if(!c)return '<td></td>';
      if(x&&x.status==='completed')return '<td><button class="pt-stat done"'+at+' aria-label="'+esc(lbl)+', done '+shortDate(x.date)+', see results">'+ICON.check+'Done '+shortDate(x.date)+'</button></td>';
      if(x&&started(x))return '<td><button class="pt-stat prog"'+at+'>In progress</button></td>';
      return '<td><button class="pt-stat"'+at+' aria-label="'+esc(lbl)+', '+(isT?'log it in person':'start it')+'">'+(isT?'Log':'Start')+'</button></td>';}).join('')+'</tr>';
    var rows=d.items.map(function(it,ii){var e=ex(it.exId),t=wType(it.type);
      return '<tr><th class="pt-ex" scope="row"><b>'+esc(e.name)+'</b>'+(t?'<span class="pt-sub">'+t.name+', aim for RPE '+t.rpe+'</span>':'')+(it.note?'<span class="pt-sub">'+esc(it.note)+'</span>':'')+'</th>'+
        rng(N).map(function(k){var r=it.weeks[k]||it.weeks[it.weeks.length-1]||{sets:3,reps:10},x=c?sessFor(pg,k,di):null,si=x?sessItem(x,it,ii):null;
          var pw=si?si.weight:(r.weight!==undefined?r.weight:it.weight),wtxt='';
          if(pw!==''&&pw!=null)wtxt='@ '+clean(pw)+' lb';else if(it.unit!=='time'&&canLoad(e)){wtxt='@ auto';if(c&&k===cw){var aw=autoWeight(c.id,it.exId,it.type,r.reps,it.unit);if(aw)wtxt='@ auto, '+aw+' lb now';}}
          var rv=si?{sets:si.sets,reps:+si.reps||r.reps}:r;var cell='<div class="pt-rx">'+rxView(rv,it.unit)+(wtxt?' <span>'+wtxt+'</span>':'')+'</div>';
          if(si){var ds=si.log.filter(function(s){return s.done;}),tw=num(si.weight),under=false,over=false;
            if(ds.length){var sets=ds.map(function(s){var sw=num(s.w)||0,sr=parseInt(s.r,10)||0;if((tw!==null&&sw<tw)||sr<rv.reps)under=true;else if((tw!==null&&sw>tw)||sr>rv.reps)over=true;return setShort({w:sw,r:sr,u:it.unit});}).join(', ');cell+='<div class="pt-log'+(under?' under':over?' over':'')+'">'+sets+'</div>';}
            if(si.rpe)cell+='<span class="pt-rpe">RPE '+si.rpe+'</span>';}
          return '<td'+(k===cw&&c?' class="cur"':'')+'>'+cell+'</td>';}).join('')+'</tr>';}).join('');
    return '<tbody>'+dayRow+rows+'</tbody>';}).join('');
  return backBtn()+'<div class="page-head"><div><h1>'+esc(pg.title)+'</h1><p class="lede">'+(c?'For '+esc(c.name)+'. ':pg.isTemplate?'Program template. ':'')+plural(N,'week')+', '+plural(pg.days.length,'day')+' a week.'+(c?' '+st.done+' of '+st.total+' sessions done.':'')+'</p></div>'+(isT?'<div class="prog-btns"><button class="btn sm" data-act="editProgram" data-id="'+pg.id+'">Edit</button></div>':'')+'</div>'+
    (c?'<div class="prog-bar" aria-hidden="true"><span style="width:'+(st.total?Math.round(100*st.done/st.total):0)+'%"></span></div>':'')+
    (pg.notes?'<div class="note-box"><b>Notes for every session</b><p>'+esc(pg.notes)+'</p></div>':'')+
    '<div class="ptable-wrap"><table class="ptable">'+head+body+'</table></div>'+
    '<p class="hint">Each cell shows the plan (sets × reps @ weight). Once logged, it shows the sets done and the RPE. Sets in red came in under the plan; green beat it. Auto weights are worked out at the start of each session from 1RM and RPE.'+(c?(isT?' Tap Log to record a session in person, or Done to see the results.':' Tap Start to begin a day.'):'')+'</p>';
}

/* ---------- programs ---------- */
function progOf(id){return findIn(S.programs,id);}
function activeProgs(cid){return S.programs.filter(function(p){return p.clientId===cid&&!p.isTemplate&&progStats(p).done<progStats(p).total;});}
function sessFor(p,wk,di){var r=null;S.workouts.forEach(function(w){if(w.programId===p.id&&w.week===wk&&w.dayIndex===di&&(!r||w.status==='completed'))r=w;});return r;}
function progStats(p){var total=(p.weeks||0)*((p.days||[]).length),done=0;for(var k=0;k<p.weeks;k++)for(var d=0;d<p.days.length;d++){var x=sessFor(p,k,d);if(x&&x.status==='completed')done++;}return {total:total,done:done};}
function curWeek(p){for(var k=0;k<p.weeks;k++)for(var d=0;d<p.days.length;d++){var x=sessFor(p,k,d);if(!x||x.status!=='completed')return k;}return Math.max(0,p.weeks-1);}
function nextUp(p){for(var k=0;k<p.weeks;k++)for(var d=0;d<p.days.length;d++){var x=sessFor(p,k,d);if(!x||x.status!=='completed')return {wk:k,di:d,s:x};}return null;}
function rxView(rx,unit){return rx.sets+' \u00d7 '+(unit==='time'?fmtT(rx.reps):rx.reps);}
function rxInput(rx,unit){if(!rx)return '';return rx.sets+'x'+(unit==='time'&&rx.reps>=60&&rx.reps%60===0?(rx.reps/60)+'min':rx.reps);}
function parseRx(str,unit){var m=String(str||'').toLowerCase().replace(/\s+/g,'').match(/^(\d+)[x\u00d7*](\d+(?:\.\d+)?)(s|sec|secs|second|seconds|m|min|mins|minute|minutes|r|rep|reps)?$/);
  if(!m)return null;var v=parseFloat(m[2]),u=m[3]||'';if(/^m/.test(u))v=v*60;var sets=parseInt(m[1],10);if(sets<1||sets>20||v<=0)return null;return {sets:sets,reps:Math.round(v)};}
function newDay(n){return {id:uid(),name:'Day '+n,items:[]};}
function startProgramDraft(src,o){o=o||{};ui.pickQ='';ui.pickG='All';ui.pdDay=0;ui.pdErr=null;
  draft={kind:'program',id:o.mode==='edit'&&src?src.id:null,clientId:o.clientId||null,isTemplate:!!o.template,title:src?src.title:'',weeks:src?src.weeks:4,notes:src?src.notes||'':'',type:src?src.type||'':'',createdAt:src&&o.mode==='edit'?src.createdAt:null,
    days:src?src.days.map(function(d){return {id:o.mode==='edit'?d.id:uid(),name:d.name,items:d.items.map(function(it){return {id:o.mode==='edit'?it.id:uid(),exId:it.exId,unit:it.unit||'reps',type:it.type||'',note:it.note||'',rx:it.weeks.map(function(r){return rxInput(r,it.unit);}),wt:it.weeks.map(function(r){var v=r.weight!==undefined?r.weight:it.weight;return o.clearWeights||v==null?'':String(v);})};})};}):[newDay(1)]};
  draft0=JSON.stringify(draft);}
function newProgItem(exId){var e=ex(exId),mob=catIdOf(e)==='mobility',unit=(mob||/plank|hold|wall sit|carry|hang|stretch|pose/i.test(e.name))?'time':'reps',t=unit==='time'?null:wType(draft.type),rx=[],wt=[];
  for(var k=0;k<draft.weeks;k++){rx.push(unit==='time'?(mob?'2x30':'3x30'):'3x'+(t?t.reps:10));wt.push('');}
  return {id:uid(),exId:exId,unit:unit,type:t?t.id:'',note:'',rx:rx,wt:wt};}
function draftAdd(exId){if(draft.kind==='program'){var d=draft.days[ui.pdDay]||draft.days[0];if(!d){d=newDay(1);draft.days.push(d);ui.pdDay=0;}d.items.push(newProgItem(exId));}else draft.items.push(newDraftItem(exId));}
function pItem(di,ii){var d=draft&&draft.days[di];return d?d.items[ii]:null;}
function vProgramBuilder(){
  var isT=draft.isTemplate,c=draft.clientId?client(draft.clientId):null,desk=isDesk(),cname=c?firstName(c.name):'',N=draft.weeks;
  if(!isT&&!c)return backBtn()+empty('Client not found','They may have been removed.');
  var bad=function(di,ii,k,f){var e=ui.pdErr;return !!e&&e.d===di&&e.i===ii&&e.k===k&&(e.f||'rx')===f;};
  var rxIn=function(it,di,ii,k,a){var b=bad(di,ii,k,'rx');return '<input class="rx'+(b?' bad':'')+'" type="text" value="'+esc(it.rx[k]||'')+'" placeholder="3x10" aria-label="Week '+(k+1)+' sets × '+(it.unit==='time'?'seconds':'reps')+'" data-in="pdRx" data-k="'+k+'"'+a+(b?' aria-invalid="true"':'')+'>';};
  var wtIn=function(it,di,ii,k,a){var b=bad(di,ii,k,'w'),lo=it.unit!=='time'&&canLoad(ex(it.exId));return '<span class="wtw"><input class="wt'+(b?' bad':'')+'" type="text" inputmode="decimal" value="'+esc(it.wt[k]||'')+'" placeholder="'+(lo?'Auto':'lb')+'" aria-label="Week '+(k+1)+' weight in pounds'+(lo?', blank for auto':'')+'" data-in="pdWt" data-k="'+k+'"'+a+(b?' aria-invalid="true"':'')+'>'+(it.wt[k]?'<i aria-hidden="true">lb</i>':'')+'</span>';};
  var typeSel=function(it,a){return it.unit==='time'?'':'<label>Type<select data-ch="pdItemType"'+a+'>'+typeOpts(it.type)+'</select></label>';};
  var unitSel=function(it,a){return '<label>Measure by<select data-ch="pdUnit"'+a+'><option value="reps"'+(it.unit!=='time'?' selected':'')+'>Reps</option><option value="time"'+(it.unit==='time'?' selected':'')+'>Time (seconds)</option></select></label>';};
  var copyBtn=function(a){return N>1?'<button class="btn-link" data-act="pdCopy"'+a+'>'+ICON.copy+'Copy a week to later weeks…</button>':'';};
  var tools=function(d,ii,a,e){return '<button class="icon-btn" aria-label="Move up" data-act="pdMove" data-dir="-1"'+a+(ii===0?' disabled':'')+'>'+ICON.up+'</button><button class="icon-btn" aria-label="Move down" data-act="pdMove" data-dir="1"'+a+(ii===d.items.length-1?' disabled':'')+'>'+ICON.down+'</button><button class="icon-btn" aria-label="Remove '+esc(e.name)+'" data-act="pdRemove"'+a+'>'+ICON.x+'</button>';};
  var days=draft.days.map(function(d,di){
    var body;
    if(!d.items.length)body='<div class="b-empty">No exercises in '+esc(d.name||'this day')+' yet.</div>';
    else if(desk){
      var head='<thead><tr><th class="pb-ex" scope="col">Exercise</th>'+rng(N).map(function(k){return '<th scope="col">Week '+(k+1)+'</th>';}).join('')+'<th class="pb-tools"><span class="sr">Move or remove</span></th></tr></thead>';
      var rows=d.items.map(function(it,ii){var e=ex(it.exId),a=' data-d="'+di+'" data-i="'+ii+'"';
        return '<tr class="pb-main"><th class="pb-ex" scope="row"><div class="pb-name"><span class="b-n">'+(ii+1)+'</span><div><b>'+esc(e.name)+'</b><small>'+esc(equipText(e))+'</small></div></div></th>'+
          rng(N).map(function(k){return '<td class="wk">'+rxIn(it,di,ii,k,a)+wtIn(it,di,ii,k,a)+'</td>';}).join('')+'<td class="pb-tools">'+tools(d,ii,a,e)+'</td></tr>'+
          '<tr class="pb-sub"><td colspan="'+(N+2)+'"><div class="pb-opts">'+unitSel(it,a)+typeSel(it,a)+'<label class="cue"><span class="sr">Coaching cue</span><input type="text" value="'+esc(it.note)+'" placeholder="Coaching cue, e.g. Seated or kneeling" data-in="pdItem" data-f="note"'+a+'></label>'+copyBtn(a)+'</div>'+pbAutoLine(it,c&&c.id,cname)+'</td></tr>';}).join('');
      body='<div class="pb-scroll"><table class="pbt">'+head+'<tbody>'+rows+'</tbody></table></div><p class="hint pb-key">Top box: sets × reps, like 3x10 (or 3x30 for seconds). Bottom box: weight in lb. Leave weight blank for Auto.</p>';
    }else{
      body=d.items.map(function(it,ii){var e=ex(it.exId),a=' data-d="'+di+'" data-i="'+ii+'"';
        var weeks=rng(N).map(function(k){return '<label>Wk '+(k+1)+rxIn(it,di,ii,k,a)+wtIn(it,di,ii,k,a)+'</label>';}).join('');
        return '<div class="pitem"><div class="b-head"><span class="b-n">'+(ii+1)+'</span><div class="b-title"><b>'+esc(e.name)+'</b><small>'+esc(equipText(e))+'</small></div><div class="b-tools">'+tools(d,ii,a,e)+'</div></div>'+
          '<div class="pmeta">'+unitSel(it,a)+(typeSel(it,a)||'<span></span>')+'</div>'+
          '<input class="b-note" type="text" value="'+esc(it.note)+'" placeholder="Coaching cue, e.g. Seated or kneeling" data-in="pdItem" data-f="note"'+a+'>'+
          '<p class="plabel">Each week: sets × '+(it.unit==='time'?'seconds':'reps')+', then weight (lb, blank for Auto)</p><div class="pweeks">'+weeks+'</div>'+pbAutoLine(it,c&&c.id,cname)+copyBtn(a)+'</div>';}).join('');
    }
    return '<section class="pday'+(desk&&ui.pdDay===di?' on':'')+'"><div class="pday-head"><input class="pday-name" type="text" value="'+esc(d.name)+'" aria-label="Day name" data-in="pdDayName" data-d="'+di+'">'+
      (draft.days.length>1?'<button class="icon-btn" aria-label="Remove '+esc(d.name)+'" data-act="pdDayDel" data-d="'+di+'">'+ICON.trash+'</button>':'')+'</div>'+body+
      '<button class="btn'+(desk?'':' btn-block')+'" data-act="pdAddEx" data-d="'+di+'">'+ICON.plus+(desk?(ui.pdDay===di?'Adding to '+esc(d.name)+' from the library below':'Add exercises to '+esc(d.name)):'Add exercise to '+esc(d.name))+'</button></section>';}).join('');
  var t=wType(draft.type);
  return backBtn()+'<div class="page-head"><div><h1>'+(draft.id?(isT?'Edit program template':'Edit program'):(isT?'New program template':'New program'))+'</h1><p class="lede">'+(isT?'Reusable. Assign it to any client from the Templates tab.':'For '+esc(c.name)+'. Days aren’t tied to dates: '+esc(cname)+' picks the day and enters the date when they log it.')+'</p></div></div>'+
    '<div class="pfields"><label class="field"><span>Program name</span><input type="text" value="'+esc(draft.title)+'" placeholder="e.g. February program" data-in="draftField" data-f="title"></label>'+
    '<label class="field"><span>Weeks</span><input type="number" min="1" max="16" value="'+N+'" data-ch="pdWeeks"></label></div>'+
    '<label class="field"><span>Notes shown at the start of every session (optional)</span><textarea data-in="draftField" data-f="notes" placeholder="e.g. Warm up with a 5 minute walk, or run through each exercise without weight first.">'+esc(draft.notes)+'</textarea></label>'+
    '<div class="field"><span>Workout type (optional)</span>'+typeChips(draft.type,'pdType')+'<p class="hint" style="margin:8px 0 0">'+(t?typeHint(t)+'Reps are set for every exercise. Blank weights are worked out '+(isT?'for each client':'for '+esc(cname))+' from 1RM and RPE.':'Pick a training goal to set reps for the whole program and base weights on 1RM and RPE. You can still change any exercise.')+'</p></div>'+
    '<h3>Days</h3>'+days+
    (desk?'<section class="lib-below" id="lib-below" aria-label="Exercise library">'+libPane(true)+'</section>':'')+
    (draft.id&&!isT?'<button class="btn-link" data-act="progToTemplate" data-id="'+draft.id+'">'+ICON.copy+'Save as a program template</button>':'')+
    (draft.id?'<button class="btn-link btn-danger" data-act="delProgram" data-id="'+draft.id+'" style="margin-left:16px">Delete program</button>':'')+
    '<div class="cta-row cta-bar"><button class="btn big" data-act="pdAddDay">'+ICON.plus+'Add day</button><button class="btn btn-primary big" data-act="saveDraft">'+(isT?'Save template':draft.id?'Save changes':'Save for '+esc(cname))+'</button></div>';
}
function saveProgramDraft(){
  var d=draft,title=d.title.trim();
  if(!title){toast('Give the program a name first.');return;}
  if(!d.days.some(function(x){return x.items.length;})){toast('Add at least one exercise first.');return;}
  var days=[];
  for(var di=0;di<d.days.length;di++){var dy=d.days[di],items=[];
    for(var ii=0;ii<dy.items.length;ii++){var it=dy.items[ii],wks=[];
      for(var k=0;k<d.weeks;k++){var r=parseRx(it.rx[k],it.unit);if(!r){ui.pdErr={d:di,i:ii,k:k};render();toast('Week '+(k+1)+' of '+ex(it.exId).name+' in '+(dy.name||'Day '+(di+1))+' needs sets \u00d7 '+(it.unit==='time'?'seconds':'reps')+', like 3x10.');return;}
        var wv=String(it.wt[k]==null?'':it.wt[k]).trim();if(wv&&(num(wv)===null||num(wv)<0)){ui.pdErr={d:di,i:ii,k:k,f:'w'};render();toast('Week '+(k+1)+' weight for '+ex(it.exId).name+' needs a number in lb. Leave it blank for Auto.');return;}
        r.weight=wv?String(clean(num(wv))):'';wks.push(r);}
      items.push({id:it.id,exId:it.exId,unit:it.unit,type:it.unit==='time'?'':(it.type||''),weight:'',note:it.note.trim(),weeks:wks});}
    days.push({id:dy.id,name:dy.name.trim()||'Day '+(di+1),items:items});}
  ui.pdErr=null;
  var pg=d.id?progOf(d.id):null;if(!pg){pg={id:'pg-'+uid(),createdAt:Date.now()};S.programs.push(pg);}
  pg.title=title;pg.weeks=d.weeks;pg.type=d.type||'';pg.notes=d.notes.trim();pg.days=days;pg.clientId=d.isTemplate?null:d.clientId;pg.isTemplate=d.isTemplate;pg.updatedAt=Date.now();
  persistIn('programs',function(){return S.programs;},pg.id);
  var who=d.clientId&&client(d.clientId);draft=null;draft0='';back();toast(d.isTemplate?'Program template saved':who?'Program saved for '+firstName(who.name):'Program saved');
}
function startSession(p,wk,di){
  var x=sessFor(p,wk,di);if(x){go(x.status==='completed'?'workout':'log',{id:x.id});return;}
  var day=p.days[di];if(!day)return;
  var w={id:uid(),clientId:p.clientId,programId:p.id,programTitle:p.title,week:wk,dayIndex:di,title:day.name+', week '+(wk+1),date:TODAY(),notes:p.notes||'',status:'assigned',completedAt:null,loggedBy:null,timer:null,
    items:day.items.map(function(it){var r=it.weeks[wk]||it.weeks[it.weeks.length-1]||{sets:3,reps:10},ww=r.weight!==undefined?r.weight:it.weight;return {id:uid(),exId:it.exId,unit:it.unit||'reps',type:it.type||'',sets:r.sets,reps:String(r.reps),weight:ww!==''&&ww!=null?String(ww):autoWeight(p.clientId,it.exId,it.type,r.reps,it.unit),note:it.note||'',timer:null,clientNote:'',log:blankLog(r.sets)};})};
  S.workouts.push(w);persistW(w.id);go('log',{id:w.id});
}
function programCard(p){
  ui.pw=ui.pw||{};var wk=ui.pw[p.id]!=null&&ui.pw[p.id]<p.weeks?ui.pw[p.id]:curWeek(p),st=progStats(p),nx=nextUp(p);
  var chipsH='<div class="chips wk-chips">'+Array.apply(null,Array(p.weeks)).map(function(_,k){var all=p.days.every(function(d,di){var x=sessFor(p,k,di);return x&&x.status==='completed';});return '<button class="chip'+(k===wk?' on':'')+(all?' done':'')+'" data-act="pWeek" data-p="'+p.id+'" data-w="'+k+'">'+(all?'\u2713 ':'')+'Week '+(k+1)+'</button>';}).join('')+'</div>';
  var rows=p.days.map(function(d,di){var x=sessFor(p,wk,di),tag=x&&x.status==='completed'?'<span class="tag ok">'+ICON.check+'Done '+shortDate(x.date)+'</span>':x&&started(x)?'<span class="tag acc">In progress</span>':'';
    return '<button class="row" data-act="pStart" data-p="'+p.id+'" data-w="'+wk+'" data-d="'+di+'"><span class="pday-n">'+(di+1)+'</span><span class="row-main"><span class="row-title">'+esc(d.name)+'</span><span class="row-sub">'+esc(d.items.map(function(it){return ex(it.exId).name;}).slice(0,3).join(', ')+(d.items.length>3?', +'+(d.items.length-3)+' more':''))+'</span></span>'+tag+'</button>';}).join('');
  var cta=nx?'<button class="btn btn-primary btn-block big" data-act="pStart" data-p="'+p.id+'" data-w="'+nx.wk+'" data-d="'+nx.di+'">'+(nx.s&&started(nx.s)?'Continue ':'Start ')+esc(p.days[nx.di].name)+', week '+(nx.wk+1)+'</button>':'<p class="result" style="margin:0">Program complete. Nice work!</p>';
  return '<div class="prog-card"><div class="prog-head"><div><h2>'+esc(p.title)+'</h2><p class="muted">Week '+(curWeek(p)+1)+' of '+p.weeks+'. '+st.done+' of '+st.total+' sessions done.</p></div></div>'+
    '<div class="prog-bar" aria-hidden="true"><span style="width:'+(st.total?Math.round(100*st.done/st.total):0)+'%"></span></div>'+cta+
    '<p class="hint" style="margin:14px 0 8px">Do the days in any order. Pick a week to see its days.</p>'+chipsH+'<div class="list">'+rows+'</div><button class="btn-link" data-act="openProgram" data-id="'+p.id+'">See the whole program, week by week</button></div>';
}
function programGrid(p){
  var st=progStats(p),cols='minmax(96px,1.3fr) repeat('+p.weeks+',minmax(54px,1fr))';
  var head='<span></span>'+Array.apply(null,Array(p.weeks)).map(function(_,k){return '<span class="pg-h">Wk '+(k+1)+'</span>';}).join('');
  var rows=p.days.map(function(d,di){var cells='';for(var k=0;k<p.weeks;k++){var x=sessFor(p,k,di),lbl=d.name+', week '+(k+1);
      if(x&&x.status==='completed')cells+='<button class="pcell done" data-act="pStart" data-p="'+p.id+'" data-w="'+k+'" data-d="'+di+'" aria-label="'+esc(lbl)+', done '+shortDate(x.date)+'">'+ICON.check+'<small>'+shortDate(x.date)+'</small></button>';
      else if(x&&started(x))cells+='<button class="pcell prog" data-act="pStart" data-p="'+p.id+'" data-w="'+k+'" data-d="'+di+'" aria-label="'+esc(lbl)+', in progress"><small>Started</small></button>';
      else cells+='<button class="pcell" data-act="pStart" data-p="'+p.id+'" data-w="'+k+'" data-d="'+di+'" aria-label="'+esc(lbl)+', not started, log in person"><small>\u2013</small></button>';}
    return '<span class="pg-day">'+esc(d.name)+'</span>'+cells;}).join('');
  return '<div class="prog-card"><div class="prog-head"><div><h2>'+esc(p.title)+'</h2><p class="muted">'+plural(p.weeks,'week')+', '+plural(p.days.length,'day')+' a week. '+st.done+' of '+st.total+' sessions done.</p></div>'+
    '<div class="prog-btns"><button class="btn btn-primary sm" data-act="openProgram" data-id="'+p.id+'">Full table</button><button class="btn sm" data-act="editProgram" data-id="'+p.id+'">Edit</button></div></div>'+
    '<div class="prog-bar" aria-hidden="true"><span style="width:'+(st.total?Math.round(100*st.done/st.total):0)+'%"></span></div>'+
    '<div class="pgrid-wrap"><div class="pgrid" style="grid-template-columns:'+cols+'">'+head+rows+'</div></div><p class="hint" style="margin:8px 0 0">Tap a done cell to see the results, or an empty one to log that session in person. Full table shows every exercise, week by week, with weights, results, and RPE.</p></div>';
}
function vProgramTemplates(seg){
  var list=S.programs.filter(function(p){return p.isTemplate;});
  var head='<div class="page-head"><h1>Templates</h1><button class="btn sm" data-act="newProgramTpl">'+ICON.plus+'New program</button></div><p class="lede" style="margin:-4px 0 14px">Multi-week programs you can give to any client. Each client gets their own copy.</p>'+seg;
  if(!list.length)return head+empty('No program templates yet','Build one here, or open a client\u2019s program and tap Save as a program template.','<button class="btn btn-primary" data-act="newProgramTpl">New program</button>');
  if(isDesk())return head+'<div class="tgrid-cards">'+list.map(function(p){return '<div class="tcard"><button class="tpl-open" data-act="editProgram" data-id="'+p.id+'"><span class="row-title">'+esc(p.title)+'</span><span class="row-sub">'+plural(p.weeks,'week')+', '+plural(p.days.length,'day')+' a week</span></button>'+
    '<ul class="tcard-ex">'+p.days.map(function(d){return '<li><span>'+esc(d.name)+'</span><span class="muted">'+plural(d.items.length,'exercise')+'</span></li>';}).join('')+'</ul><div class="tcard-act"><button class="btn sm" data-act="editProgram" data-id="'+p.id+'">Edit</button><button class="btn btn-primary sm" data-act="assignProgram" data-id="'+p.id+'">Assign</button></div></div>';}).join('')+'</div>';
  return head+'<div class="list">'+list.map(function(p){return '<div class="row tpl-row"><button class="tpl-open" data-act="editProgram" data-id="'+p.id+'"><span class="row-title">'+esc(p.title)+'</span><span class="row-sub">'+plural(p.weeks,'week')+', '+plural(p.days.length,'day')+' a week</span></button><button class="btn btn-primary sm" data-act="assignProgram" data-id="'+p.id+'">Assign</button></div>';}).join('')+'</div>';
}
function copyProgram(p,o){return {id:'pg-'+uid(),createdAt:Date.now(),title:o.title||p.title,weeks:p.weeks,type:p.type||'',notes:p.notes||'',clientId:o.clientId||null,isTemplate:!!o.template,fromTemplate:o.from||null,
  days:p.days.map(function(d){return {id:uid(),name:d.name,items:d.items.map(function(it){return {id:uid(),exId:it.exId,unit:it.unit||'reps',type:it.type||'',weight:o.clearWeights?'':(it.weight||''),note:it.note||'',weeks:clone(it.weeks).map(function(r){if(o.clearWeights)r.weight='';return r;})};})};})};}

/* ---------- templates ---------- */
function vTemplates(){
  var seg='<div class="seg" style="margin:0 0 14px">'+[['workouts','Workouts'],['programs','Programs']].map(function(x){return '<button class="'+((ui.tplSeg||'workouts')===x[0]?'on':'')+'" data-act="tplSeg" data-s="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';
  if(ui.tplSeg==='programs')return vProgramTemplates(seg);
  return vWorkoutTemplates(seg);
}
function vWorkoutTemplates(seg){
  if(isDesk()&&S.templates.length){
    var cards=S.templates.map(function(t){return '<div class="tcard"><button class="tpl-open" data-act="editTemplate" data-id="'+t.id+'"><span class="row-title">'+esc(t.title)+'</span><span class="row-sub">'+plural(t.items.length,'exercise')+(t.timer?'. '+esc(timerText(t.timer)):'')+'</span></button>'+
      '<ul class="tcard-ex">'+t.items.map(function(it){return '<li><span>'+esc(ex(it.exId).name)+'</span><span class="muted">'+it.sets+' × '+esc(it.reps)+'</span></li>';}).join('')+'</ul>'+
      '<div class="tcard-act"><button class="btn sm" data-act="editTemplate" data-id="'+t.id+'">Edit</button><button class="btn btn-primary sm" data-act="assignTemplate" data-id="'+t.id+'">Assign</button></div></div>';}).join('');
    return '<div class="page-head"><h1>Templates</h1><button class="btn sm" data-act="newTemplate">'+ICON.plus+'New template</button></div><p class="lede" style="margin:-4px 0 18px">Build a workout once, then assign it to one client or all of them.</p>'+seg+'<div class="tgrid-cards">'+cards+'</div>';
  }
  var rows=S.templates.map(function(t){return '<div class="row tpl-row"><button class="tpl-open" data-act="editTemplate" data-id="'+t.id+'"><span class="row-title">'+esc(t.title)+'</span><span class="row-sub">'+plural(t.items.length,'exercise')+(t.timer?'. '+esc(timerText(t.timer)):'')+'</span></button><button class="btn btn-primary sm" data-act="assignTemplate" data-id="'+t.id+'">Assign</button></div>';}).join('');
  return '<div class="page-head"><h1>Templates</h1><button class="btn sm" data-act="newTemplate">'+ICON.plus+'New</button></div><p class="lede" style="margin:-4px 0 14px">Build a workout once, then assign it to one client or all of them. Tap a template to edit it.</p>'+seg+
    (S.templates.length?'<div class="list">'+rows+'</div>':empty('No templates yet','Build one here, or open any workout and tap Save as template.','<button class="btn btn-primary" data-act="newTemplate">New template</button>'));
}
function tplFrom(src,title){return {id:'t-'+uid(),createdAt:Date.now(),title:title||src.title||'Untitled template',type:src.type||'',notes:src.notes||'',timer:clone(src.timer),items:src.items.map(function(it){return {id:uid(),exId:it.exId,type:it.type||'',sets:parseInt(it.sets,10)||3,reps:String(it.reps||'10'),weight:'',note:it.note||'',timer:clone(it.timer)};})};}
function assignSheet(id){
  var t=tplOf(id);if(!t)return;
  openSheet('<h2 class="sheet-title">Assign '+esc(t.title)+'</h2><p>Each client gets their own copy of this workout on the date you pick.</p>'+
    '<label class="field"><span>Date</span><input id="as-date" type="date" value="'+TODAY()+'"></label>'+
    '<div class="field"><span>Clients</span><div class="list"><label class="check-row"><input type="checkbox" id="as-all" data-ch="asAll"> All clients ('+S.clients.length+')</label>'+
    S.clients.map(function(c){return '<label class="check-row"><input type="checkbox" class="as-c" value="'+c.id+'" data-ch="asOne"> '+esc(c.name)+'</label>';}).join('')+'</div></div>'+
    '<p class="hint" style="margin-top:-4px">Where the template leaves weight blank, each client gets the weight from their last session.</p>'+
    '<p class="err" id="as-err" hidden></p>'+
    '<button class="btn btn-primary btn-block big" id="as-go" data-act="assignConfirm" data-id="'+t.id+'">Assign</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');
}
function asCount(){var n=document.querySelectorAll('.as-c:checked').length,b=$('#as-go');if(b)b.textContent=n?'Assign to '+plural(n,'client'):'Assign';var all=$('#as-all');if(all)all.checked=n>0&&n===document.querySelectorAll('.as-c').length;}

/* ---------- dashboard ---------- */
function weekStart(isoStr){var d=parseISO(isoStr);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d);}
function shiftDate(isoStr,n){var d=parseISO(isoStr);d.setDate(d.getDate()+n);return iso(d);}
function statusOf(w){if(w.status==='completed')return {t:'Done',c:'ok'};var dn=exDoneCount(w),any=w.items.some(function(it){return it.log.some(function(s){return s.done;});});if(dn||any)return {t:'In progress',c:'acc',sub:dn+' of '+plural(w.items.length,'exercise')+' done'};return {t:'Not started',c:''};}
function personRow(c,title,sub,tag,act,id){return '<button class="row" data-act="'+act+'" data-id="'+id+'"><span class="avatar" aria-hidden="true">'+esc(initials(c.name))+'</span><span class="row-main"><span class="row-title">'+title+'</span><span class="row-sub">'+sub+'</span></span>'+tag+'</button>';}
function vDashboard(){
  var t=TODAY(),ws0=weekStart(t),we=shiftDate(ws0,6),d7=addDays(-6);
  var mine=S.workouts.filter(function(w){return client(w.clientId);});
  var wk=mine.filter(function(w){return w.date>=ws0&&w.date<=we;});
  var doneW=wk.filter(function(w){return w.status==='completed';}),doneN=doneW.length,setsN=doneW.reduce(function(a,w){return a+w.items.reduce(function(b,it){return b+it.log.filter(function(x){return x.done;}).length;},0);},0);
  var prs=[];mine.forEach(function(w){if(w.status==='completed'&&w.date>=d7)prsIn(w).forEach(function(p){prs.push({p:p,w:w});});});
  prs.sort(function(a,b){return (b.w.completedAt||0)-(a.w.completedAt||0);});
  var activeN=S.clients.filter(function(c){return wsFor(c.id).some(function(w){return w.status==='completed'&&w.date>=d7;});}).length;
  var stats='<div class="stats four"><div><b>'+doneN+'</b><span>Workouts done this week</span></div><div><b>'+setsN+'</b><span>Sets logged this week</span></div><div><b>'+prs.length+'</b><span>New PRs, last 7 days</span></div><div><b>'+activeN+' of '+S.clients.length+'</b><span>Clients active, last 7 days</span></div></div>';
  var todays=mine.filter(function(w){return w.date===t;});
  var todayH='<h3>Today</h3>'+(todays.length?'<div class="list">'+todays.map(function(w){var c=client(w.clientId),st=statusOf(w);return personRow(c,esc(c.name),esc(w.title)+(st.sub?'. '+st.sub:''),'<span class="tag '+st.c+'">'+st.t+'</span>','openWorkout',w.id);}).join('')+'</div>':'<p class="muted">No workouts scheduled today.</p>');
  var fresh=mine.filter(function(w){return w.status==='completed'&&w.trainerSeen===false;}).sort(function(a,b){return (b.completedAt||0)-(a.completedAt||0);});
  var freshH=fresh.length?'<h3>New results</h3><div class="list review">'+fresh.map(function(w){var c=client(w.clientId),n=prsIn(w).length;
    var sub='Finished '+fmtLc(w.date)+(n?', '+n+' PR'+(n>1?'s':''):'')+(w.effort?', felt '+w.effort.toLowerCase():'')+(w.clientSummary?'. \u201c'+w.clientSummary.slice(0,70)+(w.clientSummary.length>70?'\u2026':'')+'\u201d':'');
    return personRow(c,esc(c.name)+': '+esc(w.title),esc(sub),'<span class="tag acc">New</span>','openWorkout',w.id);}).join('')+'</div>':'';
  var att=[];
  S.clients.forEach(function(c){if(!upcoming(c.id).length&&!activeProgs(c.id).length)att.push(personRow(c,esc(c.name),'Nothing scheduled','<span class="tag">Plan</span>','openClient',c.id));});
  var attH='<h3>Needs a plan</h3>'+(att.length?'<div class="list">'+att.join('')+'</div>':'<p class="muted">Every client has a workout or program to do.</p>');
  var days='';for(var i=0;i<7;i++){var d=shiftDate(ws0,i),list=mine.filter(function(w){return w.date===d;}),dn=list.filter(function(w){return w.status==='completed';}).length,dt=parseISO(d);
    days+='<div class="day'+(d===t?' today':'')+'"><span>'+dt.toLocaleDateString('en-US',{weekday:'short'})+'</span><b>'+dt.getDate()+'</b><small>'+(list.length?dn+'/'+list.length:'\u2013')+'</small></div>';}
  var weekH='<h3>This week</h3><div class="week">'+days+'</div><p class="hint">Workouts done out of workouts scheduled each day.</p>';
  var prH=prs.length?'<h3>Recent personal records</h3><div class="list">'+prs.slice(0,6).map(function(x){var c=client(x.w.clientId);return personRow(c,esc(c.name),esc(ex(x.p.exId).name)+': '+setLong(x.p)+', '+fmtLc(x.w.date),'<span class="tag pr">PR</span>','openWorkout',x.w.id);}).join('')+'</div>':'';
  var now=new Date(),dateTxt=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  if(!S.clients.length)return '<div class="page-head"><div><h1>Hi, '+esc(S.trainer.first)+'</h1><p class="lede">'+dateTxt+'</p></div></div>'+empty('No clients yet','Add your first client to start building workouts.','<button class="btn btn-primary" data-act="addClient">Add client</button>');
  return '<div class="page-head"><div><h1>Hi, '+esc(S.trainer.first)+'</h1><p class="lede">'+dateTxt+'</p></div></div>'+stats+'<div class="cols"><div>'+todayH+attH+'</div><div>'+freshH+weekH+prH+'</div></div>';
}

/* ---------- music ---------- */
var MUSIC=null;
function musicInfo(url){
  url=String(url||'').trim();if(!/^https?:\/\//i.test(url))return null;var m;
  if((m=url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/)))
    return {host:'Spotify',kind:m[1],embed:'https://open.spotify.com/embed/'+m[1]+'/'+m[2]+'?utm_source=generator',h:80,open:url};
  if((m=url.match(/music\.apple\.com\/([a-z]{2})\/(playlist|album|station)\/([^\/?#]+)\/([^\/?#]+)/)))
    return {host:'Apple Music',kind:m[2],embed:'https://embed.music.apple.com/'+m[1]+'/'+m[2]+'/'+m[3]+'/'+m[4],h:175,open:url};
  if(/music\.youtube\.com/i.test(url))return {host:'YouTube Music',kind:'playlist',open:url};
  if(/(youtube\.com|youtu\.be)/i.test(url))return {host:'YouTube',kind:'playlist',open:url};
  try{var h=new URL(url).hostname.replace(/^www\./,'');return {host:h,kind:'link',open:url};}catch(e){return null;}
}
function musicCard(c){
  var m=c.playlist?musicInfo(c.playlist):null;
  if(m){var playing=MUSIC&&MUSIC.open===m.open;
    return '<div class="music-card"><div class="mc-head">'+ICON.music+'<div><b>Workout music</b><span>'+esc(m.host)+' '+esc(m.kind)+(c.playlistBy==='trainer'?', picked by '+esc(S.trainer.first):'')+'</span></div></div><div class="mc-btns">'+
      (m.embed?'<button class="btn btn-primary sm" data-act="musicPlay"'+(playing?' disabled':'')+'>'+(playing?'Playing below':'Play here')+'</button>':'')+
      '<a class="btn sm" href="'+esc(m.open)+'" target="_blank" rel="noopener">Open in '+esc(m.host)+'</a><button class="btn-link" data-act="musicEdit">Change</button></div></div>';}
  return '<div class="music-card"><div class="mc-head">'+ICON.music+'<div><b>Workout music</b><span>Add a Spotify or Apple Music playlist to play here while you train, or open your music app.</span></div></div><div class="mc-btns">'+
    '<button class="btn btn-primary sm" data-act="musicEdit">Add playlist</button><a class="btn sm" href="https://open.spotify.com" target="_blank" rel="noopener">Spotify</a><a class="btn sm" href="https://music.apple.com" target="_blank" rel="noopener">Apple Music</a><a class="btn sm" href="https://music.youtube.com" target="_blank" rel="noopener">YouTube Music</a></div></div>';
}
function playMusic(url){
  var m=musicInfo(url);if(!m||!m.embed)return;
  if(MUSIC&&MUSIC.open===m.open)return;MUSIC=m;var el=$('#music');
  el.innerHTML='<div class="music-top"><span>'+ICON.music+esc(m.host)+'</span><a href="'+esc(m.open)+'" target="_blank" rel="noopener">Open app</a><button class="icon-btn" data-act="musicClose" aria-label="Close music player">'+ICON.x+'</button></div>'+
    '<iframe src="'+esc(m.embed)+'" height="'+m.h+'" title="'+esc(m.host)+' player" allow="autoplay *; clipboard-write; encrypted-media *; fullscreen *; picture-in-picture" loading="lazy"></iframe>';
  el.hidden=false;if(!isDesk())document.documentElement.style.setProperty('--mh',(m.h+46)+'px');
}
function stopMusic(){MUSIC=null;var el=$('#music');if(el){el.hidden=true;el.innerHTML='';}document.documentElement.style.setProperty('--mh','0px');}
function musicSheet(cid){
  var c=client(cid);if(!c)return;ui.musicFor=cid;
  openSheet('<h2 class="sheet-title">Workout music</h2><p>In Spotify or Apple Music, open a playlist, tap Share, then Copy link, and paste it here.</p>'+
    '<label class="field"><span>Playlist link</span><input id="mu-url" type="url" value="'+esc(c.playlist||'')+'" placeholder="https://open.spotify.com/playlist/..." autocomplete="off"></label>'+
    '<p class="err" id="mu-err" hidden></p><button class="btn btn-primary btn-block" data-act="musicSave">Save playlist</button>'+
    (c.playlist?'<button class="btn btn-block btn-danger" data-act="musicRemove">Remove playlist</button>':'<button class="btn btn-block" data-act="closeSheet">Cancel</button>'));
}
function homeSheet(cid){
  var c=client(cid);if(!c)return;ui.homeFor=cid;
  openSheet('<h2 class="sheet-title">'+esc(firstName(c.name))+'’s home screen</h2><p>This message shows under their name at the top of their home screen.</p>'+
    '<label class="field"><span>Motivation message</span><textarea id="mo-text" maxlength="160" placeholder="e.g. Stronger than last month. Keep stacking good weeks.">'+esc(c.motivation||'')+'</textarea></label>'+
    (S.clients.length>1?'<label class="check-row" style="border:0;padding:0 0 14px"><input type="checkbox" id="mo-all"> Use this message for all clients</label>':'')+
    '<label class="field"><span>Workout playlist (optional)</span><input id="mo-music" type="url" value="'+esc(c.playlist||'')+'" placeholder="Spotify or Apple Music link" autocomplete="off"></label>'+
    '<p class="hint" style="margin-top:-6px">'+esc(firstName(c.name))+' can change the playlist from their home screen.</p>'+
    '<p class="err" id="mo-err" hidden></p><button class="btn btn-primary btn-block" data-act="homeSave">Save</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');
}

/* ---------- community ---------- */
function me(){return S.role==='trainer'?'trainer':S.viewAs;}
function feedName(a){var i,l=[S.posts,S.comments,S.likes];for(var j=0;j<l.length;j++)for(i=0;i<l[j].length;i++)if(l[j][i].author===a&&l[j][i].authorName)return l[j][i].authorName;return '';}
function who(a){if(a==='trainer')return {name:S.trainer.name,first:S.trainer.first,t:true};var c=client(a);if(c)return {name:c.name,first:firstName(c.name)};var n=feedName(a);return n?{name:n,first:firstName(n)}:{name:'Former client',first:'Former client'};}
function avatarOf(a,size){var w=who(a);return '<span class="avatar'+(w.t?' av-t':'')+(size?' '+size:'')+'" aria-hidden="true">'+esc(initials(w.name))+'</span>';}
function ago(ts){var s=(Date.now()-(ts||0))/1000;if(s<60)return 'Just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' hr ago';var d=new Date(ts),y=new Date();y.setDate(y.getDate()-1);if(d.toDateString()===y.toDateString())return 'Yesterday';return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function linkify(t){return esc(t).replace(/https?:\/\/[^\s<]+/g,function(u){var tail='',m=u.match(/[.,!?)\]]+$/);if(m){tail=m[0];u=u.slice(0,-tail.length);}return '<a href="'+u+'" target="_blank" rel="noopener nofollow">'+u+'</a>'+tail;});}
function replies(n){return n===1?'1 reply':n+' replies';}
function wSnap(w){return {wid:w.id,title:w.title,date:w.date,effort:w.effort||'',result:w.timerResult||'',
  items:w.items.map(function(it){var b=bestSet(it),n=it.log.filter(function(s){return s.done;}).length;return {name:ex(it.exId).name,best:b?setShort(b):'',sets:n};}).filter(function(x){return x.sets>0;}),
  prs:prsIn(w).map(function(p){return ex(p.exId).name+' '+setShort(p);})};}
function wshareHTML(x){
  return '<div class="wshare"><div class="wshare-head"><b>'+esc(x.title)+'</b><span>'+shortDate(x.date)+(x.effort?', felt '+esc(x.effort.toLowerCase()):'')+'</span></div>'+
    '<ul>'+x.items.map(function(i){return '<li><span>'+esc(i.name)+'</span><span>'+(i.best?esc(i.best):plural(i.sets,'set'))+'</span></li>';}).join('')+'</ul>'+
    (x.result?'<p class="hint" style="margin:6px 0 0">Timer result: '+esc(x.result)+'</p>':'')+
    (x.prs&&x.prs.length?'<div class="wshare-pr"><span class="tag pr">'+(x.prs.length>1?x.prs.length+' PRs':'PR')+'</span><span>'+esc(x.prs.join(', '))+'</span></div>':'')+'</div>';
}
function unreadComm(){var m=me(),t=(S.seen&&S.seen[m])||0;return S.posts.some(function(p){return p.author!==m&&(p.createdAt||0)>t;})||S.comments.some(function(c){return c.author!==m&&(c.createdAt||0)>t;});}
function postCard(p){
  var a=who(p.author),m=me(),isT=S.role==='trainer',canDel=isT||p.author===m;
  var cm=S.comments.filter(function(c){return c.postId===p.id;}).sort(function(x,y){return (x.createdAt||0)-(y.createdAt||0);});
  var lk=S.likes.filter(function(l){return l.postId===p.id;}),liked=lk.some(function(l){return l.author===m;});
  var open=ui.openCmts&&ui.openCmts[p.id],shown=open?cm:cm.slice(-3);
  var likers=lk.map(function(l){return l.author===m?'You':who(l.author).first;}).join(', ');
  return '<article class="post'+(p.pinned?' pinned':'')+'"><div class="post-head">'+avatarOf(p.author,'sm')+'<div class="post-who"><b>'+esc(a.name)+(a.t?'<span class="tag acc">Trainer</span>':'')+(p.pinned?'<span class="tag">Pinned</span>':'')+'</b><span>'+ago(p.createdAt)+'</span></div>'+
    (canDel?'<button class="icon-btn" data-act="postDel" data-id="'+p.id+'" aria-label="Delete post">'+ICON.trash+'</button>':'')+'</div>'+
    (p.text?'<div class="post-text">'+linkify(p.text)+'</div>':'')+(p.workout?wshareHTML(p.workout):'')+
    '<div class="post-act"><button class="like'+(liked?' on':'')+'" aria-pressed="'+liked+'" data-act="likeToggle" data-post="'+p.id+'"'+(likers?' title="Liked by '+esc(likers)+'"':'')+'>'+ICON.heart+(lk.length?lk.length:'Like')+'</button>'+(cm.length?'<span class="muted">'+replies(cm.length)+'</span>':'')+'</div>'+
    '<div class="cmts">'+(cm.length>shown.length?'<button class="btn-link" data-act="cmtAll" data-post="'+p.id+'">View all '+replies(cm.length)+'</button>':'')+
    shown.map(function(c){var ca=who(c.author);return '<div class="cmt">'+avatarOf(c.author,'xs')+'<div class="cmt-body"><b>'+esc(ca.name)+'</b><span class="muted">'+ago(c.createdAt)+'</span><p>'+linkify(c.text)+'</p></div>'+((isT||c.author===m)?'<button class="icon-btn" data-act="cmtDel" data-id="'+c.id+'" aria-label="Delete reply">'+ICON.trash+'</button>':'')+'</div>';}).join('')+
    '<div class="reply-row"><input type="text" class="reply-in" data-post="'+p.id+'" placeholder="Reply to '+esc(p.author===m?'this post':a.first)+'" aria-label="Write a reply" maxlength="500" autocomplete="off"><button class="btn sm" data-act="cmtSend" data-post="'+p.id+'">Send</button></div></div></article>';
}
function vCommunity(){
  var m=me(),isT=S.role==='trainer';S.seen=S.seen||{};S.seen[m]=Date.now();savePrefs();
  var posts=S.posts.slice().sort(function(a,b){return (b.pinned?1:0)-(a.pinned?1:0)||(b.createdAt||0)-(a.createdAt||0);});
  var sw=ui.shareW?workout(ui.shareW):null;
  var composer='<div class="composer"><textarea id="post-text" rows="3" maxlength="2000" aria-label="Write a post" placeholder="'+(isT?'Share an update, tip, or link with all your clients':'Share a win, ask a question, or say hello')+'" data-in="postDraft">'+esc(ui.postDraft||'')+'</textarea>'+
    (sw?'<div class="attach">'+wshareHTML(wSnap(sw))+'<button class="btn-link muted" data-act="shareWClear">Remove workout</button></div>':'')+
    '<div class="composer-row">'+(isT?'<label class="pin-row"><input type="checkbox" data-ch="postPin"'+(ui.postPin?' checked':'')+'> Pin to top</label>':'<button class="btn sm" data-act="pickShareW">'+ICON.list+'Share a workout</button>')+'<button class="btn btn-primary sm" data-act="postSend">Post</button></div></div>';
  var feed=posts.length?posts.map(postCard).join(''):empty('No posts yet',isT?'Start things off with a welcome post for your clients.':'Be the first to share a workout or say hello.');
  var people=[{id:'trainer'}].concat(S.clients.map(function(c){return {id:c.id};}));
  S.posts.concat(S.comments).forEach(function(x){if(x.author&&x.author!=='trainer'&&!people.some(function(p){return p.id===x.author;}))people.push({id:x.author});});
  var side='<h3>Members</h3><div class="list">'+people.map(function(x){var n=S.posts.filter(function(p){return p.author===x.id;}).length,w=who(x.id);
    return '<div class="row member">'+avatarOf(x.id,'xs')+'<span class="row-main"><span class="row-title">'+esc(w.name)+(x.id===m?' (you)':'')+'</span><span class="row-sub">'+(w.t?'Trainer':plural(n,'post'))+'</span></span></div>';}).join('')+'</div>'+
    '<p class="hint">Keep it encouraging. '+esc(S.trainer.first)+' can remove any post or reply.</p>';
  return '<div class="page-head"><div><h1>Community</h1><p class="lede">'+(isT?'Post updates and tips for all your clients, and cheer on what they share.':'Share workouts and wins, ask questions, and cheer each other on.')+'</p></div></div>'+
    '<div class="comm-grid"><div class="feed">'+composer+feed+'</div><aside class="comm-side desk-only">'+side+'</aside></div>';
}
function goCommunity(){stopRest();stack=[];route={name:'community',params:{}};render();window.scrollTo(0,0);setTimeout(function(){var t=$('#post-text');if(t)t.focus();},60);}

/* ---------- client home + progress ---------- */
function todayCard(w){
  var started=w.items.some(function(it){return it.log.some(function(s){return s.done;});});
  return '<div class="today"><h2>'+esc(w.title)+'</h2><p>Today, from '+esc(S.trainer.first)+(w.timer?'<br>'+ICON.timer+esc(timerText(w.timer)):'')+'</p><ul>'+w.items.map(function(it){var e=ex(it.exId),t=targetText(it);
    return '<li><span>'+esc(e.name)+(e.video?'<button class="tv" data-act="video" data-ex="'+e.id+'" aria-label="Watch '+esc(e.name)+' video">'+ICON.play+'</button>':'')+(it.timer?'<span class="tv-t" title="Has a timer">'+ICON.timer+'</span>':'')+'</span><b>'+t.main+'</b></li>';}).join('')+
    '</ul><button class="btn btn-inverse btn-block big" data-act="openWorkout" data-id="'+w.id+'">'+(started?'Continue workout':'Start workout')+'</button></div>';
}
function vHome(){
  if(!S.clients.length)return empty('No clients yet','Switch to the trainer view to add one.');
  var c=client(S.viewAs);if(!c){S.viewAs=S.clients[0].id;c=S.clients[0];}
  var up=upcoming(c.id),dn=completed(c.id),progs=activeProgs(c.id),doneProgs=S.programs.filter(function(p){return p.clientId===c.id&&!p.isTemplate&&progStats(p).total&&progStats(p).done>=progStats(p).total;});
  var todays=up.filter(function(w){return w.date===TODAY();});
  var doneToday=dn.filter(function(w){return w.date===TODAY();})[0];
  var hero;
  if(todays.length||progs.length)hero=todays.map(todayCard).join('')+progs.map(programCard).join('');
  else if(doneToday)hero='<div class="calm"><h2>Done for today</h2><p>'+esc(doneToday.title)+' is logged. '+esc(S.trainer.first)+' can see your results.</p></div>';
  else{var nx=up[0];hero='<div class="calm"><h2>'+(nx?'Rest day':'Nothing scheduled')+'</h2><p>'+(nx?'Next up: '+esc(nx.title)+', '+fmtLc(nx.date)+'.':esc(S.trainer.first)+' will add your next workout here.')+'</p></div>';}
  var later=up.filter(function(w){return w.date!==TODAY();});
  return '<div class="page-head"><div><h1>Hi, '+esc(firstName(c.name))+'</h1>'+(c.motivation?'<p class="motto">\u201c'+esc(c.motivation)+'\u201d<span>From '+esc(S.trainer.first)+'</span></p>':'')+'</div></div><div class="cols"><div>'+hero+musicCard(c)+'</div><div>'+
    (later.length?'<h3>To do</h3><div class="list">'+later.map(workoutRow).join('')+'</div>':'')+(doneProgs.length?'<h3>Finished programs</h3>'+doneProgs.map(programCard).join(''):'')+
    (dn.length?'<h3>Recent</h3><div class="list">'+dn.slice(0,5).map(workoutRow).join('')+'</div>':'')+'</div></div>';
}
function vProgressPage(p){return '<div class="page-head"><div><h1>Gainz</h1><p class="lede">Your workouts, lifts, and personal records over time.</p></div></div>'+progressView(S.viewAs,p);}
function e1rm(w,r){return r<=1?w:w*(1+r/30);}
function wVolume(w){var v=0;w.items.forEach(function(it){it.log.forEach(function(s){if(s.done)v+=(num(s.w)||0)*(parseInt(s.r,10)||0);});});return v;}
function fmtK(n){n=Math.round(n);return n>=1000?(Math.round(n/100)/10)+'k':String(n);}
function progressView(cid,p){
  var ps=p.psub||'overview';
  var seg='<div class="seg">'+[['overview','Overview'],['exercises','Exercises'],['records','Records'],['pct','% Chart']].map(function(x){return '<button class="'+(ps===x[0]?'on':'')+'" data-act="progSub" data-sub="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';
  if(ps==='pct')return seg+pctChart(cid,p);
  if(!completed(cid).length)return seg+empty('No results yet',S.role==='client'?'Finish a workout and your progress shows up here.':'Once '+esc(firstName(client(cid).name))+' logs a workout, progress shows up here.')+maxesBlock(cid);
  return seg+(ps==='records'?progRecords(cid):ps==='exercises'?progExercise(cid,p):progOverview(cid));
}
function progOverview(cid){
  var t=TODAY(),f30=addDays(-29),ws0=weekStart(t),all=wsFor(cid);
  var w30=all.filter(function(w){return w.status==='completed'&&w.date>=f30;}),d30=w30.length,s30=w30.reduce(function(a,w){return a+w.items.reduce(function(b,it){return b+it.log.filter(function(x){return x.done;}).length;},0);},0);
  var weeks={};all.forEach(function(w){if(w.status==='completed'){var k=weekStart(w.date);weeks[k]=(weeks[k]||0)+1;}});
  var streak=0,cur=weeks[ws0]?ws0:shiftDate(ws0,-7);while(weeks[cur]){streak++;cur=shiftDate(cur,-7);}
  var labels=[],doneV=[],missV=[],volV=[];
  for(var i=7;i>=0;i--){var a=shiftDate(ws0,-7*i),b=shiftDate(a,6),d=0,m=0,v=0;all.forEach(function(w){if(w.date<a||w.date>b)return;if(w.status==='completed'){d++;v+=wVolume(w);}else if(w.date<t)m++;});labels.push(shortDate(a));doneV.push(d);missV.push(m);volV.push(v);}
  var prs=[];completed(cid).forEach(function(w){if(w.date>=f30)prsIn(w).forEach(function(p){prs.push({p:p,w:w});});});
  return '<div class="stats" style="margin-top:14px"><div><b>'+d30+'</b><span>Workouts, last 30 days</span></div><div><b>'+s30+'</b><span>Sets, last 30 days</span></div><div><b>'+plural(streak,'week')+'</b><span>Weekly streak</span></div></div>'+
    '<div class="cols"><div><h3>Lift progress</h3>'+liftProgress(cid)+'</div><div>'+
    '<h3>Weekly volume</h3><div class="chart-box">'+barChart(labels,[volV],{fmt:fmtK,label:'Pounds lifted per week'})+'</div><p class="hint">Total pounds lifted: weight times reps for every logged set.</p></div></div>'+
    (prs.length?'<h3>Recent personal records</h3><div class="list">'+prs.sort(function(a,b){return b.w.date.localeCompare(a.w.date);}).slice(0,5).map(function(x){return '<button class="row" data-act="progOpenEx" data-ex="'+x.p.exId+'"><span class="row-main"><span class="row-title">'+esc(ex(x.p.exId).name)+'</span><span class="row-sub">'+setLong(x.p)+', '+fmtLc(x.w.date)+'</span></span><span class="tag pr">PR</span></button>';}).join('')+'</div><button class="btn-link" data-act="progSub" data-sub="records">See all records</button>':'');
}
function liftProgress(cid){
  var rows=exIdsFor(cid).map(function(id){
    var h=history(cid,id).filter(function(x){return x.best.w>0;});if(h.length<2)return null;
    var a=h[0].best.w,b=h[h.length-1].best.w;
    return {id:id,a:a,b:b,d:b-a,pct:a?Math.round(100*(b-a)/a):0,from:h[0].w.date,vals:h.map(function(x){return x.best.w;})};
  }).filter(Boolean).sort(function(x,y){return y.pct-x.pct||y.d-x.d;});
  if(!rows.length)return '<p class="muted">Shows up once an exercise has been logged with weight in at least two sessions.</p>';
  return '<div class="list">'+rows.slice(0,6).map(function(r){
    return '<button class="row" data-act="progOpenEx" data-ex="'+r.id+'"><span class="row-main"><span class="row-title">'+esc(ex(r.id).name)+'</span><span class="row-sub">'+clean(r.a)+' to '+clean(r.b)+' lb since '+shortDate(r.from)+'</span></span>'+spark(r.vals)+
      '<span class="delta'+(r.d>0?' up':r.d<0?' down':'')+'"><b>'+(r.d>0?'+':'')+clean(r.d)+' lb</b><small>'+(r.pct>0?'+':'')+r.pct+'%</small></span></button>';}).join('')+'</div>'+
    '<p class="hint">Heaviest set in the first session compared with the latest one. Tap a lift to see its full chart.</p>';
}
function spark(vals){
  var W=64,H=26,mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);if(mn===mx){mn-=1;mx+=1;}
  var pts=vals.map(function(v,i){return (vals.length===1?W/2:3+i*(W-6)/(vals.length-1)).toFixed(1)+','+(H-3-(H-6)*(v-mn)/(mx-mn)).toFixed(1);});
  var last=pts[pts.length-1].split(',');
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" aria-hidden="true"><polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="3" fill="var(--accent)"/></svg>';
}
function exIdsFor(cid){var ids=[];completed(cid).forEach(function(w){w.items.forEach(function(it){if(bestSet(it)&&ids.indexOf(it.exId)<0)ids.push(it.exId);});});return ids;}
function progExercise(cid,p){
  var ids=exIdsFor(cid),sel=p.ex&&ids.indexOf(p.ex)>-1?p.ex:ids[0];
  var h=history(cid,sel),useW=h.some(function(x){return x.best.w>0;});
  var metric=p.metric||'best';if(!useW&&metric==='e1rm')metric='best';
  var timed=h.length&&h[0].item.unit==='time';
  var opts=useW?[['best','Heaviest set'],['e1rm','Est. 1-rep max'],['volume','Volume']]:timed?[['best','Longest set'],['volume','Total time']]:[['best','Most reps'],['volume','Total reps']];
  var vals=h.map(function(x){var ds=x.item.log.filter(function(s){return s.done;});
    if(metric==='volume')return ds.reduce(function(a,s){var r=parseInt(s.r,10)||0;return a+(useW?(num(s.w)||0)*r:r);},0);
    if(metric==='e1rm')return Math.round(Math.max.apply(null,ds.map(function(s){return setE1(num(s.w)||0,parseInt(s.r,10)||0,x.item.rpe);})));
    return useW?x.best.w:x.best.r;});
  var unit=useW?' lb':timed?' sec':' reps';
  var best=h.reduce(function(b,x){return (!b||x.best.w>b.w||(x.best.w===b.w&&x.best.r>b.r))?x.best:b;},null);
  var delta=vals[vals.length-1]-vals[0];
  var sessions=h.slice().reverse().map(function(x){return '<div class="sess"><span class="sess-d">'+shortDate(x.w.date)+'</span><div class="setchips">'+x.item.log.filter(function(s){return s.done;}).map(function(s){return '<span class="setchip">'+setShort({w:num(s.w)||0,r:parseInt(s.r,10)||0,u:x.item.unit})+'</span>';}).join('')+(x.item.rpe?'<span class="tag">RPE '+x.item.rpe+'</span>':'')+'</div></div>';}).join('');
  return '<label class="field" style="margin-top:14px"><span>Exercise</span><select data-ch="progEx">'+ids.map(function(id){return '<option value="'+id+'"'+(id===sel?' selected':'')+'>'+esc(ex(id).name)+'</option>';}).join('')+'</select></label>'+
    '<div class="chiprow">'+opts.map(function(o){return '<button class="chip'+(o[0]===metric?' on':'')+'" data-act="progMetric" data-m="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div>'+
    '<div class="stats"><div><b>'+setShort(best)+'</b><span>Best set</span></div><div><b>'+(h.length<2?'\u2013':(delta>0?'+':'')+fmtK(delta)+unit)+'</b><span>'+(h.length<2?'Needs 2 sessions':'Change since '+shortDate(h[0].w.date))+'</span></div><div><b>'+h.length+'</b><span>'+(h.length===1?'Session':'Sessions')+'</span></div></div>'+
    '<div class="chart-box">'+chart(h,vals,metric==='volume'?fmtK:null)+'</div><p class="hint">Yellow points are new highs.'+(metric==='e1rm'?' Estimated one-rep max is worked out from the best set in each session, using the RPE when it was logged.':'')+'</p>'+
    '<h3>Sessions</h3><div class="list">'+sessions+'</div>';
}
var PCTS=[50,55,60,65,70,75,80,85,90,93];
function pctRows(m){if(!(m>0))return '<p class="muted" style="margin:10px 0">Enter a 1-rep max to see the weights.</p>';
  return '<div class="list pct-list"><div class="pct-row pct-h"><span>%</span><span>Weight</span><span></span></div>'+PCTS.map(function(p){var x=m*p/100,w=roundW(x);
    return '<div class="pct-row"><span class="pct-p">'+p+'%</span><span class="pct-w"><b>'+clean(w)+'</b> lb<small>'+(clean(x)!==clean(w)?clean(x)+' exact':'')+'</small></span><span class="pct-bar"><i style="width:'+p+'%"></i></span></div>';}).join('')+
    '<div class="pct-row pct-max"><span class="pct-p">100%</span><span class="pct-w"><b>'+clean(m)+'</b> lb<small>1-rep max</small></span><span class="pct-bar"><i style="width:100%"></i></span></div></div>'+
    '<p class="hint">Weights are rounded to the nearest 5 lb (2.5 lb under 25 lb) so they load on the bar.</p>';}
function pctChart(cid,p){
  var lib=liveLib().filter(canLoad),withMax=[],rest=[];
  lib.forEach(function(e){var m=maxInfo(cid,e.id);(m?withMax:rest).push({e:e,m:m});});
  var byName=function(a,b){return a.e.name.localeCompare(b.e.name);};withMax.sort(byName);rest.sort(byName);
  var all=withMax.concat(rest);if(!all.length)return empty('No lifts yet','Add a weighted exercise to the library to build a percentage chart.');
  var sel=p.pctEx&&findIn(S.library,p.pctEx)?p.pctEx:(withMax[0]||all.find(function(x){return /back squat/i.test(x.e.name);})||all[0]).e.id;
  var mi=maxInfo(cid,sel),key=sel,ov=p.pct1rm&&p.pct1rm[key],m=ov!=null&&ov!==''?num(ov):(mi?roundW(mi.v):null);
  var opt=function(x){return '<option value="'+x.e.id+'"'+(x.e.id===sel?' selected':'')+'>'+esc(x.e.name)+'</option>';};
  return '<p class="muted" style="margin:14px 0 12px">Training weights for each percentage of a 1-rep max.</p>'+
    '<label class="field"><span>Lift</span><select data-ch="pctEx">'+(withMax.length?'<optgroup label="Has a 1-rep max">'+withMax.map(opt).join('')+'</optgroup><optgroup label="Other lifts">'+rest.map(opt).join('')+'</optgroup>':all.map(opt).join(''))+'</select></label>'+
    '<label class="field"><span>1-rep max (lb)</span><input type="number" inputmode="decimal" min="0" step="any" id="pct-1rm" data-in="pct1rm" data-ex="'+sel+'" value="'+(m>0?clean(m):'')+'" placeholder="e.g. 200"></label>'+
    '<p class="hint" id="pct-src" style="margin:-6px 0 12px">'+(ov!=null&&ov!==''?'Using the number you entered.'+(mi?' Gainz has '+maxText(mi,true)+'.':''):mi?'From '+maxText(mi,true)+'. Type over it to try another number.':'No 1-rep max on file for this lift yet. Type one in.')+'</p>'+
    '<div id="pct-table">'+pctRows(m)+'</div>';
}
function progRecords(cid){
  var rows=exIdsFor(cid).map(function(id){var h=history(cid,id),best=null,bestE=0,last=h[h.length-1];
    h.forEach(function(x){x.item.log.forEach(function(s){if(!s.done)return;var w=num(s.w)||0,r=parseInt(s.r,10)||0;if(!best||w>best.w||(w===best.w&&r>best.r))best={w:w,r:r};bestE=Math.max(bestE,setE1(w,r,x.item.rpe));});});
    return {id:id,best:best,e:bestE,last:last.w.date,n:h.length};}).sort(function(a,b){return b.last.localeCompare(a.last);});
  return maxesBlock(cid)+'<h3>Best lifts</h3><p class="hint" style="margin:0 0 10px">Every exercise logged. The 1RM shown is the one workout types use for starting weights. Tap one to see its chart.</p><div class="list">'+rows.map(function(r){var m=r.best.w>0?maxInfo(cid,r.id):null;
    return '<button class="row" data-act="progOpenEx" data-ex="'+r.id+'"><span class="row-main"><span class="row-title">'+esc(ex(r.id).name)+'</span><span class="row-sub">Best: '+setLong(r.best)+(m?'. '+maxText(m):'')+'. Last done '+fmtLc(r.last)+'.</span></span></button>';}).join('')+'</div>';
}
function barChart(labels,series,opts){
  opts=opts||{};var W=320,H=150,pl=6,pr=6,pt=18,pb=22,n=labels.length;
  var tot=labels.map(function(_,i){return series.reduce(function(a,s){return a+(s[i]||0);},0);}),mx=Math.max.apply(null,tot.concat([1]));
  var bw=(W-pl-pr)/n,g='';
  labels.forEach(function(l,i){var x=pl+i*bw+bw*0.2,w=bw*0.6,y0=H-pb;
    series.forEach(function(s,k){var v=s[i]||0;if(!v)return;var hh=(H-pt-pb)*v/mx;y0-=hh;g+='<rect x="'+x.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="2" fill="'+(k===0?'var(--accent)':'var(--warn)')+'"'+(k?' opacity=".7"':'')+'/>';});
    var v0=series[0][i]||0;if(v0)g+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(y0-4).toFixed(1)+'" text-anchor="middle">'+(opts.fmt?opts.fmt(v0):v0)+'</text>';
    if(i%2===1||i===n-1)g+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+esc(l)+'</text>';});
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opts.label||'Bar chart')+'"><line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'" stroke="var(--line)"/>'+g+'</svg>';
}
function chart(h,vals,fmt){
  var useW=!fmt&&h.some(function(x){return x.best.w>0;});
  var W=320,H=160,pl=34,pr=14,pt=14,pb=26;
  var mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
  if(mn===mx){mn-=5;mx+=5;}var pad=(mx-mn)*0.15;mn=Math.max(0,mn-pad);mx=mx+pad;if(useW){mn=Math.floor(mn/5)*5;mx=Math.ceil(mx/5)*5;if((mx-mn)%10)mx+=5;}
  function X(i){return h.length===1?pl+(W-pl-pr)/2:pl+i*(W-pl-pr)/(h.length-1);}
  function Y(v){return pt+(H-pt-pb)*(1-(v-mn)/(mx-mn));}
  var run=-Infinity,pts=vals.map(function(v,i){var isPR=i>0&&v>run;run=Math.max(run,v);return {x:X(i),y:Y(v),v:v,pr:isPR};});
  var grid=[mn,(mn+mx)/2,mx].map(function(g){var y=Y(g);return '<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/><text x="'+(pl-6)+'" y="'+(y+3)+'" text-anchor="end">'+(fmt?fmt(g):Math.round(g))+'</text>';}).join('');
  var line='<polyline points="'+pts.map(function(p){return p.x.toFixed(1)+','+p.y.toFixed(1);}).join(' ')+'" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  var dots=pts.map(function(p){return '<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(p.pr?5.5:4)+'" fill="'+(p.pr?'var(--pr)':'var(--surface)')+'" stroke="'+(p.pr?'var(--pr-ink)':'var(--accent)')+'" stroke-width="2"/>';}).join('');
  var xl='<text x="'+pts[0].x+'" y="'+(H-6)+'" text-anchor="'+(h.length===1?'middle':'start')+'">'+shortDate(h[0].w.date)+'</text>'+(h.length>1?'<text x="'+pts[pts.length-1].x+'" y="'+(H-6)+'" text-anchor="end">'+shortDate(h[h.length-1].w.date)+'</text>':'');
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Progress per session, '+plural(h.length,'session')+'">'+grid+line+dots+xl+'</svg>';
}

/* ---------- timers ---------- */
var TIMER_TYPES=[['emom','EMOM'],['amrap','AMRAP'],['intervals','Intervals'],['fortime','For time'],['rest','Rest']];
var TDESC={emom:'Start a new round at the top of every interval and rest with whatever time is left. Use blocks to repeat it with rest in between.',amrap:'As many rounds as possible before time runs out. Use blocks to repeat it with rest in between.',intervals:'Alternate work and rest for a set number of rounds.',fortime:'Count up until the work is done. Choose no cap to use it as a stopwatch.',rest:'A single rest countdown between sets. On an exercise, it also starts on its own each time a set is checked off.'};
var TOPTS={every:[15,20,30,40,45,60,75,90,120,150,180,240,300],rest:[0,10,15,20,30,40,45,60,90,120,150,180,240,300],work:[5,10,15,20,30,40,45,60,90,120,180,240,300],amrap:[60,120,180,240,300,360,420,480,540,600,720,900,1080,1200,1500,1800,2400],cap:[0,300,420,600,720,900,1200,1500,1800,2400,3000,3600],restlen:[15,20,30,45,60,75,90,120,150,180,240,300]};
function mmss(sec){sec=Math.max(0,Math.round(sec));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function timerDefaults(type){return clone({emom:{type:'emom',every:60,rounds:10,blocks:1,rest:120},amrap:{type:'amrap',work:600,blocks:1,rest:60},intervals:{type:'intervals',work:20,rest:10,rounds:8},fortime:{type:'fortime',cap:1200},rest:{type:'rest',rest:restSecFor(S.role==='client'?S.viewAs:null)}}[type]);}
function restSecFor(cid){var c=cid?client(cid):null;return (c&&c.restSec)||60;}
function timerText(t){
  if(!t)return '';
  if(t.type==='emom')return 'EMOM, every '+mmss(t.every)+' for '+plural(t.rounds,'round')+(t.blocks>1?', '+t.blocks+' blocks'+(t.rest?' with '+mmss(t.rest)+' rest':''):'');
  if(t.type==='amrap')return 'AMRAP '+mmss(t.work)+(t.blocks>1?' × '+t.blocks+(t.rest?' with '+mmss(t.rest)+' rest':''):'');
  if(t.type==='rest')return 'Rest '+mmss(t.rest)+' between sets';
  if(t.type==='intervals')return 'Intervals, '+mmss(t.work)+' on'+(t.rest?' and '+mmss(t.rest)+' off':'')+' × '+t.rounds;
  return 'For time'+(t.cap?', '+mmss(t.cap)+' cap':', no cap');
}
function buildPhases(t){
  if(t.type==='rest')return [{kind:'prep',label:'Get ready',dur:0},{kind:'rest',label:'Rest',dur:t.rest}];
  var P=[{kind:'prep',label:'Get ready',dur:10}],b,r;
  if(t.type==='emom'){for(b=1;b<=t.blocks;b++){for(r=1;r<=t.rounds;r++)P.push({kind:'work',label:(t.blocks>1?'Block '+b+', round ':'Round ')+r+' of '+t.rounds,dur:t.every});if(b<t.blocks&&t.rest)P.push({kind:'rest',label:'Rest',dur:t.rest});}}
  else if(t.type==='amrap'){for(b=1;b<=t.blocks;b++){P.push({kind:'work',label:t.blocks>1?'Block '+b+' of '+t.blocks:'Work',dur:t.work,block:b});if(b<t.blocks&&t.rest)P.push({kind:'rest',label:'Rest',dur:t.rest});}}
  else if(t.type==='intervals'){for(r=1;r<=t.rounds;r++){P.push({kind:'work',label:'Work '+r+' of '+t.rounds,dur:t.work});if(r<t.rounds&&t.rest)P.push({kind:'rest',label:'Rest',dur:t.rest});}}
  else P.push({kind:'up',label:t.cap?'Time cap '+mmss(t.cap):'Go',dur:t.cap||Infinity});
  return P;
}
function timerTotal(t){var s=0;buildPhases(t).forEach(function(p){if(p.kind!=='prep'&&isFinite(p.dur))s+=p.dur;});return s;}
function tSel(f,label,opts){var v=ui.tcfg[f];if(opts.indexOf(v)<0)opts=opts.concat([v]).sort(function(a,b){return a-b;});
  return '<label class="field"><span>'+label+'</span><select data-ch="tField" data-f="'+f+'">'+opts.map(function(o){return '<option value="'+o+'"'+(o===v?' selected':'')+'>'+(o===0?(f==='cap'?'No cap':'No rest'):mmss(o)+(f==='rest'&&ui.tcfg.type==='rest'&&o===60?' (default)':''))+'</option>';}).join('')+'</select></label>';}
function tNumF(f,label){return '<label class="field"><span>'+label+'</span><input type="text" inputmode="numeric" value="'+esc(ui.tcfg[f])+'" data-in="tNum" data-f="'+f+'"></label>';}
function tSummary(){var tot=timerTotal(ui.tcfg);return esc(timerText(ui.tcfg))+(tot?'<br><span class="muted" style="font-weight:500">'+(ui.tcfg.type==='rest'?'Starts counting the moment you tap Start':mmss(tot)+' total, plus a 10 second countdown')+'</span>':'');}
function tForm(){
  var t=ui.tcfg;
  var h='<div class="seg" style="margin-top:4px">'+TIMER_TYPES.map(function(x){return '<button class="'+(t.type===x[0]?'on':'')+'" data-act="tType" data-type="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';
  h+='<p class="hint" style="margin:8px 0 12px">'+TDESC[t.type]+'</p><div class="tgrid">';
  if(t.type==='emom')h+=tSel('every','Every',TOPTS.every)+tNumF('rounds','Rounds')+tNumF('blocks','Blocks')+tSel('rest','Rest between blocks',TOPTS.rest);
  else if(t.type==='amrap')h+=tSel('work','Time',TOPTS.amrap)+tNumF('blocks','Blocks')+tSel('rest','Rest between blocks',TOPTS.rest);
  else if(t.type==='intervals')h+=tSel('work','Work',TOPTS.work)+tSel('rest','Rest',TOPTS.rest)+tNumF('rounds','Rounds')+'<div class="field"><span>Preset</span><button class="btn btn-block" data-act="tTabata">Tabata</button></div>';
  else if(t.type==='rest'){h+=tSel('rest','Rest length',TOPTS.restlen);}
  else h+=tSel('cap','Time cap',TOPTS.cap);
  var auto='';
  if(t.type==='rest'&&ui.tctx&&ui.tctx.scope==='page'&&S.role==='client'){var rc=client(S.viewAs),ron=!!rc&&rc.restTimer!==false;if(rc)auto='<div class="set-row" style="margin:0 0 12px"><div><b>Start after each set</b><span>Counts down '+mmss(t.rest)+' each time you check off a set.</span></div><button class="switch" role="switch" aria-checked="'+ron+'" aria-label="Start the rest timer after each set" data-act="restToggle"></button></div>';}
  else if(t.type==='rest'&&ui.tctx&&ui.tctx.scope==='item')auto='<p class="hint" style="margin:0 0 12px">Starts on its own each time the client checks off a set of this exercise.</p>';
  return h+'</div>'+auto+'<div class="tsum" id="tsum">'+tSummary()+'</div>';
}
function draftItem(id){var r=null;if(draft)draft.items.forEach(function(d){if(d.id===id)r=d;});return r;}
function timerSheet(ctx){
  ui.tctx=ctx;
  var cur=ctx.scope==='item'?draftItem(ctx.id).timer:ctx.scope==='workout'?draft.timer:null;
  ui.tcfg=clone(cur)||(ctx.scope==='free'&&S.freeTimer?clone(S.freeTimer):timerDefaults('emom'));
  var title=ctx.scope==='item'?'Timer for '+esc(ex(draftItem(ctx.id).exId).name):ctx.scope==='workout'?'Workout timer':'Timer';
  var btns=ctx.scope==='free'?'<button class="btn btn-primary btn-block big" data-act="tStartFree">Start timer</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>':
    '<button class="btn btn-primary btn-block" data-act="tSave">Save timer</button>'+(cur?'<button class="btn btn-block btn-danger" data-act="tRemove">Remove timer</button>':'<button class="btn btn-block" data-act="closeSheet">Cancel</button>');
  openSheet('<h2 class="sheet-title">'+title+'</h2><div id="tform">'+tForm()+'</div>'+btns);
}
function timerCard(w){
  if(!w.timer)return '';
  return '<div class="timer-card"><div><b>Workout timer</b><span>'+esc(timerText(w.timer))+'</span>'+(w.timerResult?'<small class="result">Result: '+esc(w.timerResult)+'</small>':'')+'</div><button class="btn btn-primary sm" data-act="ckStart" data-w="'+w.id+'">'+ICON.timer+'Start</button></div>';
}
function vTimer(){
  if(!ui.tctx||ui.tctx.scope!=='page'){ui.tctx={scope:'page'};ui.tcfg=clone(S.freeTimer)||timerDefaults('emom');}
  var assigned='';
  if(S.role==='client'){
    var rows=[];
    upcoming(S.viewAs).forEach(function(w){
      if(w.timer)rows.push({w:w,it:null,name:w.title+' (whole workout)',t:w.timer});
      w.items.forEach(function(it){if(it.timer)rows.push({w:w,it:it,name:ex(it.exId).name,t:it.timer});});
    });
    if(rows.length)assigned='<h3>From your workouts</h3><div class="list">'+rows.slice(0,6).map(function(r){return '<div class="row"><span class="row-main"><span class="row-title">'+esc(r.name)+'</span><span class="row-sub">'+esc(timerText(r.t))+'. '+esc(r.w.title)+', '+fmtLc(r.w.date)+'</span></span><button class="btn btn-primary sm" data-act="ckStart" data-w="'+r.w.id+'"'+(r.it?' data-it="'+r.it.id+'"':'')+'>Start</button></div>';}).join('')+'</div>';
  }
  return '<div class="page-head"><h1>Timer</h1></div><p class="lede" style="margin:-4px 0 14px">Pick a format, set the times, and start. A beep and a color change mark each round and rest. Choose Rest for the countdown between sets.</p>'+
    '<div class="cols"><div>'+assigned+(assigned?'':'<h3 class="desk-only">Your own timer</h3>')+'</div><div>'+(assigned?'<h3>Your own timer</h3>':'')+'<div id="tform">'+tForm()+'</div><div class="cta-bar"><button class="btn btn-primary btn-block big" data-act="tStartFree">Start timer</button></div></div></div>';
}

/* clock */
var CK=null,ckInt=null,AC=null,WL=null,ckMuted=false;
function unlockAudio(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();}catch(e){}}
function beep(f,d){if(ckMuted||!AC)return;try{var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.4,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+0.05);}catch(e){}}
function vib(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function wakeOn(){try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(l){WL=l;}).catch(function(){});}catch(e){}}
function wakeOff(){try{if(WL)WL.release();}catch(e){}WL=null;}
function ckTitle(){if(CK.ctx&&CK.ctx.title)return CK.ctx.title;for(var i=0;i<TIMER_TYPES.length;i++)if(TIMER_TYPES[i][0]===CK.t.type)return TIMER_TYPES[i][1];return 'Timer';}
function ckQ(s){return document.querySelector('#clock '+s);}
function openClock(t,ctx){
  stopRest();unlockAudio();
  var P=buildPhases(t);
  CK={t:clone(t),ctx:ctx||null,P:P,idx:0,start:0,pausedAt:0,running:false,started:false,done:false,lastSec:null,total:timerTotal(t),amrap:[]};
  if(t.type==='amrap')for(var b=0;b<t.blocks;b++)CK.amrap.push(0);
  var el=$('#clock');el.hidden=false;document.body.style.overflow='hidden';
  el.innerHTML='<div class="ck-top"><button data-act="ckClose">Close</button><span class="ck-type">'+esc(ckTitle())+'</span><button data-act="ckMute" aria-pressed="'+ckMuted+'">'+(ckMuted?'Sound off':'Sound on')+'</button></div>'+
    '<div class="ck-body">'+(CK.ctx&&CK.ctx.title?'<p class="ck-sub">'+esc(timerText(t))+'</p>':'')+'<p class="ck-phase"></p><div class="ck-time">0:00</div><div class="ck-bar"'+(CK.total?'':' hidden')+'><span></span></div><p class="ck-next"></p>'+
    (t.type==='amrap'?'<button class="ck-round" data-act="ckRound">+1 round<b>0</b></button>':'')+'</div>'+
    '<div class="ck-ctl"><button data-act="ckRestart">Reset</button>'+(t.type==='fortime'?'<button data-act="ckFinishBtn">Finish</button>':'')+'<button class="ck-main" data-act="ckToggle">Start</button></div>';
  ckPaint();clearInterval(ckInt);ckInt=setInterval(ckTick,100);ckTick();wakeOn();
}
function ckPaint(){
  if(!CK.started){$('#clock').dataset.kind='prep';ckQ('.ck-phase').textContent='Ready';ckQ('.ck-next').textContent='Tap Start for a 10 second countdown.';var r0=ckQ('.ck-round');if(r0)r0.hidden=true;return;}
  var ph=CK.P[CK.idx],nx=CK.P[CK.idx+1];
  $('#clock').dataset.kind=ph.kind;
  ckQ('.ck-phase').textContent=ph.label;
  ckQ('.ck-next').textContent=nx?'Next: '+(nx.kind==='rest'?'Rest '+mmss(nx.dur):nx.label):(ph.kind==='up'||CK.P.length<=2?'':'Last one');
  var rb=ckQ('.ck-round');if(rb){rb.hidden=ph.kind!=='work';rb.querySelector('b').textContent=CK.amrap[(ph.block||1)-1]||0;}
}
function ckTick(){
  if(!CK||CK.done)return;
  if(!CK.started){var f=CK.P[1],te=ckQ('.ck-time');if(te)te.textContent=!f||f.kind==='up'?'0:00':mmss(f.dur);return;}
  var now=CK.running?Date.now():CK.pausedAt,ph=CK.P[CK.idx],el=(now-CK.start)/1000;
  if(CK.running){
    var changed=false;
    while(el>=ph.dur){CK.start+=ph.dur*1000;CK.idx++;if(CK.idx>=CK.P.length){ckFinish(false);return;}ph=CK.P[CK.idx];el=(now-CK.start)/1000;changed=true;}
    if(changed){beep(ph.kind==='rest'?520:880,.45);vib(300);CK.lastSec=null;ckPaint();}
    if(ph.kind!=='up'){var s=Math.ceil(ph.dur-el);if(s<=3&&s>=1&&CK.lastSec!==s){CK.lastSec=s;beep(660,.12);}}
  }
  var tEl=ckQ('.ck-time');if(tEl)tEl.textContent=ph.kind==='up'?mmss(Math.floor(el)):mmss(Math.ceil(ph.dur-el-0.0001));
  var bar=ckQ('.ck-bar span');
  if(bar&&CK.total){var d=0;for(var i=0;i<CK.idx;i++)if(CK.P[i].kind!=='prep')d+=CK.P[i].dur;if(ph.kind!=='prep')d+=Math.min(el,ph.dur);bar.style.width=Math.min(100,100*d/CK.total).toFixed(2)+'%';}
}
function amrapText(){var sum=CK.amrap.reduce(function(a,b){return a+b;},0);return CK.amrap.length>1?'Rounds '+CK.amrap.join(', ')+' ('+sum+' total)':plural(sum,'round');}
function ckFinish(manual){
  var now=CK.running?Date.now():CK.pausedAt,t=CK.t;
  if(t.type==='fortime')CK.result=manual?'Finished in '+mmss(Math.floor((now-CK.start)/1000)):'Hit the '+mmss(t.cap)+' time cap';
  else if(t.type==='amrap')CK.result=amrapText();
  else if(t.type==='rest')CK.result='Rest is up. Ready for the next set.';
  else CK.result='All '+plural(t.type==='emom'?t.rounds*t.blocks:t.rounds,'round')+' done';
  CK.running=false;CK.done=true;clearInterval(ckInt);beep(990,.7);vib([200,100,200]);ckDone();
}
function ckDone(){
  var el=$('#clock');el.dataset.kind='done';
  var canSave=!!(CK.ctx&&CK.ctx.w&&(CK.t.type==='amrap'||CK.t.type==='fortime'));
  var adj=CK.t.type==='amrap'?CK.amrap.map(function(n,b){return '<div class="ck-adj"><span>'+(CK.amrap.length>1?'Block '+(b+1):'Rounds')+'</span><button data-act="ckAdj" data-b="'+b+'" data-d="-1" aria-label="One fewer round">−</button><b>'+n+'</b><button data-act="ckAdj" data-b="'+b+'" data-d="1" aria-label="One more round">+</button></div>';}).join(''):'';
  el.innerHTML='<div class="ck-top"><button data-act="ckClose">Close</button><span class="ck-type">'+esc(ckTitle())+'</span><span style="width:64px"></span></div>'+
    '<div class="ck-body"><p class="ck-phase">Done</p><p class="ck-result">'+esc(CK.result)+'</p>'+(adj?'<div class="ck-adjs">'+adj+'<p class="ck-next">Miscounted? Fix it here before saving.</p></div>':'')+'</div>'+
    '<div class="ck-ctl"><button data-act="ckRestart">Go again</button>'+(canSave?'<button class="ck-main" data-act="ckSave">Save result</button>':'<button class="ck-main" data-act="ckClose">Close</button>')+'</div>';
}
function ckClose(){clearInterval(ckInt);wakeOff();var el=$('#clock');el.hidden=true;el.innerHTML='';document.body.style.overflow='';CK=null;}

/* ---------- prototype strip + tabs + render ---------- */
function demoBar(){
  if(HOSTED){if(!ACCOUNT||MODE!=='db')return '';return '<div class="wrap demo-in">'+(S.role==='trainer'?'<button class="btn-link proto" data-act="editTrainer" title="Change your name">'+esc(S.trainer.name)+', trainer</button>':'<span class="proto">'+esc((client(S.viewAs)||{name:ACCOUNT.email}).name)+'</span>')+'<span class="acct-mail">'+esc(ACCOUNT.email)+'</span><button class="btn sm" data-act="signOut">Sign out</button></div>';}
  return '<div class="wrap demo-in"><span class="proto">Gainz prototype</span><select id="as" data-ch="viewAs" aria-label="View as"><option value="trainer"'+(S.role==='trainer'?' selected':'')+'>Trainer: '+esc(S.trainer.name)+'</option>'+
    S.clients.map(function(c){return '<option value="'+c.id+'"'+(S.role==='client'&&S.viewAs===c.id?' selected':'')+'>Client: '+esc(c.name)+'</option>';}).join('')+'</select>'+(MODE==='local'?'<span class="tag warn" title="Changes stay on this device">This device only</span>':'')+'</div>';
}
function tabList(){return S.role==='trainer'?[['dashboard','Home',ICON.home],['clients','Clients',ICON.users],['templates','Templates',ICON.copy],['library','Exercises',ICON.book],['community','Community',ICON.chat],['timer','Timer',ICON.timer]]:[['home','Workouts',ICON.list],['timer','Timer',ICON.timer],['progress','Gainz',ICON.chart],['community','Community',ICON.chat]];}
function activeTab(){return route.name==='community'?'community':route.name==='timer'?'timer':S.role==='trainer'?(route.name==='library'?'library':route.name==='dashboard'?'dashboard':(route.name==='templates'||(route.name==='builder'&&draft&&(draft.kind==='template'||(draft.kind==='program'&&draft.isTemplate))))?'templates':'clients'):(route.name==='progress'?'progress':'home');}
function tabsHTML(){var a=activeTab();return '<div class="tabs-in">'+tabList().map(function(t){return '<button class="tab'+(t[0]===a?' on':'')+'" data-act="tab" data-tab="'+t[0]+'"'+(t[0]===a?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span>'+(t[0]==='community'&&a!=='community'&&unreadComm()?'<i class="dot" aria-label="New posts"></i>':'')+'</button>';}).join('')+'</div>';}
function sideHTML(){
  var a=activeTab(),who=S.role==='trainer'?esc(S.trainer.name)+', trainer':esc((client(S.viewAs)||{name:''}).name)+', client';
  return '<div class="side-brand"><b>Gainz</b><span>Workout Tracker</span></div><div class="side-nav">'+tabList().map(function(t){return '<button class="side-item'+(t[0]===a?' on':'')+'" data-act="tab" data-tab="'+t[0]+'"'+(t[0]===a?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span>'+(t[0]==='community'&&a!=='community'&&unreadComm()?'<i class="dot" aria-label="New posts"></i>':'')+'</button>';}).join('')+'</div><div class="side-foot">'+(HOSTED?'Signed in as '+who+'<br><button class="btn-link" data-act="signOut">Sign out</button>':'Viewing as '+who)+'</div>';
}
var VIEWS={program:vProgramView,community:vCommunity,dashboard:vDashboard,templates:vTemplates,clients:vClients,client:vClient,workout:vWorkout,log:vLog,builder:vBuilder,library:vLibrary,home:vHome,progress:vProgressPage,timer:vTimer};
var ALLOW={trainer:['program','community','dashboard','templates','clients','client','workout','log','builder','library','timer'],client:['home','workout','log','progress','timer','community','program']};
var rendering=false;
function render(){if(rendering)return;rendering=true;try{renderNow();}finally{rendering=false;}}
function renderNow(){
  $('#demo').innerHTML=demoBar();
  if(HOSTED&&MODE!=='db'){document.body.classList.add('signed-out');$('#main').className='wrap';$('#main').innerHTML=authScreen();$('#tabs').innerHTML='';$('#side').innerHTML='';return;}
  document.body.classList.remove('signed-out');
  renderPending=false;
  if(isDesk()&&route.name==='client'){var cp=route.params||{};route={name:'clients',params:{sel:cp.id,sub:cp.sub||'plan',psub:cp.psub,ex:cp.ex,metric:cp.metric}};}
  var v=VIEWS[route.name];
  if(!v||ALLOW[S.role].indexOf(route.name)<0){route=homeRoute();stack=[];v=VIEWS[route.name];}
  $('#main').className='wrap'+((route.name==='program'||(route.name==='builder'&&draft&&draft.kind==='program'))?' wide':'');
  $('#main').innerHTML=S.ready?v(route.params||{}):'<div class="empty" style="border:0"><p>Loading workouts\u2026</p></div>';
  $('#tabs').innerHTML=tabsHTML();
  $('#side').innerHTML=sideHTML();
}

/* ---------- actions ---------- */
var A={
  authSend:function(){var i=$('#au-email'),em=(i&&i.value||'').trim();authUi.email=em;
    if(!CLOUD.auth.isEmail(em)){authUi.err='Enter a valid email address.';render();return;}
    authUi.busy=true;authUi.err='';render();
    CLOUD.auth.sendLink(em).then(function(){authUi.busy=false;authUi.sent=true;render();},function(e){authUi.busy=false;authUi.err=/rate|seconds/i.test(e.message||'')?'Too many tries. Wait a minute, then try again.':'Couldn\u2019t send the email. Check the address and try again.';render();});},
  authCode:function(){var i=$('#au-code'),code=(i&&i.value||'').replace(/\s/g,'');
    if(!/^\d{6,10}$/.test(code)){authUi.err='Enter the code from the email.';render();return;}
    authUi.busy=true;authUi.err='';render();
    CLOUD.auth.verifyCode(authUi.email,code).then(function(){authUi.busy=false;},function(){authUi.busy=false;authUi.err='That code didn\u2019t work. It may have expired, so ask for a new link.';render();});},
  authBack:function(){authUi.sent=false;authUi.err='';render();},
  authReload:function(){location.reload();},
  editTrainer:function(){openSheet('<h2 class="sheet-title">Your name</h2><p>Clients see this on their workouts and in the community.</p><label class="field"><span>Name</span><input id="tr-name" type="text" maxlength="80" value="'+esc(S.trainer.name)+'"></label><p class="err" id="tr-err" hidden></p><button class="btn btn-primary btn-block" data-act="saveTrainer">Save</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  saveTrainer:function(){var n=$('#tr-name').value.trim().slice(0,80);if(!n){var e=$('#tr-err');e.textContent='Enter your name.';e.hidden=false;return;}setTrainer(n);writeDoc('settings/trainer',function(){return {name:S.trainer.name};});closeSheet();render();toast('Saved');},
  signOut:function(){if(!HOSTED)return;CLOUD.auth.signOut().then(function(){location.replace(location.pathname);});},
  back:function(){if(leaveGuard(back))return;back();},
  tab:function(el){var t=el.dataset.tab;if(leaveGuard(function(){tab(t);}))return;tab(t);},
  discardDraft:function(){var f=ui.pendingNav;ui.pendingNav=null;draft=null;draft0='';var r=$('#sheet-root');r.innerHTML='';r.className='';if(f)f();},
  closeSheet:closeSheet,
  openClient:function(el){if(isDesk()){var id=el.dataset.id;if(leaveGuard(function(){stack=[];route={name:'clients',params:{sel:id,sub:'plan'}};render();}))return;stopRest();stack=[];route={name:'clients',params:{sel:id,sub:'plan'}};render();window.scrollTo(0,0);return;}go('client',{id:el.dataset.id,sub:'plan'});},
  clientSub:function(el){route.params.sub=el.dataset.sub;render();},
  openWorkout:function(el){var w=workout(el.dataset.id);if(!w)return;if(S.role==='trainer'&&w.status==='completed'&&w.trainerSeen===false){w.trainerSeen=true;persistW(w.id);}if(S.role==='client'&&w.status==='assigned')go('log',{id:w.id});else go('workout',{id:w.id});},
  logWorkout:function(el){go('log',{id:el.dataset.id});},
  newWorkout:function(el){startDraft(el.dataset.id);go('builder');},
  editWorkout:function(el){var w=workout(el.dataset.id);startDraft(w.clientId,w,'edit');go('builder');},
  dupWorkout:function(el){var w=workout(el.dataset.id);startDraft(w.clientId,w,'dup');go('builder');toast('Copied. Change the date, then assign it.');},
  delWorkout:function(el){var w=workout(el.dataset.id);openSheet('<h2 class="sheet-title">Delete '+esc(w.title)+'?</h2><p>This removes it from '+esc(firstName(client(w.clientId).name))+'\u2019s plan. Logged results in other workouts stay.</p><button class="btn btn-danger-fill btn-block" data-act="confirmDel" data-id="'+w.id+'">Delete workout</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  confirmDel:function(el){S.workouts=S.workouts.filter(function(w){return w.id!==el.dataset.id;});removeW(el.dataset.id);$('#sheet-root').innerHTML='';$('#sheet-root').className='';back();toast('Workout deleted');},
  toggleSet:function(el){var r=getItem(el),it=r[1];if(!it)return;var s=it.log[+el.dataset.i];s.done=!s.done;
    if(s.done){if(s.w===''&&it.weight!=='')s.w=it.weight;if(s.r===''){var m=String(it.reps).match(/\d+/);s.r=m?m[0]:'';}if(it.timer&&it.timer.type==='rest')startRest(it.timer.rest,r[0].clientId);else if(restOn(r[0].clientId))startRest(restSecFor(r[0].clientId),r[0].clientId);}
    persistW(el.dataset.w);render();},
  addSet:function(el){var it=getItem(el)[1];if(!it)return;it.log.push({w:'',r:'',done:false});persistW(el.dataset.w);render();},
  removeSet:function(el){var it=getItem(el)[1];if(!it||it.log.length<2)return;it.log.pop();persistW(el.dataset.w);render();},
  exDone:function(el){
    var r=getItem(el),w=r[0],it=r[1];if(!it)return;
    var card=el.closest('.ex');
    if(card){card.querySelectorAll('.num').forEach(function(inp){var s=it.log[+inp.dataset.i];if(s)s[inp.dataset.f]=inp.value.trim();});var ta=card.querySelector('.note-in');if(ta)it.clientNote=ta.value;}
    var tr=(String(it.reps).match(/\d+/)||[''])[0];
    it.log.forEach(function(s){if(!s.done){if(s.w==='')s.w=it.weight;if(s.r==='')s.r=tr;s.done=true;}});
    it.done=true;persistW(w.id);render();
    var left=w.items.length-exDoneCount(w);
    if(left===0)openFinishSheet(w);
    else toast(ex(it.exId).name+' done. '+plural(left,'exercise')+' to go.');
  },
  exUndo:function(el){var r=getItem(el),w=r[0],it=r[1];if(!it)return;it.done=false;persistW(w.id);render();},
  finish:function(el){var w=workout(el.dataset.id);if(w)openFinishSheet(w);},
  effort:function(el){ui.effort=el.dataset.v===ui.effort?'':el.dataset.v;el.parentNode.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('on',c.dataset.v===ui.effort);});},
  finishConfirm:function(el){
    var w=workout(el.dataset.id);if(!w)return;var c=client(w.clientId),isT=S.role==='trainer';
    var note=($('#fin-note')||{}).value||'',fd=$('#fin-date');if(fd&&fd.value)w.date=fd.value;
    w.items.forEach(function(it){it.log.forEach(function(s){if(!s.done&&(s.w!==''||s.r!==''))s.done=true;});if(it.log.some(function(s){return s.done;}))it.done=true;});
    var sets=0,exs=0;w.items.forEach(function(it){var n=it.log.filter(function(s){return s.done;}).length;sets+=n;if(n)exs++;});
    w.clientSummary=note.trim();w.effort=ui.effort||'';
    w.status='completed';w.completedAt=Date.now();w.loggedBy=S.role;w.trainerSeen=isT;stopRest();persistW(w.id);
    var prs=prsIn(w);
    openSheet('<h2 class="sheet-title">Workout complete</h2><p>'+plural(sets,'set')+' across '+plural(exs,'exercise')+'. '+(isT?'Saved to '+esc(firstName(c.name))+'\u2019s history.':'Your results'+(w.clientSummary?' and note':'')+' are on their way to '+esc(S.trainer.first)+'.')+'</p>'+
      (prs.length?'<div class="pr-box"><b>New personal record'+(prs.length>1?'s':'')+'</b><ul>'+prs.map(function(p){return '<li>'+esc(ex(p.exId).name)+': '+setLong(p)+'</li>';}).join('')+'</ul></div>':'')+
      (isT?'':'<button class="btn btn-block" data-act="shareToCommunity" data-id="'+w.id+'">'+ICON.chat+'Share to community</button>')+
      '<button class="btn btn-primary btn-block" data-act="finishDone" data-c="'+c.id+'">Done</button>',{onClose:'finishDone'});
  },
  finishDone:function(){var r=$('#sheet-root'),cid=null;var b=r.querySelector('[data-c]');if(b)cid=b.dataset.c;r.innerHTML='';r.className='';
    if(S.role==='trainer'&&cid){stack=[{name:'clients',params:{}}];route={name:'client',params:{id:cid,sub:'plan'}};}else{stack=[];route=homeRoute();}
    render();window.scrollTo(0,0);},
  video:function(el){videoSheet(el.dataset.ex);},
  editEx:function(el){exEditor(el.dataset.ex,'library');},
  eqAdd:function(){var i=$('#eq-new');if(!i)return;addEquip(i.value);i.value='';$('#eqbox').innerHTML=eqChips();i.focus();},
  eqRemove:function(el){ui.exd.equipment.splice(+el.dataset.i,1);$('#eqbox').innerHTML=eqChips();},
  exSave:function(){
    var d=ui.exd,name=$('#xe-name').value.trim(),cat=$('#xe-cat').value,video=$('#xe-video').value.trim(),err=$('#xe-err');
    var pend=$('#eq-new');if(pend&&pend.value.trim())addEquip(pend.value);
    function bad(m){err.textContent=m;err.hidden=false;}
    if(!name)return bad('Give the exercise a name.');
    if(liveLib().some(function(e){return e.id!==d.id&&e.name.toLowerCase()===name.toLowerCase();}))return bad(name+' is already in your library.');
    if(video&&!videoEmbed(video))return bad('The video link needs to be from YouTube or Vimeo.');
    if(d.id){var e=ex(d.id);e.name=name;e.cat=cat;e.equipment=d.equipment.slice();e.video=video;persistEx(e.id);closeSheet();toast('Saved '+name);return;}
    var n={id:'x-'+uid(),name:name,group:'',cat:cat,equip:'',equipment:d.equipment.slice(),video:video,custom:true,deleted:false};
    S.library.push(n);persistEx(n.id);
    if(d.ctx==='builder'&&draft){draftAdd(n.id);closeSheet();toast(name+' added to the workout and your library');}
    else{closeSheet();toast(name+' added to your library');}
  },
  exDelete:function(){var e=ex(ui.exd.id);setSheet('<h2 class="sheet-title">Delete '+esc(e.name)+'?</h2><p>It\u2019s removed from your library and the exercise picker. Workouts that already include it keep it, so clients\u2019 history stays intact.</p><button class="btn btn-danger-fill btn-block" data-act="exDeleteConfirm">Delete exercise</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  exDeleteConfirm:function(){var e=ex(ui.exd.id);e.deleted=true;persistEx(e.id);closeSheet();toast(e.name+' deleted');},
  newExercise:function(el){exEditor(null,el.dataset.ctx);},
  editCats:catSheet,
  catAdd:function(){var i=$('#cat-new'),v=i.value.trim();if(!v)return;if(ui.catd.cats.some(function(c){return c.name.toLowerCase()===v.toLowerCase();}))return catErr(v+' is already a category.');ui.catd.cats.push({id:'cat-'+uid(),name:v});catRefresh();},
  catMove:function(el){var c=ui.catd.cats,i=-1;c.forEach(function(x,k){if(x.id===el.dataset.cat)i=k;});var j=i+(+el.dataset.dir);if(i<0||j<0||j>=c.length)return;var t=c[i];c[i]=c[j];c[j]=t;catRefresh();},
  catDel:function(el){if(ui.catd.cats.length<2)return;ui.catd.confirm=el.dataset.cat;catRefresh();},
  catBack:function(){ui.catd.confirm=null;catRefresh();},
  catDelConfirm:function(){var d=ui.catd,id=d.confirm,others=d.cats.filter(function(x){return x.id!==id;}),m=$('#cat-move'),to=m?m.value:others[0].id;
    d.cats=others;d.merged[id]=to;Object.keys(d.merged).forEach(function(k){if(d.merged[k]===id)d.merged[k]=to;});d.confirm=null;catRefresh();},
  catSave:function(){var d=ui.catd,seen={};
    for(var k=0;k<d.cats.length;k++){var nm=d.cats[k].name.trim();if(!nm)return catErr('Every category needs a name.');if(seen[nm.toLowerCase()])return catErr('Two categories are named '+nm+'. Give each a different name.');seen[nm.toLowerCase()]=1;d.cats[k].name=nm;}
    S.cats=clone(d.cats);S.catMerged=clone(d.merged)||{};persistLib();closeSheet();toast('Categories saved');},
  pickEx:pickSheet,
  pickGroup:function(el){ui.pickG=el.dataset.g;$('#pick-chips').innerHTML=chips(ui.pickG,'pickGroup');$('#pick-list').innerHTML=pickRows();},
  pickAdd:function(el){if(!draft)return;draftAdd(el.dataset.ex);ui.picked++;
    if($('#sheet-root').className!=='open'){var pl=$('.pane-list'),st=pl?pl.scrollTop:0,wy=window.scrollY,lb=$('#lib-below'),lt=lb?lb.getBoundingClientRect().top:0;render();var p2=$('.pane-list');if(p2)p2.scrollTop=st;window.scrollTo(0,wy);var lb2=$('#lib-below');if(lb&&lb2)window.scrollBy(0,lb2.getBoundingClientRect().top-lt);toast('Added '+ex(el.dataset.ex).name+(draft.kind==='program'?' to '+(draft.days[ui.pdDay]||{}).name:''));return;}
    var t=el.querySelector('.tag');if(t){t.className='tag acc';t.textContent='Added';}else el.insertAdjacentHTML('beforeend','<span class="tag acc">Added</span>');
    var d=$('#pick-done');if(d)d.textContent='Done ('+ui.picked+')';},
  moveItem:function(el){var i=-1;draft.items.forEach(function(d,k){if(d.id===el.dataset.id)i=k;});var j=i+(+el.dataset.dir);if(i<0||j<0||j>=draft.items.length)return;var t=draft.items[i];draft.items[i]=draft.items[j];draft.items[j]=t;render();},
  removeItem:function(el){draft.items=draft.items.filter(function(d){return d.id!==el.dataset.id;});render();},
  saveDraft:function(){
    if(draft.kind==='program'){saveProgramDraft();return;}
    if(!draft.items.length){toast('Add at least one exercise first.');return;}
    if(draft.kind==='template'){
      var tItems=draft.items.map(function(d){return {id:d.id,exId:d.exId,type:d.type||'',sets:Math.max(1,Math.min(20,parseInt(d.sets,10)||3)),reps:String(d.reps).trim()||'10',weight:num(d.weight)===null?'':String(num(d.weight)),note:d.note.trim(),timer:clone(d.timer)};});
      var tt=draft.id?tplOf(draft.id):null;
      if(!tt){tt={id:'t-'+uid(),createdAt:Date.now()};S.templates.push(tt);}
      tt.title=draft.title.trim()||'Untitled template';tt.type=draft.type||'';tt.notes=draft.notes.trim();tt.timer=clone(draft.timer);tt.items=tItems;tt.updatedAt=Date.now();
      persistT(tt.id);draft=null;draft0='';back();toast('Template saved');return;
    }
    var c=client(draft.clientId),date=draft.date||TODAY(),title=draft.title.trim()||'Workout';
    var items=draft.items.map(function(d){var sets=Math.max(1,Math.min(20,parseInt(d.sets,10)||3));return {id:d.id,exId:d.exId,type:d.type||'',sets:sets,reps:String(d.reps).trim()||'10',weight:num(d.weight)===null?'':String(num(d.weight)),note:d.note.trim(),timer:clone(d.timer)};});
    if(draft.id){var w=workout(draft.id);
      w.title=title;w.date=date;w.type=draft.type||'';w.notes=draft.notes.trim();w.timer=clone(draft.timer);
      w.items=items.map(function(n){var old=null;w.items.forEach(function(o){if(o.id===n.id)old=o;});var log=old?old.log.slice(0,n.sets):[];while(log.length<n.sets)log.push({w:'',r:'',done:false});n.log=log;n.clientNote=old?old.clientNote:'';n.timerResult=(old&&old.timerResult)||'';n.done=!!(old&&old.done);return n;});
      persistW(w.id);draft=null;draft0='';back();toast('Changes saved');
    }else{
      var nid=uid();S.workouts.push({id:nid,clientId:c.id,title:title,date:date,type:draft.type||'',notes:draft.notes.trim(),status:'assigned',completedAt:null,loggedBy:null,timer:clone(draft.timer),items:items.map(function(n){n.clientNote='';n.log=blankLog(n.sets);return n;})});
      persistW(nid);draft=null;draft0='';back();toast('Saved and sent to '+firstName(c.name));
    }
  },
  addClient:function(){openSheet('<h2 class="sheet-title">Add client</h2><p>You\u2019ll get an invite link to send them.</p><label class="field"><span>Name</span><input id="nc-name" type="text" autocomplete="off" maxlength="80" placeholder="First and last name"></label><label class="field"><span>Email'+(HOSTED?'':' (optional)')+'</span><input id="nc-email" type="email" inputmode="email" autocomplete="off" maxlength="254" placeholder="They sign in with this"></label><label class="field"><span>Goal (optional)</span><input id="nc-goal" type="text" autocomplete="off" maxlength="160" placeholder="e.g. Run a 5K without stopping"></label><p class="err" id="nc-err" hidden></p><button class="btn btn-primary btn-block" data-act="saveClient">Add client</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');setTimeout(function(){var i=$('#nc-name');if(i)i.focus();},60);},
  saveClient:function(){var n=$('#nc-name').value.trim().slice(0,80),em=normEmail($('#nc-email').value),e=$('#nc-err');
    function bad(m){e.textContent=m;e.hidden=false;}
    if(!n)return bad('Enter the client\u2019s name.');
    var ee=emailProblem(em,null,HOSTED);if(ee)return bad(ee);
    var c={id:'c-'+uid(),name:n,email:em,goal:$('#nc-goal').value.trim().slice(0,160),createdAt:Date.now()};S.clients.push(c);persistC(c.id);render();inviteSheet(c);},
  invite:function(el){inviteSheet(client(el.dataset.id));},
  saveInviteEmail:function(el){var c=client(el.dataset.id);if(!c)return;var em=normEmail($('#iv-email').value),e=$('#iv-err'),p=emailProblem(em,c.id,true);if(p){e.textContent=p;e.hidden=false;return;}
    c.email=em;persistC(c.id);inviteSheet(c);toast('Email saved');},
  copyLink:function(el){var link=el.dataset.link;try{navigator.clipboard.writeText(link).then(function(){toast('Copied');},function(){toast('Copy isn\u2019t available here. Press and hold the link to copy it.');});}catch(e){toast('Copy isn\u2019t available here. Press and hold the link to copy it.');}},
  libGroup:function(el){ui.libG=el.dataset.g;render();},
  rest30:function(){rest.end+=30000;tick();},
  tEdit:function(el){timerSheet({scope:el.dataset.scope,id:el.dataset.id});},
  freeTimer:function(){timerSheet({scope:'free'});},
  tType:function(el){ui.tcfg=timerDefaults(el.dataset.type);$('#tform').innerHTML=tForm();},
  tTabata:function(){ui.tcfg={type:'intervals',work:20,rest:10,rounds:8};$('#tform').innerHTML=tForm();},
  tSave:function(){var c=ui.tctx;if(c.scope==='item'){var d=draftItem(c.id);if(d)d.timer=clone(ui.tcfg);}else if(c.scope==='workout'&&draft)draft.timer=clone(ui.tcfg);closeSheet();toast('Timer saved');},
  tRemove:function(){var c=ui.tctx;if(c.scope==='item'){var d=draftItem(c.id);if(d)d.timer=null;}else if(draft)draft.timer=null;closeSheet();toast('Timer removed');},
  tStartFree:function(){S.freeTimer=clone(ui.tcfg);savePrefs();var t=clone(ui.tcfg);if($('#sheet-root').className==='open')closeSheet();openClock(t,null);},
  ckStart:function(el){var w=workout(el.dataset.w);if(!w)return;var it=null;if(el.dataset.it)w.items.forEach(function(x){if(x.id===el.dataset.it)it=x;});var t=it?it.timer:w.timer;if(!t)return;openClock(t,{w:w.id,it:it?it.id:null,title:it?ex(it.exId).name:w.title});},
  ckClose:ckClose,
  ckMute:function(el){ckMuted=!ckMuted;el.textContent=ckMuted?'Sound off':'Sound on';el.setAttribute('aria-pressed',ckMuted);},
  ckToggle:function(el){if(!CK||CK.done)return;if(!CK.started){CK.started=true;CK.running=true;CK.start=Date.now();unlockAudio();beep(700,.08);el.textContent='Pause';ckPaint();ckTick();return;}if(CK.running){CK.running=false;CK.pausedAt=Date.now();el.textContent='Resume';}else{CK.start+=Date.now()-CK.pausedAt;CK.running=true;el.textContent='Pause';unlockAudio();}},
  ckRestart:function(){if(CK)openClock(CK.t,CK.ctx);},
  ckRound:function(el){if(!CK)return;var ph=CK.P[CK.idx];if(ph.kind!=='work')return;var b=(ph.block||1)-1;CK.amrap[b]++;el.querySelector('b').textContent=CK.amrap[b];vib(40);beep(1200,.05);},
  ckFinishBtn:function(){if(!CK||CK.done)return;if(!CK.started){toast('Tap Start first.');return;}if(CK.P[CK.idx].kind==='prep'){toast('The clock starts after the countdown.');return;}ckFinish(true);},
  ckAdj:function(el){var b=+el.dataset.b;CK.amrap[b]=Math.max(0,CK.amrap[b]+(+el.dataset.d));CK.result=amrapText();ckDone();},
  ckSave:function(){var w=workout(CK.ctx.w);if(w){if(CK.ctx.it){w.items.forEach(function(x){if(x.id===CK.ctx.it)x.timerResult=CK.result;});}else w.timerResult=CK.result;persistW(w.id);}ckClose();render();toast('Result saved');},
  restSkip:function(){stopRest();},
  musicEdit:function(){musicSheet(S.viewAs);},
  musicPlay:function(){var c=client(S.viewAs);if(c&&c.playlist){playMusic(c.playlist);render();}},
  musicClose:function(){stopMusic();render();},
  musicSave:function(){var c=client(ui.musicFor),u=$('#mu-url').value.trim(),e=$('#mu-err');if(!c)return;
    if(!u){e.textContent='Paste a playlist link first.';e.hidden=false;return;}
    if(!musicInfo(u)){e.textContent='That doesn’t look like a link. Copy the share link from your music app and paste it here.';e.hidden=false;return;}
    c.playlist=u;c.playlistBy=S.role==='trainer'?'trainer':'client';persistC(c.id);if(MUSIC&&MUSIC.open!==u)stopMusic();closeSheet();toast('Playlist saved');},
  musicRemove:function(){var c=client(ui.musicFor);if(!c)return;if(MUSIC&&MUSIC.open===c.playlist)stopMusic();c.playlist='';c.playlistBy='';persistC(c.id);closeSheet();toast('Playlist removed');},
  editHome:function(el){homeSheet(el.dataset.id);},
  homeSave:function(){var c=client(ui.homeFor);if(!c)return;var txt=$('#mo-text').value.trim(),all=$('#mo-all')&&$('#mo-all').checked,u=$('#mo-music').value.trim(),e=$('#mo-err');
    if(u&&!musicInfo(u)){e.textContent='The playlist link needs to start with https://. Copy the share link from Spotify or Apple Music.';e.hidden=false;return;}
    var targets=all?S.clients:[c],now=Date.now();
    targets.forEach(function(t){t.motivation=txt;t.motivationAt=now;});
    if(u!==(c.playlist||'')){c.playlist=u;c.playlistBy=u?'trainer':'';}
    targets.concat(all?[]:[]).forEach(function(t){persistC(t.id);});if(all&&targets.indexOf(c)<0)persistC(c.id);
    closeSheet();toast(all?'Message sent to all clients':'Saved for '+firstName(c.name));},
  postSend:function(){var txt=(ui.postDraft||'').trim(),sw=ui.shareW?workout(ui.shareW):null;
    if(!txt&&!sw){toast('Write something or attach a workout first.');return;}
    var p={id:'p-'+uid(),author:me(),text:txt,createdAt:Date.now(),pinned:S.role==='trainer'&&!!ui.postPin,workout:sw?wSnap(sw):null};
    S.posts.push(p);persistIn('posts',function(){return S.posts;},p.id);ui.postDraft='';ui.shareW=null;ui.postPin=false;render();toast('Posted');},
  postDel:function(el){openSheet('<h2 class="sheet-title">Delete this post?</h2><p>Its replies and likes are removed too.</p><button class="btn btn-danger-fill btn-block" data-act="postDelConfirm" data-id="'+el.dataset.id+'">Delete post</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  postDelConfirm:function(el){var id=el.dataset.id;
    S.comments.filter(function(c){return c.postId===id;}).forEach(function(c){removeDoc('comments',c.id);});
    S.likes.filter(function(l){return l.postId===id;}).forEach(function(l){removeDoc('likes',l.id);});
    S.comments=S.comments.filter(function(c){return c.postId!==id;});S.likes=S.likes.filter(function(l){return l.postId!==id;});
    S.posts=S.posts.filter(function(p){return p.id!==id;});removeDoc('posts',id);closeSheet();toast('Post deleted');},
  likeToggle:function(el){var pid=el.dataset.post,id=pid+'__'+me(),had=findIn(S.likes,id);
    if(had){S.likes=S.likes.filter(function(l){return l.id!==id;});removeDoc('likes',id);}
    else{S.likes.push({id:id,postId:pid,author:me(),createdAt:Date.now()});persistIn('likes',function(){return S.likes;},id);}
    render();},
  cmtSend:function(el){var pid=el.dataset.post,inp=document.querySelector('.reply-in[data-post="'+pid+'"]'),txt=inp?inp.value.trim():'';if(!txt){if(inp)inp.focus();return;}
    var c={id:'m-'+uid(),postId:pid,author:me(),text:txt,createdAt:Date.now()};S.comments.push(c);persistIn('comments',function(){return S.comments;},c.id);
    ui.openCmts=ui.openCmts||{};render();},
  cmtDel:function(el){var id=el.dataset.id;S.comments=S.comments.filter(function(c){return c.id!==id;});removeDoc('comments',id);render();},
  cmtAll:function(el){ui.openCmts=ui.openCmts||{};ui.openCmts[el.dataset.post]=true;render();},
  pickShareW:function(){var list=completed(me()).slice(0,12);
    openSheet('<h2 class="sheet-title">Share a workout</h2><p>Your sets, personal records, and how it felt show in the post.</p>'+(list.length?'<div class="list">'+list.map(function(w){var n=prsIn(w).length;return '<button class="row" data-act="shareWPick" data-id="'+w.id+'"><span class="row-main"><span class="row-title">'+esc(w.title)+'</span><span class="row-sub">'+fmtDate(w.date)+', '+plural(w.items.length,'exercise')+'</span></span>'+(n?'<span class="tag pr">'+n+' PR'+(n>1?'s':'')+'</span>':'')+'</button>';}).join('')+'</div>':'<p class="muted">Finish a workout first, then you can share it here.</p>')+
      '<button class="btn btn-block mt" data-act="closeSheet">Cancel</button>');},
  shareWPick:function(el){ui.shareW=el.dataset.id;closeSheet();var t=$('#post-text');if(t)t.focus();},
  shareWClear:function(){ui.shareW=null;render();},
  shareToCommunity:function(el){ui.shareW=el.dataset.id;var r=$('#sheet-root');r.innerHTML='';r.className='';goCommunity();},
  progSub:function(el){route.params.psub=el.dataset.sub;render();},
  progMetric:function(el){route.params.metric=el.dataset.m;render();},
  progOpenEx:function(el){route.params.psub='exercises';route.params.ex=el.dataset.ex;route.params.metric='best';render();window.scrollTo(0,0);},
  newTemplate:function(){startTemplateDraft(null);go('builder');},
  tplSeg:function(el){ui.tplSeg=el.dataset.s;render();},
  newProgram:function(el){startProgramDraft(null,{clientId:el.dataset.id});go('builder');},
  newProgramTpl:function(){startProgramDraft(null,{template:true});go('builder');},
  editProgram:function(el){var pg=progOf(el.dataset.id);if(!pg)return;startProgramDraft(pg,{mode:'edit',clientId:pg.clientId,template:pg.isTemplate});go('builder');},
  pdAddDay:function(){draft.days.push(newDay(draft.days.length+1));ui.pdDay=draft.days.length-1;render();setTimeout(function(){var n=document.querySelectorAll('.pday-name');if(n.length)n[n.length-1].focus();},40);},
  pdDayDel:function(el){var di=+el.dataset.d,d=draft.days[di];if(!d)return;if(d.items.length&&!el.dataset.ok){el.dataset.ok='1';el.classList.add('btn-danger');toast('Tap again to remove '+d.name+' and its exercises.');return;}draft.days.splice(di,1);ui.pdDay=Math.min(ui.pdDay,draft.days.length-1);render();},
  pdAddEx:function(el){ui.pdDay=+el.dataset.d;if(isDesk()){render();var lb=$('#lib-below');if(lb)lb.scrollIntoView({block:'start',behavior:'smooth'});var q=$('#pick-q');if(q)q.focus({preventScroll:true});}else pickSheet();},
  pdMove:function(el){var d=draft.days[+el.dataset.d],i=+el.dataset.i,j=i+(+el.dataset.dir);if(!d||j<0||j>=d.items.length)return;var t=d.items[i];d.items[i]=d.items[j];d.items[j]=t;render();},
  pdRemove:function(el){var d=draft.days[+el.dataset.d];if(!d)return;d.items.splice(+el.dataset.i,1);render();},
  pdCopy:function(el){ui.cp={d:+el.dataset.d,i:+el.dataset.i,from:0,ds:0,dr:0,dw:0,auto:false};cpSheet();},
  cpStep:function(el){var f=el.dataset.f;ui.cp[f]=clean((+ui.cp[f]||0)+(+el.dataset.v));var i=$('#cp-'+f);if(i)i.value=ui.cp[f];cpRefresh();},
  cpApply:function(){var r=cpCalc();if(!r)return;if(r.err){toast(r.err);return;}var lbl=cpLabel().replace('Copy to','Copied to');r.rows.forEach(function(x){r.it.rx[x.k]=rxInput({sets:x.sets,reps:x.reps},r.it.unit);r.it.wt[x.k]=x.w===null?'':String(x.w);});ui.pdErr=null;closeSheet();render();toast(lbl);},
  pdType:function(el){var t=wType(el.dataset.t),n=0;draft.type=t?t.id:'';draft.days.forEach(function(d){d.items.forEach(function(it){if(it.unit==='time')return;applyProgType(it,t);n++;});});render();toast(t?t.name+' set for '+plural(n,'exercise')+': '+t.reps+' reps, aim for RPE '+t.rpe+'.':'Workout type cleared. Reps stay as they are.');},
  pdTarget:function(el){ui.pdDay=+el.dataset.d;var wy=window.scrollY,pl=$('.pane-list'),st=pl?pl.scrollTop:0;render();window.scrollTo(0,wy);var p2=$('.pane-list');if(p2)p2.scrollTop=st;},
  openProgram:function(el){go('program',{id:el.dataset.id});},
  dType:function(el){var t=wType(el.dataset.t);draft.type=t?t.id:'';draft.items.forEach(function(d){applyDType(d,t);});render();toast(t?t.name+': '+wtRange(t)+', aim for RPE '+t.rpe+'.'+(draft.clientId?' Starting weights come from 1RM where Gainz has one.':''):'Workout type cleared');},
  dUseW:function(el){draft.items.forEach(function(d){if(d.id===el.dataset.id)d.weight=el.dataset.w;});render();},
  setMax:function(el){var cid=el.dataset.c||(draft&&draft.clientId);if(cid)maxSheet(cid,el.dataset.ex||'');},
  mxSave:function(el){var c=client(el.dataset.c);if(!c)return;var id=($('#mx-ex')||{}).value,w=num(($('#mx-w')||{}).value),d=($('#mx-d')||{}).value||TODAY(),er=$('#mx-err');
    if(!id){er.textContent='Pick an exercise.';er.hidden=false;return;}
    if(w===null||w<=0||w>2000){er.textContent='Enter the 1-rep max in pounds, like 185.';er.hidden=false;return;}
    c.maxes=c.maxes||{};c.maxes[id]={w:clean(w),date:d};persistC(c.id);closeSheet();refreshDraftLoads(c.id,id);render();toast('Saved: '+ex(id).name+', 1RM '+clean(w)+' lb');},
  mxDel:function(el){var c=client(el.dataset.c),id=($('#mx-ex')||{}).value;if(!c||!id||!c.maxes)return;delete c.maxes[id];persistC(c.id);closeSheet();refreshDraftLoads(c.id,id);render();toast('Removed the tested 1RM for '+ex(id).name);},
  rpe:function(el){var r=getItem(el),w=r[0],it=r[1];if(!it)return;var card=el.closest('.ex');
    if(card){card.querySelectorAll('.num').forEach(function(inp){var s=it.log[+inp.dataset.i];if(s)s[inp.dataset.f]=inp.value.trim();});var ta=card.querySelector('.note-in');if(ta)it.clientNote=ta.value;}
    var v=+el.dataset.v;it.rpe=it.rpe===v?null:v;persistW(w.id);
    var g=el.closest('.rpe');if(g){g.querySelectorAll('[data-act="rpe"]').forEach(function(b){var on=+b.dataset.v===it.rpe;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});var cap=g.querySelector('.rpe-cap');if(cap)cap.textContent=rpeCap(it);}},
  pStart:function(el){var pg=progOf(el.dataset.p);if(pg)startSession(pg,+el.dataset.w,+el.dataset.d);},
  pWeek:function(el){ui.pw=ui.pw||{};ui.pw[el.dataset.p]=+el.dataset.w;render();},
  assignProgram:function(el){var pg=progOf(el.dataset.id);if(!pg)return;
    openSheet('<h2 class="sheet-title">Assign '+esc(pg.title)+'</h2><p>Each client gets their own copy. Days aren\u2019t tied to dates, so they can start whenever they\u2019re ready.</p><div class="field"><span>Clients</span><div class="list"><label class="check-row"><input type="checkbox" id="as-all" data-ch="asAll"> All clients ('+S.clients.length+')</label>'+
      S.clients.map(function(c){return '<label class="check-row"><input type="checkbox" class="as-c" value="'+c.id+'" data-ch="asOne"> '+esc(c.name)+'</label>';}).join('')+'</div></div>'+
      '<p class="hint" style="margin-top:-4px">Where the program leaves weight blank, each client gets the weight from their last session when they start a day.</p><p class="err" id="as-err" hidden></p>'+
      '<button class="btn btn-primary btn-block big" id="as-go" data-act="assignProgramConfirm" data-id="'+pg.id+'">Assign</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  assignProgramConfirm:function(el){var pg=progOf(el.dataset.id);if(!pg)return;var ids=[].map.call(document.querySelectorAll('.as-c:checked'),function(x){return x.value;});
    if(!ids.length){var e=$('#as-err');e.textContent='Pick at least one client.';e.hidden=false;return;}
    ids.forEach(function(cid){var cp=copyProgram(pg,{clientId:cid,from:pg.id});S.programs.push(cp);persistIn('programs',function(){return S.programs;},cp.id);});
    closeSheet();toast('Assigned '+pg.title+' to '+(ids.length===1?firstName(client(ids[0]).name):plural(ids.length,'client')));},
  progToTemplate:function(el){var pg=progOf(el.dataset.id);if(!pg)return;var t=copyProgram(pg,{template:true,clearWeights:true});S.programs.push(t);persistIn('programs',function(){return S.programs;},t.id);toast('Saved '+pg.title+' as a program template. Weights are left blank so each client gets their own.');},
  delProgram:function(el){var pg=progOf(el.dataset.id);if(!pg)return;openSheet('<h2 class="sheet-title">Delete '+esc(pg.title)+'?</h2><p>'+(pg.isTemplate?'Programs you already assigned from it stay with those clients.':'Sessions already logged stay in the client\u2019s history.')+'</p><button class="btn btn-danger-fill btn-block" data-act="delProgramConfirm" data-id="'+pg.id+'">Delete program</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  delProgramConfirm:function(el){var id=el.dataset.id;S.programs=S.programs.filter(function(x){return x.id!==id;});removeDoc('programs',id);draft=null;draft0='';var r=$('#sheet-root');r.innerHTML='';r.className='';back();toast('Program deleted');},
  editTemplate:function(el){var t=tplOf(el.dataset.id);if(!t)return;startTemplateDraft(t);go('builder');},
  assignTemplate:function(el){assignSheet(el.dataset.id);},
  assignConfirm:function(el){
    var t=tplOf(el.dataset.id);if(!t)return;var ids=[].map.call(document.querySelectorAll('.as-c:checked'),function(x){return x.value;}),date=$('#as-date').value||TODAY();
    if(!ids.length){var e=$('#as-err');e.textContent='Pick at least one client.';e.hidden=false;return;}
    ids.forEach(function(cid){var nid=uid();S.workouts.push({id:nid,clientId:cid,title:t.title,date:date,notes:t.notes||'',status:'assigned',completedAt:null,loggedBy:null,timer:clone(t.timer),fromTemplate:t.id,
      items:t.items.map(function(it){return {id:uid(),exId:it.exId,type:it.type||'',sets:it.sets,reps:it.reps,weight:it.weight!==''&&it.weight!=null?it.weight:autoWeight(cid,it.exId,it.type,it.reps),note:it.note||'',timer:clone(it.timer),clientNote:'',log:blankLog(it.sets)};})});persistW(nid);});
    closeSheet();toast('Assigned '+t.title+' to '+(ids.length===1?firstName(client(ids[0]).name):plural(ids.length,'client'))+' for '+fmtLc(date));
  },
  delTemplate:function(){var t=tplOf(draft&&draft.id);if(!t)return;openSheet('<h2 class="sheet-title">Delete '+esc(t.title)+'?</h2><p>Workouts you already assigned from it stay on clients’ plans.</p><button class="btn btn-danger-fill btn-block" data-act="delTemplateConfirm">Delete template</button><button class="btn btn-block" data-act="closeSheet">Cancel</button>');},
  delTemplateConfirm:function(){var id=draft.id;S.templates=S.templates.filter(function(x){return x.id!==id;});removeT(id);draft=null;draft0='';var r=$('#sheet-root');r.innerHTML='';r.className='';back();toast('Template deleted');},
  useTemplate:function(){openSheet('<h2 class="sheet-title">Start from a template</h2><p>Weights left blank in a template are filled in from this client’s last session.</p><div class="list">'+S.templates.map(function(t){return '<button class="row" data-act="applyTemplate" data-id="'+t.id+'"><span class="row-main"><span class="row-title">'+esc(t.title)+'</span><span class="row-sub">'+plural(t.items.length,'exercise')+'</span></span></button>';}).join('')+'</div><button class="btn btn-block mt" data-act="closeSheet">Cancel</button>');},
  applyTemplate:function(el){var t=tplOf(el.dataset.id);if(!t||!draft)return;draft.title=draft.title||t.title;draft.notes=draft.notes||t.notes||'';draft.timer=draft.timer||clone(t.timer);
    if(!draft.type&&t.type)draft.type=t.type;draft.items=t.items.map(function(it){return {id:uid(),exId:it.exId,type:it.type||'',sets:String(it.sets),reps:it.reps,weight:it.weight!==''&&it.weight!=null?it.weight:autoWeight(draft.clientId,it.exId,it.type,it.reps),note:it.note||'',timer:clone(it.timer)};});closeSheet();toast('Loaded '+t.title);},
  draftToTemplate:function(){var t=tplFrom({title:draft.title||'Untitled template',notes:draft.notes,timer:draft.timer,items:draft.items});S.templates.push(t);persistT(t.id);toast('Saved as a template. Weights are left blank so each client gets their own.');},
  wToTemplate:function(el){var w=workout(el.dataset.id);if(!w)return;var t=tplFrom(w);S.templates.push(t);persistT(t.id);toast('Saved '+t.title+' as a template');},
  restOff:function(){var c=client(rest.cid);stopRest();if(!c)return;c.restTimer=false;persistC(c.id);toast(S.role==='client'?'Rest timer off. Turn it back on under Timer, Rest.':'Rest timer off for '+firstName(c.name)+'.');},
  restToggle:function(){var c=client(S.viewAs);if(!c)return;c.restTimer=c.restTimer===false;persistC(c.id);render();toast(c.restTimer?'Rest timer on':'Rest timer off');}
};
function openFinishSheet(w){
  var isT=S.role==='trainer',done=exDoneCount(w),left=w.items.length-done;ui.effort=w.effort||'';
  var anyLogged=w.items.some(function(it){return it.log.some(function(s){return s.done||s.w!==''||s.r!=='';});});
  var warn=!anyLogged?'Nothing is logged yet. Anything you finish without logging is saved as skipped.':left?plural(left,'exercise')+(left===1?' isn\u2019t':' aren\u2019t')+' marked done. Any sets you entered for '+(left===1?'it':'them')+' will still be saved.':'';
  openSheet('<h2 class="sheet-title">Finish '+esc(w.title)+'?</h2><p>'+done+' of '+plural(w.items.length,'exercise')+' marked done.'+(warn?' '+warn:'')+'</p>'+
    '<div class="field"><span>How did it feel?</span><div class="chiprow">'+['Easy','Just right','Hard'].map(function(v){return '<button class="chip'+(ui.effort===v?' on':'')+'" data-act="effort" data-v="'+v+'">'+v+'</button>';}).join('')+'</div></div>'+
    (w.programId?'<label class="field"><span>Day completed</span><input id="fin-date" type="date" value="'+esc(w.date)+'" max="'+TODAY()+'"></label>':'')+
    '<label class="field"><span>'+(isT?'Session note (optional)':'Note for '+esc(S.trainer.first)+' (optional)')+'</span><textarea id="fin-note" placeholder="'+(isT?'e.g. Moved well, bump squat next week.':'e.g. Felt strong today. Last set of squats was tough.')+'">'+esc(w.clientSummary||'')+'</textarea></label>'+
    '<button class="btn btn-primary btn-block big" data-act="finishConfirm" data-id="'+w.id+'">'+(isT?'Finish and save':'Finish and send to '+esc(S.trainer.first))+'</button><button class="btn btn-block" data-act="closeSheet">Keep going</button>');
}
function applyViewAs(v){if(CK)ckClose();if(v==='trainer')S.role='trainer';else{S.role='client';S.viewAs=v;}savePrefs();draft=null;draft0='';stopRest();stack=[];route=homeRoute();render();window.scrollTo(0,0);}
function draftDirty(){return !!draft&&JSON.stringify(draft)!==draft0;}
function leaveGuard(fn){
  if(route.name!=='builder'||!draftDirty())return false;
  ui.pendingNav=fn;
  openSheet('<h2 class="sheet-title">Leave without saving?</h2><p>This '+(draft.kind==='program'?'program':draft.kind==='template'?'template':'workout')+' isn\u2019t saved yet. To save it, tap the Save button at the bottom of the page.</p><button class="btn btn-primary btn-block" data-act="closeSheet">Keep editing</button><button class="btn btn-block btn-danger" data-act="discardDraft">Discard changes</button>');
  return true;
}
function normEmail(v){return String(v||'').trim().toLowerCase();}
function emailProblem(em,selfId,required){
  if(!em)return required?'Enter the client\u2019s email. They sign in with it.':'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))return 'That email doesn\u2019t look right.';
  if(S.clients.some(function(x){return x.id!==selfId&&normEmail(x.email)===em;}))return 'Another client already uses that email.';
  return '';
}
function appUrl(){return location.origin+location.pathname;}
function inviteSheet(c){
  if(!c)return;
  var em=c.email||'',live=HOSTED&&/^https?:/.test(location.protocol);
  var link=live?appUrl()+(em?'?email='+encodeURIComponent(em):''):'https://your-app-name.com/join/'+slug(firstName(c.name))+'-'+c.id.slice(-4);
  var msg='Hi '+firstName(c.name)+', your workouts are ready in Gainz. Open '+link+' and sign in with '+(em||'your email')+'. You\u2019ll get a sign-in link by email, no password needed.';
  openSheet('<h2 class="sheet-title">Invite '+esc(firstName(c.name))+'</h2><p>'+esc(firstName(c.name))+' opens this link on their phone and signs in with the email below to see workouts, log sets, and join the community. No app download or password needed.</p>'+
    '<label class="field"><span>Sign-in email</span><input id="iv-email" type="email" inputmode="email" autocomplete="off" maxlength="254" value="'+esc(em)+'" placeholder="client@example.com"></label><p class="err" id="iv-err" hidden></p>'+
    (normEmail(em)!==''?'':'<p class="hint">Add an email so '+esc(firstName(c.name))+' can sign in.</p>')+
    '<button class="btn btn-block" data-act="saveInviteEmail" data-id="'+c.id+'">Save email</button>'+
    '<div class="link-box">'+esc(link)+'</div><button class="btn btn-primary btn-block" data-act="copyLink" data-link="'+esc(msg)+'"'+(em?'':' disabled')+'>Copy invite message</button><button class="btn btn-block" data-act="closeSheet">Done</button>'+
    (live?'':'<p class="hint" style="margin-top:12px">'+(HOSTED?'The link works once the app is hosted on the web.':'In demo mode the link isn\u2019t live. Connect Supabase to send real invites (see the README).')+'</p>'));
}
var I={
  pct1rm:function(el){var p=route.params;p.pct1rm=p.pct1rm||{};p.pct1rm[el.dataset.ex]=el.value;var t=document.getElementById('pct-table');if(t)t.innerHTML=pctRows(num(el.value));var h=document.getElementById('pct-src');if(h)h.textContent=el.value===''?'Clear: enter a 1-rep max.':'Using the number you entered.';},
  setVal:function(el){var it=getItem(el)[1];if(!it)return;it.log[+el.dataset.i][el.dataset.f]=el.value.trim();el.className='num'+numCls(it,el.dataset.f,el.value);},
  clientNote:function(el){var it=getItem(el)[1];if(!it)return;it.clientNote=el.value;},
  dItem:function(el){if(!draft)return;draft.items.forEach(function(d){if(d.id===el.dataset.id)d[el.dataset.f]=el.value;});},
  draftField:function(el){if(draft)draft[el.dataset.f]=el.value;},
  tNum:function(el){var v=parseInt(el.value,10);if(v>=1){ui.tcfg[el.dataset.f]=Math.min(el.dataset.f==='blocks'?10:99,v);var s=$('#tsum');if(s)s.innerHTML=tSummary();}},
  catName:function(el){ui.catd.cats.forEach(function(c){if(c.id===el.dataset.cat)c.name=el.value;});},
  postDraft:function(el){ui.postDraft=el.value;},
  pdRx:function(el){var it=pItem(+el.dataset.d,+el.dataset.i);if(!it)return;it.rx[+el.dataset.k]=el.value;if(ui.pdErr){ui.pdErr=null;el.classList.remove('bad');}},
  pdItem:function(el){var it=pItem(+el.dataset.d,+el.dataset.i);if(it)it[el.dataset.f]=el.value;},
  pdDayName:function(el){var d=draft&&draft.days[+el.dataset.d];if(d)d.name=el.value;},
  pdWt:function(el){var it=pItem(+el.dataset.d,+el.dataset.i);if(!it)return;it.wt[+el.dataset.k]=el.value;if(ui.pdErr){ui.pdErr=null;el.classList.remove('bad');}},
  cpField:function(el){ui.cp[el.dataset.f]=num(el.value)||0;cpRefresh();},
  libSearch:function(el){ui.libQ=el.value;var l=$('#lib-list');if(l)l.innerHTML=libRows();},
  pickSearch:function(el){ui.pickQ=el.value;var l=$('#pick-list');if(l)l.innerHTML=pickRows();}
};
var C={
  pctEx:function(el){route.params.pctEx=el.value;render();},
  viewAs:function(el){var v=el.value;if(leaveGuard(function(){applyViewAs(v);})){el.value=S.role==='trainer'?'trainer':S.viewAs;return;}applyViewAs(v);},
  progEx:function(el){route.params.ex=el.value;render();},
  pdItemType:function(el){var it=pItem(+el.dataset.d,+el.dataset.i);if(!it)return;applyProgType(it,wType(el.value));render();},
  dItemType:function(el){var d=null;draft.items.forEach(function(x){if(x.id===el.dataset.id)d=x;});if(!d)return;applyDType(d,wType(el.value));render();},
  cpFrom:function(el){ui.cp.from=+el.value;cpRefresh();},
  cpAuto:function(el){ui.cp.auto=el.checked;cpRefresh();},
  mxEx:function(el){var id=el.value,c=client(($('[data-act="mxSave"]')||{dataset:{}}).dataset.c);if(!c)return;var cur=id&&c.maxes&&c.maxes[id];var e=$('#mx-est');if(e)e.innerHTML=mxEst(c.id,id);var w=$('#mx-w');if(w)w.value=cur?String(cur.w):'';var d=$('#mx-d');if(d&&cur&&cur.date)d.value=cur.date;var x=$('#mx-del');if(x)x.hidden=!cur;},
  postPin:function(el){ui.postPin=el.checked;},
  pdWeeks:function(el){var n=Math.max(1,Math.min(16,parseInt(el.value,10)||1));draft.weeks=n;draft.days.forEach(function(d){d.items.forEach(function(it){while(it.rx.length<n)it.rx.push(it.rx[it.rx.length-1]||(it.unit==='time'?'3x30':'3x10'));it.rx.length=n;it.wt=it.wt||[];while(it.wt.length<n)it.wt.push(it.wt.length?it.wt[it.wt.length-1]:'');it.wt.length=n;});});render();},
  pdUnit:function(el){var it=pItem(+el.dataset.d,+el.dataset.i);if(!it)return;it.unit=el.value;render();},
  sessDate:function(el){var w=workout(el.dataset.w);if(!w||!el.value)return;w.date=el.value;persistW(w.id);toast('Logged for '+fmtLc(w.date));},
  asAll:function(el){document.querySelectorAll('.as-c').forEach(function(x){x.checked=el.checked;});asCount();},
  asOne:function(){asCount();},
  tField:function(el){ui.tcfg[el.dataset.f]=parseInt(el.value,10);if(ui.tcfg.type==='rest'&&ui.tctx&&ui.tctx.scope==='page'&&S.role==='client'){var rc=client(S.viewAs);if(rc){rc.restSec=ui.tcfg.rest;persistC(rc.id);}var f=$('#tform');if(f){f.innerHTML=tForm();return;}}var s=$('#tsum');if(s)s.innerHTML=tSummary();}
};

document.addEventListener('click',function(e){var el=e.target.closest('[data-act]');if(!el||el.disabled)return;var f=A[el.dataset.act];if(f){e.preventDefault();f(el,e);}});
document.addEventListener('input',function(e){var k=e.target.dataset&&e.target.dataset.in;if(k&&I[k])I[k](e.target);});
document.addEventListener('change',function(e){var t=e.target,ds=t.dataset||{};if(ds.in==='setVal'||ds.in==='clientNote'){I[ds.in](t);persistW(ds.w);return;}var k=ds.ch;if(k&&C[k])C[k](t);});
document.addEventListener('focusout',function(){if(renderPending)setTimeout(function(){if(renderPending&&!typing()){renderPending=false;render();}},60);});
document.addEventListener('focusin',function(e){if(e.target.classList&&e.target.classList.contains('num'))setTimeout(function(){try{e.target.select();}catch(x){}},0);});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&(e.target.id==='au-email'||e.target.id==='au-code')){e.preventDefault();(e.target.id==='au-email'?A.authSend:A.authCode)();return;}if(e.key==='Enter'&&e.target&&e.target.classList&&e.target.classList.contains('reply-in')){e.preventDefault();A.cmtSend(e.target);return;}if(e.key==='Enter'&&e.target&&(e.target.id==='eq-new'||e.target.id==='cat-new')){e.preventDefault();(e.target.id==='eq-new'?A.eqAdd:A.catAdd)();return;}if(e.key==='Escape'&&!$('#clock').hidden){ckClose();return;}if(e.key==='Escape'&&$('#sheet-root').className==='open'){var s=$('#sheet-root .scrim');if(s)s.click();}});

loadPrefs();
route=homeRoute();
render();
initStore();
})();
