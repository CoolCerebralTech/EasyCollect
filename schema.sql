-- =====================================================
-- THE LEDGER: Complete Database Schema (Updated to 'Organizer' Terminology)
-- No Authentication, Token-Based Access Control
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: rooms
-- The core entity representing a contribution room
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
  description TEXT,
  target_amount NUMERIC(15, 2) CHECK (target_amount IS NULL OR target_amount > 0),
  currency TEXT NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD', 'UGX', 'TZS')),
  
  -- Token-based access control
  organizer_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  contributor_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  
  -- PIN security (bcrypt hash of 4-6 digit PIN)
  pin_hash TEXT NOT NULL,
  
  -- Room lifecycle
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Flexible settings storage
  settings JSONB DEFAULT '{
    "allow_pledges": true,
    "allow_anonymous": false,
    "show_amounts_to_contributors": true,
    "enable_milestones": true,
    "reminder_days_before": 3
  }'::jsonb,
  
  -- Metadata
  total_collected NUMERIC(15, 2) DEFAULT 0,
  total_pledged NUMERIC(15, 2) DEFAULT 0,
  contributor_count INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_rooms_organizer_token ON rooms(organizer_token);
CREATE INDEX idx_rooms_contributor_token ON rooms(contributor_token);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_created_at ON rooms(created_at DESC);

-- =====================================================
-- TABLE: contributions
-- Individual payment records
-- =====================================================
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  
  -- Contributor details
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  phone_number TEXT,
  
  -- Payment details
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL DEFAULT 'MPESA' CHECK (payment_method IN ('MPESA', 'CASH', 'BANK', 'AIRTEL', 'OTHER')),
  transaction_ref TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pledged', 'cancelled')),
  confirmed_at TIMESTAMPTZ,
  
  -- Additional context
  notes TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contributions_room_id ON contributions(room_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_created_at ON contributions(created_at DESC);
CREATE INDEX idx_contributions_transaction_ref ON contributions(transaction_ref) WHERE transaction_ref IS NOT NULL;

-- =====================================================
-- TABLE: room_activity_log
-- Audit trail for transparency
-- =====================================================
CREATE TABLE IF NOT EXISTS room_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('room_created', 'contribution_added', 'contribution_updated', 'contribution_deleted', 'room_archived', 'settings_changed')),
  details JSONB,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('organizer', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_log_room_id ON room_activity_log(room_id, created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update room statistics
-- =====================================================
CREATE OR REPLACE FUNCTION update_room_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE rooms
    SET 
      total_collected = (
        SELECT COALESCE(SUM(amount), 0)
        FROM contributions
        WHERE room_id = NEW.room_id AND status = 'confirmed'
      ),
      total_pledged = (
        SELECT COALESCE(SUM(amount), 0)
        FROM contributions
        WHERE room_id = NEW.room_id AND status = 'pledged'
      ),
      contributor_count = (
        SELECT COUNT(DISTINCT name)
        FROM contributions
        WHERE room_id = NEW.room_id AND status IN ('confirmed', 'pledged')
      ),
      last_contribution_at = CASE 
        WHEN NEW.status = 'confirmed' THEN NEW.confirmed_at
        ELSE last_contribution_at
      END
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rooms
    SET 
      total_collected = (
        SELECT COALESCE(SUM(amount), 0)
        FROM contributions
        WHERE room_id = OLD.room_id AND status = 'confirmed'
      ),
      total_pledged = (
        SELECT COALESCE(SUM(amount), 0)
        FROM contributions
        WHERE room_id = OLD.room_id AND status = 'pledged'
      ),
      contributor_count = (
        SELECT COUNT(DISTINCT name)
        FROM contributions
        WHERE room_id = OLD.room_id AND status IN ('confirmed', 'pledged')
      )
    WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room_statistics
AFTER INSERT OR UPDATE OR DELETE ON contributions
FOR EACH ROW EXECUTE FUNCTION update_room_statistics();

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contributions_updated_at
BEFORE UPDATE ON contributions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RPC FUNCTION: Create Room
-- =====================================================
CREATE OR REPLACE FUNCTION create_room(
  p_title TEXT,
  p_description TEXT,
  p_target_amount NUMERIC,
  p_currency TEXT,
  p_pin TEXT, 
  p_expires_in_days INTEGER DEFAULT 30,
  p_settings JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
  v_organizer_token UUID;
  v_contributor_token UUID;
  v_pin_hash TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF p_pin !~ '^\d{4,6}$' THEN
    RAISE EXCEPTION 'PIN must be 4-6 digits';
  END IF;
  
  v_pin_hash := crypt(p_pin, gen_salt('bf', 8));
  
  IF p_expires_in_days IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  END IF;
  
  v_organizer_token := uuid_generate_v4();
  v_contributor_token := uuid_generate_v4();
  
  INSERT INTO rooms (
    title,
    description,
    target_amount,
    currency,
    organizer_token,
    contributor_token,
    pin_hash,
    expires_at,
    settings
  ) VALUES (
    p_title,
    p_description,
    p_target_amount,
    p_currency,
    v_organizer_token,
    v_contributor_token,
    v_pin_hash,
    v_expires_at,
    COALESCE(p_settings, '{}'::jsonb)
  )
  RETURNING id INTO v_room_id;
  
  INSERT INTO room_activity_log (room_id, action, actor_type, details)
  VALUES (v_room_id, 'room_created', 'organizer', json_build_object('title', p_title)::jsonb);
  
  RETURN json_build_object(
    'room_id', v_room_id,
    'organizer_token', v_organizer_token,
    'contributor_token', v_contributor_token,
    'organizer_url', '/room/' || v_organizer_token,
    'contributor_url', '/room/' || v_contributor_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Validate Organizer Access
-- =====================================================
CREATE OR REPLACE FUNCTION validate_organizer_access(
  p_token UUID,
  p_pin TEXT
)
RETURNS JSON AS $$
DECLARE
  v_room RECORD;
  v_is_valid BOOLEAN;
BEGIN
  SELECT * INTO v_room
  FROM rooms
  WHERE organizer_token = p_token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid organizer token';
  END IF;
  
  v_is_valid := (v_room.pin_hash = crypt(p_pin, v_room.pin_hash));
  
  IF NOT v_is_valid THEN
    RAISE EXCEPTION 'Invalid PIN';
  END IF;
  
  RETURN json_build_object(
    'access_granted', true,
    'room_id', v_room.id,
    'role', 'organizer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Get Room Details
-- =====================================================
CREATE OR REPLACE FUNCTION get_room_details(
  p_token UUID
)
RETURNS JSON AS $$
DECLARE
  v_room RECORD;
  v_role TEXT;
  v_contributions JSON;
BEGIN
  SELECT 
    *,
    CASE 
      WHEN organizer_token = p_token THEN 'organizer'
      WHEN contributor_token = p_token THEN 'contributor'
      ELSE NULL
    END as access_role
  INTO v_room
  FROM rooms
  WHERE organizer_token = p_token OR contributor_token = p_token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid room token';
  END IF;
  
  v_role := v_room.access_role;
  
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'name', CASE 
        WHEN c.is_anonymous AND v_role = 'contributor' THEN 'Anonymous'
        ELSE c.name
      END,
      'amount', c.amount,
      'payment_method', c.payment_method,
      'transaction_ref', CASE
        WHEN v_role = 'organizer' THEN c.transaction_ref
        ELSE NULL
      END,
      'status', c.status,
      'confirmed_at', c.confirmed_at,
      'notes', c.notes,
      'created_at', c.created_at
    )
    ORDER BY c.created_at DESC
  ) INTO v_contributions
  FROM contributions c
  WHERE c.room_id = v_room.id;
  
  RETURN json_build_object(
    'room', json_build_object(
      'id', v_room.id,
      'title', v_room.title,
      'description', v_room.description,
      'target_amount', v_room.target_amount,
      'currency', v_room.currency,
      'status', v_room.status,
      'total_collected', v_room.total_collected,
      'total_pledged', v_room.total_pledged,
      'contributor_count', v_room.contributor_count,
      'created_at', v_room.created_at,
      'expires_at', v_room.expires_at,
      'last_contribution_at', v_room.last_contribution_at,
      'settings', v_room.settings
    ),
    'contributions', COALESCE(v_contributions, '[]'::json),
    'role', v_role,
    'can_edit', (v_role = 'organizer' AND v_room.status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Add Contribution (Organizer Only)
-- =====================================================
CREATE OR REPLACE FUNCTION add_contribution(
  p_organizer_token UUID,
  p_name TEXT,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_transaction_ref TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'confirmed',
  p_notes TEXT DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT FALSE,
  p_phone_number TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
  v_contribution_id UUID;
  v_confirmed_at TIMESTAMPTZ;
BEGIN
  SELECT id INTO v_room_id
  FROM rooms
  WHERE organizer_token = p_organizer_token AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized or room not active';
  END IF;
  
  IF p_status = 'confirmed' THEN
    v_confirmed_at := NOW();
  END IF;
  
  INSERT INTO contributions (
    room_id,
    name,
    amount,
    payment_method,
    transaction_ref,
    status,
    notes,
    is_anonymous,
    phone_number,
    confirmed_at
  ) VALUES (
    v_room_id,
    p_name,
    p_amount,
    p_payment_method,
    p_transaction_ref,
    p_status,
    p_notes,
    p_is_anonymous,
    p_phone_number,
    v_confirmed_at
  )
  RETURNING id INTO v_contribution_id;
  
  INSERT INTO room_activity_log (room_id, action, actor_type, details)
  VALUES (v_room_id, 'contribution_added', 'organizer', json_build_object(
    'contribution_id', v_contribution_id,
    'name', p_name,
    'amount', p_amount
  )::jsonb);
  
  RETURN json_build_object(
    'success', true,
    'contribution_id', v_contribution_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Update Contribution (Organizer Only)
-- =====================================================
CREATE OR REPLACE FUNCTION update_contribution(
  p_organizer_token UUID,
  p_contribution_id UUID,
  p_name TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_transaction_ref TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT c.room_id INTO v_room_id
  FROM contributions c
  JOIN rooms r ON r.id = c.room_id
  WHERE c.id = p_contribution_id 
    AND r.organizer_token = p_organizer_token 
    AND r.status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized or contribution not found';
  END IF;
  
  UPDATE contributions
  SET
    name = COALESCE(p_name, name),
    amount = COALESCE(p_amount, amount),
    payment_method = COALESCE(p_payment_method, payment_method),
    transaction_ref = COALESCE(p_transaction_ref, transaction_ref),
    status = COALESCE(p_status, status),
    notes = COALESCE(p_notes, notes),
    confirmed_at = CASE 
      WHEN p_status = 'confirmed' AND status != 'confirmed' THEN NOW()
      ELSE confirmed_at
    END
  WHERE id = p_contribution_id;
  
  INSERT INTO room_activity_log (room_id, action, actor_type, details)
  VALUES (v_room_id, 'contribution_updated', 'organizer', json_build_object(
    'contribution_id', p_contribution_id
  )::jsonb);
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Delete Contribution (Organizer Only)
-- =====================================================
CREATE OR REPLACE FUNCTION delete_contribution(
  p_organizer_token UUID,
  p_contribution_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT c.room_id INTO v_room_id
  FROM contributions c
  JOIN rooms r ON r.id = c.room_id
  WHERE c.id = p_contribution_id 
    AND r.organizer_token = p_organizer_token 
    AND r.status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized or contribution not found';
  END IF;
  
  DELETE FROM contributions WHERE id = p_contribution_id;
  
  INSERT INTO room_activity_log (room_id, action, actor_type, details)
  VALUES (v_room_id, 'contribution_deleted', 'organizer', json_build_object(
    'contribution_id', p_contribution_id
  )::jsonb);
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Archive Room (Organizer Only)
-- =====================================================
CREATE OR REPLACE FUNCTION archive_room(
  p_organizer_token UUID
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
BEGIN
  UPDATE rooms
  SET status = 'archived'
  WHERE organizer_token = p_organizer_token AND status = 'active'
  RETURNING id INTO v_room_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized or room not found';
  END IF;
  
  INSERT INTO room_activity_log (room_id, action, actor_type)
  VALUES (v_room_id, 'room_archived', 'organizer');
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: Get Room Statistics (Enhanced)
-- =====================================================
CREATE OR REPLACE FUNCTION get_room_statistics(
  p_token UUID
)
RETURNS JSON AS $$
DECLARE
  v_room_id UUID;
  v_stats JSON;
BEGIN
  SELECT id INTO v_room_id
  FROM rooms
  WHERE organizer_token = p_token OR contributor_token = p_token;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;
  
  WITH daily_contributions AS (
    SELECT 
      DATE(confirmed_at) as date,
      COUNT(*) as count,
      SUM(amount) as total
    FROM contributions
    WHERE room_id = v_room_id 
      AND status = 'confirmed'
      AND confirmed_at IS NOT NULL
    GROUP BY DATE(confirmed_at)
    ORDER BY date DESC
    LIMIT 30
  ),
  payment_breakdown AS (
    SELECT 
      payment_method,
      COUNT(*) as count,
      SUM(amount) as total
    FROM contributions
    WHERE room_id = v_room_id AND status = 'confirmed'
    GROUP BY payment_method
  )
  SELECT json_build_object(
    'daily_trend', (SELECT json_agg(row_to_json(d)) FROM daily_contributions d),
    'payment_methods', (SELECT json_agg(row_to_json(p)) FROM payment_breakdown p),
    'average_contribution', (
      SELECT ROUND(AVG(amount), 2)
      FROM contributions
      WHERE room_id = v_room_id AND status = 'confirmed'
    ),
    'largest_contribution', (
      SELECT MAX(amount)
      FROM contributions
      WHERE room_id = v_room_id AND status = 'confirmed'
    ),
    'completion_percentage', (
      SELECT CASE 
        WHEN r.target_amount > 0 THEN ROUND((r.total_collected / r.target_amount * 100), 2)
        ELSE NULL
      END
      FROM rooms r
      WHERE r.id = v_room_id
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant execute permissions on RPC functions
-- =====================================================
GRANT EXECUTE ON FUNCTION create_room TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_organizer_access TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_room_details TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_contribution TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_contribution TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_contribution TO anon, authenticated;
GRANT EXECUTE ON FUNCTION archive_room TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_room_statistics TO anon, authenticated;
