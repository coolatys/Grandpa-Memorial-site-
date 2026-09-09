-- 1. Clear placeholder events
DELETE FROM public.service_events;

-- 2. Insert new Wake Keep event
INSERT INTO public.service_events (event_day, time, title, description, sort_order) VALUES
('wake_keep', '5:00 PM', 'Wake Keep Service', 'Venue: 1, Ginsanrin, Along Agbala Road, Off Ilisan Road, Iperu remo, Ogun State', 1);

-- 3. Insert new Burial events
INSERT INTO public.service_events (event_day, time, title, description, sort_order) VALUES
('burial', '11:00 AM', 'Funeral Service', 'Venue: Wesley Methodist Cathedral Akesan, Iperu Remo, Ogun State', 1),
('burial', 'Following Service', 'Interment', 'Venue: Methodist Cathedral Cemetery, Iperu Remo, Ogun State', 2),
('burial', 'After Interment', 'Reception', 'Venue: Ajadeh Event and Conference Center, along Sagamu Iperu Road, Opposite Seminary, Iperu Remo, Ogun State', 3);

-- 4. Update the countdown settings (assuming only 1 row exists)
UPDATE public.site_settings 
SET 
    wake_keep_datetime = '2026-09-17T17:00:00+01:00',
    burial_datetime = '2026-09-18T11:00:00+01:00',
    venue_name = 'Wesley Methodist Cathedral Akesan',
    venue_address = 'Iperu Remo, Ogun State';
