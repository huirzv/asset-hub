-- ===== enums =====
create type public.app_role as enum ('admin','moderator','user');
create type public.upload_status as enum ('uploading','quarantined','validating','scanning','approved','rejected');
create type public.scan_status as enum ('pending','scanning','clean','infected','failed','skipped');
create type public.validation_status as enum ('pending','passed','failed');
create type public.moderation_status as enum ('pending','approved','rejected');

-- ===== profiles =====
create table public.profiles (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  website text,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- ===== roles =====
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles_read_own" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ===== assets =====
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  category text not null,
  thumbnail_url text,
  preview_model_url text,
  download_file_path text,
  license text not null default 'CC0',
  formats text[] not null default '{}',
  engines text[] not null default '{}',
  tags text[] not null default '{}',
  file_size bigint not null default 0,
  triangle_count integer,
  version text not null default '1.0',
  included_files text[] not null default '{}',
  download_count integer not null default 0,
  like_count integer not null default 0,
  upload_status public.upload_status not null default 'quarantined',
  scan_status public.scan_status not null default 'pending',
  scan_result jsonb,
  scan_timestamp timestamptz,
  validation_status public.validation_status not null default 'pending',
  moderation_status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assets_public_idx on public.assets (upload_status, moderation_status, created_at desc);
create index assets_creator_idx on public.assets (creator_id);
create index assets_category_idx on public.assets (category);
create index assets_tags_idx on public.assets using gin (tags);
create index assets_engines_idx on public.assets using gin (engines);
create index assets_formats_idx on public.assets using gin (formats);

grant select on public.assets to anon;
grant select, insert, update, delete on public.assets to authenticated;
grant all on public.assets to service_role;
alter table public.assets enable row level security;

create policy "assets_public_read" on public.assets for select
  using (upload_status = 'approved' and moderation_status = 'approved');
create policy "assets_owner_read" on public.assets for select to authenticated
  using (creator_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "assets_owner_insert" on public.assets for insert to authenticated
  with check (creator_id = auth.uid());
create policy "assets_owner_update" on public.assets for update to authenticated
  using (creator_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (creator_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "assets_owner_delete" on public.assets for delete to authenticated
  using (creator_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.guard_asset_trust_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(),'admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.upload_status := 'quarantined';
    new.scan_status := 'pending';
    new.scan_result := null;
    new.scan_timestamp := null;
    new.validation_status := 'pending';
    new.moderation_status := 'pending';
    new.download_count := 0;
    new.like_count := 0;
  else
    new.upload_status := old.upload_status;
    new.scan_status := old.scan_status;
    new.scan_result := old.scan_result;
    new.scan_timestamp := old.scan_timestamp;
    new.validation_status := old.validation_status;
    new.moderation_status := old.moderation_status;
    new.download_count := old.download_count;
    new.like_count := old.like_count;
    new.creator_id := old.creator_id;
    new.updated_at := now();
  end if;
  return new;
end;
$$;
create trigger assets_guard_trust before insert or update on public.assets
  for each row execute function public.guard_asset_trust_fields();

-- ===== favorites =====
create table public.favorites (
  user_id uuid not null,
  asset_id uuid not null references public.assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, asset_id)
);
create index favorites_asset_idx on public.favorites (asset_id);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "favorites_own_all" on public.favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.sync_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.assets set like_count = like_count + 1 where id = new.asset_id;
    return new;
  else
    update public.assets set like_count = greatest(like_count - 1, 0) where id = old.asset_id;
    return old;
  end if;
end;
$$;
create trigger favorites_like_count after insert or delete on public.favorites
  for each row execute function public.sync_like_count();

-- ===== collections =====
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  cover_image text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index collections_creator_idx on public.collections (creator_id);
grant select on public.collections to anon;
grant select, insert, update, delete on public.collections to authenticated;
grant all on public.collections to service_role;
alter table public.collections enable row level security;
create policy "collections_public_read" on public.collections for select using (is_public = true);
create policy "collections_owner_read" on public.collections for select to authenticated using (creator_id = auth.uid());
create policy "collections_owner_write" on public.collections for insert to authenticated with check (creator_id = auth.uid());
create policy "collections_owner_update" on public.collections for update to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "collections_owner_delete" on public.collections for delete to authenticated using (creator_id = auth.uid());

create table public.collection_assets (
  collection_id uuid not null references public.collections(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, asset_id)
);
create index collection_assets_asset_idx on public.collection_assets (asset_id);
grant select on public.collection_assets to anon;
grant select, insert, delete on public.collection_assets to authenticated;
grant all on public.collection_assets to service_role;
alter table public.collection_assets enable row level security;
create policy "collection_assets_public_read" on public.collection_assets for select
  using (exists (select 1 from public.collections c where c.id = collection_id and c.is_public));
create policy "collection_assets_owner_all" on public.collection_assets for all to authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.creator_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.creator_id = auth.uid()));

-- ===== download events =====
create table public.download_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index download_events_asset_idx on public.download_events (asset_id, created_at desc);
grant insert on public.download_events to anon, authenticated;
grant all on public.download_events to service_role;
alter table public.download_events enable row level security;
create policy "download_events_insert_any" on public.download_events for insert with check (true);
create policy "download_events_admin_read" on public.download_events for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.sync_download_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.assets set download_count = download_count + 1 where id = new.asset_id;
  return new;
end;
$$;
create trigger download_events_count after insert on public.download_events
  for each row execute function public.sync_download_count();

-- ===== reports =====
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  reporter_id uuid,
  reason text not null,
  description text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_asset_idx on public.reports (asset_id);
grant insert on public.reports to anon, authenticated;
grant select, update on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports_insert_any" on public.reports for insert with check (true);
create policy "reports_admin_read" on public.reports for select to authenticated
  using (public.has_role(auth.uid(),'admin') or reporter_id = auth.uid());
create policy "reports_admin_update" on public.reports for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ===== new user profile bootstrap =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  n int := 0;
begin
  base_username := regexp_replace(lower(split_part(coalesce(new.email,'creator'),'@',1)), '[^a-z0-9_]', '', 'g');
  if base_username = '' then base_username := 'creator'; end if;
  final_username := base_username;
  while exists (select 1 from public.profiles p where p.username = final_username) loop
    n := n + 1;
    final_username := base_username || n::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, coalesce(new.raw_user_meta_data->>'display_name', final_username));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== demo content =====
insert into public.profiles (id, username, display_name, avatar_url, bio, website) values
 ('11111111-1111-4111-8111-111111111101','pixelforge','Pixel Forge', null, 'Low poly props and environment kits for stylized games.', 'https://example.com/pixelforge'),
 ('11111111-1111-4111-8111-111111111102','nova_assets','Nova Assets', null, 'Sci-fi and hard surface kitbash sets.', null),
 ('11111111-1111-4111-8111-111111111103','tinytree','Tiny Tree Studio', null, 'Nature, foliage and outdoor environment packs.', null),
 ('11111111-1111-4111-8111-111111111104','uicraft','UI Craft', null, 'Clean game UI kits and icon sets.', null);

insert into public.assets (creator_id, slug, name, description, category, thumbnail_url, license, formats, engines, tags, file_size, triangle_count, version, included_files, download_count, like_count, upload_status, scan_status, validation_status, moderation_status) values
 ('11111111-1111-4111-8111-111111111101','low-poly-cafe-pack','Low Poly Cafe Pack','A cozy stylized cafe interior kit with modular walls, tables, chairs, espresso machine, pastries and signage. Everything is UV unwrapped and shares a single palette texture so you can drop the whole set into a scene without a material explosion.','3d-models','/images/assets/low-poly-cafe.jpg','CC0','{GLB,FBX,BLEND}','{unity,godot,unreal,blender,roblox}','{"low poly","furniture","interior","cafe","stylized"}',44040192,18400,'1.2','{restaurant.glb,restaurant.fbx,textures/,README.txt}',12840,1820,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111103','stylized-pine-trees','Stylized Pine Trees','Twelve hand-modelled pine tree variants with three LOD levels each, built for forest scenes that need density without wrecking frame time.','3d-models','/images/assets/pine-trees.jpg','CC0','{GLB,FBX,OBJ}','{unity,godot,unreal,blender}','{nature,trees,environment,"low poly",forest}',22020096,9600,'2.0','{pines.glb,pines.fbx,textures/,LICENSE.txt}',9310,1402,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111101','modern-furniture-kit','Modern Furniture Kit','Minimal contemporary furniture set: sofas, shelving, lamps, rugs and kitchen units. Grid-snapped pivots for fast level assembly.','3d-models','/images/assets/furniture-kit.jpg','CC BY','{GLB,FBX,BLEND}','{unity,unreal,blender}','{furniture,interior,modern,minimal}',67108864,31200,'1.4','{furniture.glb,furniture.fbx,textures/,README.txt}',7420,980,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111102','fantasy-weapons-pack','Fantasy Weapons Pack','Swords, axes, bows and staves in a stylized fantasy silhouette language. Includes sheathed variants and socket-ready pivots.','3d-models','/images/assets/fantasy-weapons.jpg','CC0','{GLB,FBX,OBJ}','{unity,unreal,godot,roblox}','{weapons,fantasy,rpg,stylized}',31457280,24100,'1.0','{weapons.glb,weapons.fbx,textures/}',15230,2310,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111104','simulator-ui-kit','Simulator UI Kit','A complete HUD and menu system for simulator and tycoon games: currency bars, shop panels, rebirth screens, tooltips and buttons in nine color variants.','ui-kits','/images/assets/simulator-ui.jpg','CC BY','{PNG,SVG,ZIP}','{roblox,unity,godot}','{ui,hud,simulator,tycoon,interface}',18874368,null,'3.1','{ui-kit.zip,svg/,png/,README.txt}',20140,3120,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111101','low-poly-city-props','Low Poly City Props','Street level city dressing: benches, hydrants, traffic lights, bins, bus stops, planters and signage. Optimized for open world streaming.','3d-models','/images/assets/city-props.jpg','CC0','{GLB,FBX}','{unity,godot,unreal,roblox}','{city,props,"low poly",urban,environment}',52428800,27800,'1.1','{city-props.glb,city-props.fbx,textures/}',8890,1120,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111102','cartoon-food-pack','Cartoon Food Pack','Forty appetising cartoon food items — burgers, sushi, donuts, drinks — with chunky readable shapes that hold up at small sizes.','3d-models','/images/assets/food-pack.jpg','CC0','{GLB,OBJ}','{roblox,unity,godot,blender}','{food,cartoon,props,stylized}',12582912,8200,'1.3','{food.glb,food.obj,textures/}',11020,1740,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111102','sci-fi-corridor-kit','Sci-Fi Corridor Kit','Modular sci-fi corridor pieces with emissive trim maps, doors, junctions and vent details. Snap grid is 2m.','3d-models','/images/assets/scifi-corridor.jpg','CC BY','{GLB,FBX,BLEND}','{unreal,unity,godot,blender}','{"sci-fi",modular,corridor,realistic,interior}',94371840,52400,'2.2','{corridor.glb,corridor.fbx,textures/,README.txt}',6410,890,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111103','nature-essentials','Nature Essentials','Rocks, grass clumps, bushes, logs and cliff pieces — the baseline scatter set every outdoor level needs.','3d-models','/images/assets/nature-essentials.jpg','CC0','{GLB,FBX,OBJ,BLEND}','{unity,unreal,godot,blender,roblox}','{nature,rocks,foliage,environment,scatter}',41943040,21300,'1.5','{nature.glb,nature.fbx,textures/}',13760,2050,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111104','minimal-game-icons','Minimal Game Icons','Two hundred crisp vector game icons on a consistent 24px grid: inventory, combat, settings, social and economy.','icons','/images/assets/game-icons.jpg','CC0','{SVG,PNG,ZIP}','{unity,godot,roblox,unreal}','{icons,ui,minimal,vector}',5242880,null,'4.0','{icons.zip,svg/,png/,LICENSE.txt}',24310,3980,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111103','hand-painted-textures','Hand Painted Texture Set','Sixty seamless hand painted textures — wood, stone, fabric, foliage and metal — at 2K with matching normal maps.','textures','/images/assets/textures-set.jpg','CC BY','{PNG,ZIP}','{unity,unreal,godot,blender}','{textures,"hand painted",seamless,stylized}',157286400,null,'1.0','{textures.zip,albedo/,normal/,README.txt}',5620,760,'approved','clean','passed','approved'),
 ('11111111-1111-4111-8111-111111111102','stylized-vfx-pack','Stylized VFX Pack','Sprite sheets and flipbooks for hits, explosions, magic bursts and pickups. Includes premultiplied and straight alpha variants.','vfx','/images/assets/vfx-pack.jpg','CC0','{PNG,ZIP}','{unity,unreal,godot}','{vfx,effects,stylized,flipbook}',73400320,null,'1.1','{vfx.zip,flipbooks/,README.txt}',4980,720,'approved','clean','passed','approved');

insert into public.collections (creator_id, name, slug, description, cover_image) values
 ('11111111-1111-4111-8111-111111111101','Cozy Cafe Starter Kit','cozy-cafe-starter-kit','Everything you need to build a warm, stylized cafe scene.','/images/assets/low-poly-cafe.jpg'),
 ('11111111-1111-4111-8111-111111111101','Low Poly City','low-poly-city','Street props, vehicles and dressing for a stylized urban map.','/images/assets/city-props.jpg'),
 ('11111111-1111-4111-8111-111111111102','Fantasy RPG Essentials','fantasy-rpg-essentials','Weapons, props and effects for a stylized RPG prototype.','/images/assets/fantasy-weapons.jpg'),
 ('11111111-1111-4111-8111-111111111101','Modern House Pack','modern-house-pack','Contemporary interior and exterior building blocks.','/images/assets/furniture-kit.jpg'),
 ('11111111-1111-4111-8111-111111111104','Simulator UI Kit','simulator-ui-collection','HUD, shop and progression interfaces for simulator games.','/images/assets/simulator-ui.jpg'),
 ('11111111-1111-4111-8111-111111111103','Nature Essentials','nature-essentials-collection','Foliage, rocks and scatter for outdoor environments.','/images/assets/pine-trees.jpg');

insert into public.collection_assets (collection_id, asset_id)
select c.id, a.id from public.collections c join public.assets a on true
where (c.slug='cozy-cafe-starter-kit' and a.slug in ('low-poly-cafe-pack','modern-furniture-kit','cartoon-food-pack','hand-painted-textures'))
   or (c.slug='low-poly-city' and a.slug in ('low-poly-city-props','modern-furniture-kit','nature-essentials'))
   or (c.slug='fantasy-rpg-essentials' and a.slug in ('fantasy-weapons-pack','stylized-vfx-pack','minimal-game-icons','hand-painted-textures'))
   or (c.slug='modern-house-pack' and a.slug in ('modern-furniture-kit','hand-painted-textures'))
   or (c.slug='simulator-ui-collection' and a.slug in ('simulator-ui-kit','minimal-game-icons'))
   or (c.slug='nature-essentials-collection' and a.slug in ('nature-essentials','stylized-pine-trees','hand-painted-textures'));