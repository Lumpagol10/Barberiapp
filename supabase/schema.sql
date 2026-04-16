create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'owner',
  authorized boolean default false -- Control de Franmark Digital
);

-- Trigger automático para crear perfil al registrarse
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table configuracion_barberia (
  id serial primary key,
  hora_apertura time not null default '09:00',
  hora_cierre time not null default '20:00',
  intervalo_minutos int not null default 15,
  telefono_barbero text,
  created_at timestamptz default now()
);

-- Insertar configuración inicial (15 minutos) con teléfono de prueba
insert into configuracion_barberia (hora_apertura, hora_cierre, intervalo_minutos, telefono_barbero)
values ('09:00', '20:00', 15, '5491112345678');

create table turnos (
  id uuid default gen_random_uuid() primary key,
  cliente_nombre text not null,
  cliente_telefono text not null,
  fecha date not null,
  hora time not null,
  created_at timestamptz default now()
);
