-- Reset tables if they exist
drop table if exists "public"."solar_analyses" cascade;
drop table if exists "public"."searches" cascade;
drop table if exists "public"."profiles" cascade;

-- Create tables
create table "public"."profiles" (
    id uuid references auth.users on delete cascade not null primary key,
    email text,
    full_name text,
    avatar_url text,
    is_admin boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table "public"."searches" (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id),
    address text not null,
    latitude numeric not null,
    longitude numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_claimed boolean default false
);

create table "public"."solar_analyses" (
    id uuid default gen_random_uuid() primary key,
    search_id uuid references public.searches(id) on delete cascade not null,
    roof_size text,
    solar_potential text,
    annual_production text,
    cost_savings text,
    carbon_offset text,
    installation_cost text,
    raw_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index searches_user_id_idx on public.searches(user_id);
create index solar_analyses_search_id_idx on public.solar_analyses(search_id);

-- Enable RLS
alter table "public"."profiles" enable row level security;
alter table "public"."searches" enable row level security;
alter table "public"."solar_analyses" enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
on profiles for select
using ( true );

create policy "Users can insert their own profile"
on profiles for insert
with check ( auth.uid() = id );

create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );

-- Searches policies
create policy "Searches are viewable by everyone"
on searches for select
using ( true );

create policy "Authenticated users can insert searches"
on searches for insert
with check ( auth.role() = 'authenticated' );

create policy "Users can update own searches"
on searches for update
using ( auth.uid() = user_id or user_id is null );

-- Solar analyses policies
create policy "Solar analyses are viewable by everyone"
on solar_analyses for select
using ( true );

create policy "Authenticated users can insert analyses"
on solar_analyses for insert
with check ( auth.role() = 'authenticated' );

create policy "Users can update analyses connected to their searches"
on solar_analyses for update
using (
    exists (
        select 1 from searches
        where searches.id = solar_analyses.search_id
        and searches.user_id = auth.uid()
    )
);

-- Functions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$;

-- Triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();