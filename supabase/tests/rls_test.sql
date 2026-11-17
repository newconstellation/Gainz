\set ON_ERROR_STOP 0
update public.app_config set value='coach@gym.com' where key='trainer_email';
create or replace function as_user(uid text, em text) returns void language plpgsql as $$ begin
  perform set_config('request.jwt.claims', json_build_object('sub',uid,'email',em)::text, false); end $$;
grant execute on function as_user(text,text) to authenticated;
-- trainer signs in, sets up data
select as_user('00000000-0000-0000-0000-00000000000a','coach@gym.com');
set role authenticated;
select 'T whoami', * from gainz_whoami();
insert into docs(collection,id,data) values ('settings','trainer','{"name":"Coach K"}'),
 ('clients','c-sarah','{"name":"Sarah Lee","email":"Sarah@X.com"}'),('clients','c-bob','{"name":"Bob Ray","email":"bob@x.com"}'),
 ('workouts','w1','{"clientId":"c-sarah","title":"Legs"}'),('workouts','w2','{"clientId":"c-bob","title":"Arms"}'),
 ('templates','t1','{"title":"T"}'),('exercises','squat','{"name":"Squat"}'),
 ('posts','p1','{"author":"trainer","text":"Welcome","pinned":true}');
select 'T sees', count(*) from docs;
reset role;
-- sarah
select as_user('00000000-0000-0000-0000-00000000000b','sarah@x.com');
set role authenticated;
select 'S whoami', * from gainz_whoami();
select 'S sees', collection, id from docs order by 1,2;
update docs set data=data||'{"title":"Legs done"}' where id='w1';
select 'S upd own w1 ->', data->>'title' from docs where id='w1';
update docs set data=data||'{"title":"hack"}' where id='w2';  -- invisible -> 0 rows
insert into docs(collection,id,data) values('workouts','w3','{"clientId":"c-sarah","title":"Program day"}') on conflict (collection,id) do update set data=excluded.data;
select 'S new w3', count(*) from docs where id='w3';
insert into docs(collection,id,data) values('workouts','w4','{"clientId":"c-bob"}'); -- expect error
insert into docs(collection,id,data) values('workouts','w1','{"clientId":"c-bob","title":"move"}') on conflict (collection,id) do update set data=excluded.data; -- expect error
insert into docs(collection,id,data) values('clients','c-sarah','{"name":"Sarah Lee","email":"sarah@x.com","playlist":"spotify"}') on conflict (collection,id) do update set data=excluded.data;
select 'S playlist', data->>'playlist' from docs where id='c-sarah';
insert into docs(collection,id,data) values('clients','c-sarah','{"name":"Sarah Lee","email":"evil@x.com"}') on conflict (collection,id) do update set data=excluded.data; -- expect error
insert into docs(collection,id,data) values('posts','p2','{"author":"c-sarah","text":"hi","pinned":true}');
select 'S post', data->>'authorName', data->>'pinned' from docs where id='p2';
insert into docs(collection,id,data) values('posts','p3','{"author":"c-bob","text":"fake"}'); -- expect error
insert into docs(collection,id,data) values('templates','t2','{}'); -- expect error
delete from docs where id='p1'; select 'S del trainer post (should still exist)', count(*) from docs where id='p1';
delete from docs where id='p2'; select 'S del own post', count(*) from docs where id='p2';
select 'S members', count(*) from members;
select 'S app_config'; select * from app_config; -- expect error
reset role;
-- bob
select as_user('00000000-0000-0000-0000-00000000000c','bob@x.com'); set role authenticated;
select 'B whoami', * from gainz_whoami(); select 'B sees', collection, id from docs order by 1,2;
reset role;
-- stranger
select as_user('00000000-0000-0000-0000-00000000000d','stranger@x.com'); set role authenticated;
select 'X whoami', * from gainz_whoami();
select 'X sees', count(*) from docs;
insert into docs(collection,id,data) values('posts','p9','{"author":null}'); -- expect error
reset role;
-- anon
set role anon; select 'anon sees', count(*) from docs; reset role;
