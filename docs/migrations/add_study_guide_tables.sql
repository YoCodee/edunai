-- Migration: Add Study Guide (Learning Roadmap) Tables
-- Run this migration after the main schema

-- ==========================================
-- STUDY GUIDE / LEARNING ROADMAP FEATURE
-- ==========================================

-- Main roadmap table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_emoji TEXT DEFAULT '📚',
  subject_type TEXT DEFAULT 'topic', -- 'course' or 'topic'
  total_units INTEGER DEFAULT 0,
  completed_units INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own roadmaps" ON roadmaps FOR ALL USING (auth.uid() = user_id);

-- Roadmap units (nodes in the tree)
CREATE TABLE IF NOT EXISTS roadmap_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT, -- AI-generated or manual summary
  position_x INTEGER DEFAULT 0, -- X position for tree layout
  position_y INTEGER DEFAULT 0, -- Y position for tree layout (depth/level)
  status TEXT DEFAULT 'locked', -- 'locked', 'available', 'completed', 'mastered'
  order_index INTEGER DEFAULT 0, -- For ordering within same level
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE roadmap_units ENABLE ROW LEVEL SECURITY;
-- Access through roadmap ownership
CREATE POLICY "Users can manage units of their roadmaps" ON roadmap_units 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roadmaps 
      WHERE roadmaps.id = roadmap_units.roadmap_id 
      AND roadmaps.user_id = auth.uid()
    )
  );

-- Unit dependencies (edges in the tree)
CREATE TABLE IF NOT EXISTS unit_dependencies (
  unit_id UUID REFERENCES public.roadmap_units(id) ON DELETE CASCADE NOT NULL,
  required_unit_id UUID REFERENCES public.roadmap_units(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (unit_id, required_unit_id),
  -- Prevent self-reference
  CONSTRAINT no_self_dependency CHECK (unit_id != required_unit_id)
);

ALTER TABLE unit_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage dependencies of their roadmaps" ON unit_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roadmap_units ru
      JOIN roadmaps r ON r.id = ru.roadmap_id
      WHERE ru.id = unit_dependencies.unit_id
      AND r.user_id = auth.uid()
    )
  );

-- Resources attached to units
CREATE TABLE IF NOT EXISTS unit_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id UUID REFERENCES public.roadmap_units(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL, -- 'link', 'note', 'flashcard'
  title TEXT NOT NULL,
  url TEXT, -- For external links
  linked_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  linked_study_set_id UUID REFERENCES public.study_sets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE unit_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage resources of their roadmaps" ON unit_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM roadmap_units ru
      JOIN roadmaps r ON r.id = ru.roadmap_id
      WHERE ru.id = unit_resources.unit_id
      AND r.user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_units_roadmap_id ON roadmap_units(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_unit_resources_unit_id ON unit_resources(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_dependencies_unit_id ON unit_dependencies(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_dependencies_required_unit_id ON unit_dependencies(required_unit_id);

-- Function to update roadmap progress when unit status changes
CREATE OR REPLACE FUNCTION update_roadmap_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE roadmaps
  SET 
    total_units = (SELECT COUNT(*) FROM roadmap_units WHERE roadmap_id = NEW.roadmap_id),
    completed_units = (SELECT COUNT(*) FROM roadmap_units WHERE roadmap_id = NEW.roadmap_id AND status IN ('completed', 'mastered')),
    updated_at = NOW()
  WHERE id = NEW.roadmap_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update progress
DROP TRIGGER IF EXISTS on_unit_status_change ON roadmap_units;
CREATE TRIGGER on_unit_status_change
  AFTER INSERT OR UPDATE OF status OR DELETE ON roadmap_units
  FOR EACH ROW EXECUTE PROCEDURE update_roadmap_progress();

-- Function to check and unlock available units after completion
CREATE OR REPLACE FUNCTION check_unit_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- When a unit is completed/mastered, check if any dependent units can be unlocked
  IF NEW.status IN ('completed', 'mastered') AND OLD.status NOT IN ('completed', 'mastered') THEN
    UPDATE roadmap_units
    SET status = 'available', updated_at = NOW()
    WHERE id IN (
      -- Find units that depend on the completed unit
      SELECT ud.unit_id
      FROM unit_dependencies ud
      WHERE ud.required_unit_id = NEW.id
      -- And all their dependencies are now completed
      AND NOT EXISTS (
        SELECT 1
        FROM unit_dependencies ud2
        JOIN roadmap_units ru ON ru.id = ud2.required_unit_id
        WHERE ud2.unit_id = ud.unit_id
        AND ru.status NOT IN ('completed', 'mastered')
      )
    )
    AND status = 'locked';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_unit_completed ON roadmap_units;
CREATE TRIGGER on_unit_completed
  AFTER UPDATE OF status ON roadmap_units
  FOR EACH ROW EXECUTE PROCEDURE check_unit_availability();
