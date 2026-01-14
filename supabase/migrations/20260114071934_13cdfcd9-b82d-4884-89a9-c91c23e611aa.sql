-- Create theaters table
CREATE TABLE public.theaters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Mumbai',
  amenities TEXT[] DEFAULT '{}',
  total_screens INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showtimes table linking movies to theaters
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  screen_number INTEGER DEFAULT 1,
  available_seats INTEGER DEFAULT 100,
  price NUMERIC DEFAULT 250.00,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movie_id, theater_id, show_date, show_time, screen_number)
);

-- Enable RLS
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Anyone can view theaters
CREATE POLICY "Anyone can view theaters" ON public.theaters
  FOR SELECT USING (true);

-- Anyone can view available showtimes
CREATE POLICY "Anyone can view showtimes" ON public.showtimes
  FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_theaters_updated_at
  BEFORE UPDATE ON public.theaters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_showtimes_updated_at
  BEFORE UPDATE ON public.showtimes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample theaters
INSERT INTO public.theaters (name, location, city, amenities, total_screens) VALUES
  ('PVR ICON', 'Phoenix Mall, Lower Parel', 'Mumbai', ARRAY['Dolby Atmos', 'IMAX', 'Recliner Seats', 'F&B'], 8),
  ('INOX Megaplex', 'Inorbit Mall, Malad', 'Mumbai', ARRAY['4DX', 'Dolby Atmos', 'Premium Lounge'], 10),
  ('Cinepolis', 'Viviana Mall, Thane', 'Mumbai', ARRAY['VIP Seats', 'Dolby Atmos', 'Kids Zone'], 6),
  ('PVR Juhu', 'Juhu Tara Road', 'Mumbai', ARRAY['Recliner Seats', 'Premium Sound'], 4),
  ('INOX Nakshatra', 'Dadar', 'Mumbai', ARRAY['Dolby Sound', 'Comfortable Seating'], 5),
  ('Carnival Cinemas', 'IMAX Wadala', 'Mumbai', ARRAY['IMAX', 'Dolby Atmos', '3D'], 7);

-- Generate showtimes for all movies at all theaters for the next 7 days
INSERT INTO public.showtimes (movie_id, theater_id, show_date, show_time, screen_number, available_seats, price)
SELECT 
  m.id as movie_id,
  t.id as theater_id,
  d.show_date,
  st.show_time::time,
  (floor(random() * 3) + 1)::integer as screen_number,
  (floor(random() * 50) + 50)::integer as available_seats,
  CASE 
    WHEN st.show_time = '10:00' THEN 180
    WHEN st.show_time = '13:30' THEN 220
    WHEN st.show_time = '17:00' THEN 280
    WHEN st.show_time = '20:30' THEN 320
    ELSE 250
  END as price
FROM public.movies m
CROSS JOIN public.theaters t
CROSS JOIN (
  SELECT CURRENT_DATE + i as show_date 
  FROM generate_series(0, 6) i
) d
CROSS JOIN (
  SELECT unnest(ARRAY['10:00', '13:30', '17:00', '20:30']) as show_time
) st
WHERE m.is_available = true;