/* Gainz cloud store: sign-in and shared data on Supabase.

   The app was first written against a small document API:
     db.collection('workouts').onSnapshot(fn, onError)   -> fn({docs:[{id, data()}]})
     db.doc('settings/trainer').onSnapshot(fn, onError)  -> fn({exists, data()})
     db.doc('workouts/w-123').set(body) / .delete()      -> Promise
   This file provides the same API on top of one Supabase table (public.docs),
   so the screens did not need to change. Who can read or write each document
   is decided by the row-level security rules in supabase/schema.sql. */
(function(){
'use strict';

var cfg=window.GAINZ_CONFIG||{};
var enabled=!!(cfg.supabaseUrl&&cfg.supabaseAnonKey);
var sb=null;
if(enabled&&window.supabase&&typeof window.supabase.createClient==='function'){
  sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
}

var COLLECTIONS=['clients','workouts','programs','templates','posts','comments','likes','exercises','settings'];
var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clone(x){return x==null?x:JSON.parse(JSON.stringify(x));}
function errCode(e){
  if(!e)return 'unknown';
  var c=String(e.code||'');
  if(c==='42501'||c==='PGRST301'||/row-level security|permission/i.test(e.message||''))return 'permission_denied';
  if(c==='23514'||c==='22P02'||c==='23502'||c==='22001')return 'rejected';
  if(!c||/fetch|network|timeout/i.test(e.message||''))return 'unavailable';
  return c;
}
function wrapErr(e){var x=new Error((e&&e.message)||'Request failed');x.code=errCode(e);x.cause=e;return x;}

/* ---------- auth ---------- */
function redirectUrl(){return location.origin+location.pathname;}
var auth={
  enabled:enabled,
  ready:!!sb,
  client:sb,
  isEmail:function(s){return EMAIL_RE.test(String(s||'').trim());},
  session:function(){return sb?sb.auth.getSession().then(function(r){return r.data&&r.data.session||null;}):Promise.resolve(null);},
  /* Sends a one-time sign-in link (and code) to the email. No password. */
  sendLink:function(email){
    email=String(email||'').trim().toLowerCase();
    if(!EMAIL_RE.test(email))return Promise.reject(Object.assign(new Error('Enter a valid email address.'),{code:'rejected'}));
    return sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:redirectUrl(),shouldCreateUser:true}}).then(function(r){if(r.error)throw wrapErr(r.error);return true;});
  },
  /* Lets someone type the 6-digit code from the email instead of tapping the link
     (handy when the link opens in a different browser than the app). */
  verifyCode:function(email,code){
    return sb.auth.verifyOtp({email:String(email).trim().toLowerCase(),token:String(code).trim(),type:'email'}).then(function(r){if(r.error)throw wrapErr(r.error);return r.data.session;});
  },
  signOut:function(){return sb?sb.auth.signOut():Promise.resolve();},
  onChange:function(fn){if(sb)sb.auth.onAuthStateChange(function(ev,s){fn(ev,s);});},
  /* Links this sign-in to the trainer or to a client record (by email) and
     returns {role:'trainer'|'client'|null, client_id, email}. */
  whoami:function(){
    return sb.rpc('gainz_whoami').then(function(r){if(r.error)throw wrapErr(r.error);var row=Array.isArray(r.data)?r.data[0]:r.data;return row||{role:null};});
  }
};

/* ---------- document store ---------- */
function openDb(){
  var cache={},ver={},pending={},colSubs={},docSubs={},channel=null,loaded=false,queued=[];
  COLLECTIONS.forEach(function(c){cache[c]={};colSubs[c]=[];});

  function key(c,id){return c+'/'+id;}
  function colSnap(c){var m=cache[c]||{};return {docs:Object.keys(m).map(function(id){var d=m[id];return {id:id,data:function(){return clone(d);}};})};}
  function docSnap(c,id){var d=(cache[c]||{})[id];return {id:id,exists:d!==undefined,data:function(){return clone(d);}};}
  function emit(c,id){
    if(!loaded)return;
    (colSubs[c]||[]).forEach(function(s){try{s.next(colSnap(c));}catch(e){console.error(e);}});
    if(id!=null)(docSubs[key(c,id)]||[]).forEach(function(s){try{s.next(docSnap(c,id));}catch(e){console.error(e);}});
  }
  function emitAll(){COLLECTIONS.forEach(function(c){emit(c,null);});Object.keys(docSubs).forEach(function(k){var i=k.indexOf('/');var c=k.slice(0,i),id=k.slice(i+1);docSubs[k].forEach(function(s){s.next(docSnap(c,id));});});}
  function failAll(e){COLLECTIONS.forEach(function(c){colSubs[c].forEach(function(s){if(s.error)s.error(e);});});}

  function apply(row,deleted){
    var c=row.collection,id=row.id;if(!cache[c])return;
    var k=key(c,id);
    if(pending[k])return; /* our own write is in flight; its result wins */
    if(!deleted&&row.updated_at&&ver[k]&&row.updated_at<ver[k])return; /* stale echo */
    if(deleted)delete cache[c][id];else{cache[c][id]=row.data||{};if(row.updated_at)ver[k]=row.updated_at;}
    emit(c,id);
  }

  function loadAll(){
    var all=[],page=1000;
    function step(from){
      return sb.from('docs').select('collection,id,data,updated_at').order('collection').order('id').range(from,from+page-1).then(function(r){
        if(r.error)throw wrapErr(r.error);
        all=all.concat(r.data||[]);
        return (r.data||[]).length===page?step(from+page):all;
      });
    }
    return step(0).then(function(rows){
      COLLECTIONS.forEach(function(c){cache[c]={};});ver={};
      rows.forEach(function(row){if(cache[row.collection]){cache[row.collection][row.id]=row.data||{};ver[key(row.collection,row.id)]=row.updated_at;}});
      loaded=true;emitAll();
    });
  }

  function listen(){
    var wasDown=false;
    channel=sb.channel('gainz-docs').on('postgres_changes',{event:'*',schema:'public',table:'docs'},function(p){
      if(p.eventType==='DELETE')apply(p.old||{},true);else apply(p.new||{},false);
    }).subscribe(function(status){
      if(status==='SUBSCRIBED'){if(wasDown){wasDown=false;loadAll().catch(function(){});}}
      else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')wasDown=true;
    });
    /* catch up after the phone wakes up or the tab comes back */
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&loaded)loadAll().catch(function(){});});
  }

  listen();
  loadAll().catch(function(e){failAll(wrapErr(e));});

  function parse(path){var i=String(path).indexOf('/');return {c:path.slice(0,i),id:path.slice(i+1)};}
  function write(path,body){
    var p=parse(path),k=key(p.c,p.id);
    if(!cache[p.c])return Promise.reject(Object.assign(new Error('Unknown collection'),{code:'invalid_argument'}));
    var prev=cache[p.c][p.id];
    if(body===null)delete cache[p.c][p.id];else cache[p.c][p.id]=clone(body);
    pending[k]=(pending[k]||0)+1;
    emit(p.c,p.id);
    var req=body===null
      ?sb.from('docs').delete().eq('collection',p.c).eq('id',p.id)
      :sb.from('docs').upsert({collection:p.c,id:p.id,data:body},{onConflict:'collection,id'}).select('updated_at');
    return req.then(function(r){
      pending[k]--;if(!pending[k])delete pending[k];
      if(r.error){
        /* put back what the server still has */
        if(!pending[k]){if(prev===undefined)delete cache[p.c][p.id];else cache[p.c][p.id]=prev;emit(p.c,p.id);}
        throw wrapErr(r.error);
      }
      if(body!==null&&r.data&&r.data[0])ver[k]=r.data[0].updated_at;
    },function(e){pending[k]--;if(!pending[k])delete pending[k];throw wrapErr(e);});
  }

  return {
    collection:function(c){return {onSnapshot:function(next,error){var s={next:next,error:error};(colSubs[c]=colSubs[c]||[]).push(s);if(loaded)next(colSnap(c));return function(){colSubs[c]=colSubs[c].filter(function(x){return x!==s;});};}};},
    doc:function(path){
      var p=parse(path);
      return {
        onSnapshot:function(next,error){var k=key(p.c,p.id),s={next:next,error:error};(docSubs[k]=docSubs[k]||[]).push(s);if(loaded)next(docSnap(p.c,p.id));return function(){docSubs[k]=docSubs[k].filter(function(x){return x!==s;});};},
        set:function(body){return write(path,body);},
        delete:function(){return write(path,null);}
      };
    },
    close:function(){if(channel)sb.removeChannel(channel);}
  };
}

window.GainzCloud={auth:auth,openDb:openDb};
})();
