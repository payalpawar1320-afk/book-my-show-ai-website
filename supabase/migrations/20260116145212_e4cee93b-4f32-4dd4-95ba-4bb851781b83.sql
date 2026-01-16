-- Create a secure booking function that validates all inputs server-side
-- This prevents price manipulation, race conditions, and invalid data

CREATE OR REPLACE FUNCTION public.create_booking_safe(
  p_movie_id UUID,
  p_show_date DATE,
  p_show_time TIME,
  p_seats INTEGER
) RETURNS TABLE(
  booking_id UUID, 
  booking_code TEXT,
  total_amount NUMERIC, 
  success BOOLEAN, 
  error_msg TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_showtime_id UUID;
  v_price NUMERIC;
  v_available INTEGER;
  v_booking_id UUID;
  v_booking_code TEXT;
  v_total NUMERIC;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::NUMERIC, false, 'User not authenticated'::TEXT;
    RETURN;
  END IF;
  
  -- Validate seats is reasonable (1-10 per booking)
  IF p_seats < 1 OR p_seats > 10 THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::NUMERIC, false, 'Invalid seat count (must be 1-10)'::TEXT;
    RETURN;
  END IF;
  
  -- Validate show_date is not in the past
  IF p_show_date < CURRENT_DATE THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::NUMERIC, false, 'Cannot book for past dates'::TEXT;
    RETURN;
  END IF;
  
  -- Lock and get showtime details atomically
  SELECT id, price, available_seats INTO v_showtime_id, v_price, v_available
  FROM showtimes
  WHERE movie_id = p_movie_id 
    AND show_date = p_show_date 
    AND show_time = p_show_time
    AND is_available = true
  FOR UPDATE;
  
  -- Validate showtime exists
  IF v_showtime_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::NUMERIC, false, 'Invalid or unavailable showtime'::TEXT;
    RETURN;
  END IF;
  
  -- Check seat availability
  IF v_available IS NULL OR v_available < p_seats THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::NUMERIC, false, 'Not enough seats available'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate total server-side (prevents price manipulation)
  v_total := COALESCE(v_price, 250) * p_seats;
  
  -- Create booking
  INSERT INTO bookings (user_id, movie_id, seats, show_date, show_time, total_amount, status)
  VALUES (v_user_id, p_movie_id, p_seats, p_show_date, p_show_time, v_total, 'pending')
  RETURNING id, bookings.booking_code INTO v_booking_id, v_booking_code;
  
  -- Decrement seats atomically
  UPDATE showtimes 
  SET available_seats = available_seats - p_seats
  WHERE id = v_showtime_id;
  
  RETURN QUERY SELECT v_booking_id, v_booking_code, v_total, true, ''::TEXT;
END;
$$;

-- Create a trigger to restore seats when booking is cancelled
CREATE OR REPLACE FUNCTION public.restore_seats_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only restore seats when status changes to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE showtimes 
    SET available_seats = available_seats + OLD.seats
    WHERE movie_id = OLD.movie_id 
      AND show_date = OLD.show_date 
      AND show_time = OLD.show_time;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS restore_seats_on_cancel_trigger ON bookings;
CREATE TRIGGER restore_seats_on_cancel_trigger
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION public.restore_seats_on_cancel();