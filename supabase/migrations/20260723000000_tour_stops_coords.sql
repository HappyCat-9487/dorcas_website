-- Add optional GPS coordinates to tour stops so the front-end can render
-- an interactive map with numbered pins for each itinerary stop.

alter table public.tour_stops
    add column if not exists latitude  double precision,
    add column if not exists longitude double precision;

comment on column public.tour_stops.latitude  is 'WGS-84 latitude (optional).  e.g. 35.6762';
comment on column public.tour_stops.longitude is 'WGS-84 longitude (optional). e.g. 139.6503';
