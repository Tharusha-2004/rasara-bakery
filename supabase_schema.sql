-- Create orders table if it doesn't exist
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,
    delivery_address text not null,
    status text default 'pending' not null,
    total_price decimal(10, 2) not null
);

-- Create order_items table if it doesn't exist
-- UPDATED: Changed product_id to bigint to match your existing products table
create table if not exists public.order_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id bigint references public.products(id) not null,
    quantity integer not null,
    price_at_purchase decimal(10, 2) not null
);

-- Create function to decrement stock
-- UPDATED: Changed product_id to bigint
create or replace function public.decrement_stock(product_id bigint, quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_quantity = stock_quantity - quantity
  where id = product_id;
end;
$$;

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Create policies to allow public access (for development/demo purposes)
-- Orders policies
create policy "Enable insert for all users" on public.orders for insert with check (true);
create policy "Enable select for all users" on public.orders for select using (true);

-- Order Items policies
create policy "Enable insert for all users" on public.order_items for insert with check (true);
create policy "Enable select for all users" on public.order_items for select using (true);
