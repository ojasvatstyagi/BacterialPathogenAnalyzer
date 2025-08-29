/*
  # Add colony_age column to analyses table

  1. Schema Changes
    - Add `colony_age` column to `analyses` table
      - `colony_age` (text, stores values like "24h", "48h", "72h", "96h")
      - Default value of empty string for existing records

  2. Notes
    - Uses safe column addition with IF NOT EXISTS check
    - Maintains backward compatibility with existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analyses' AND column_name = 'colony_age'
  ) THEN
    ALTER TABLE analyses ADD COLUMN colony_age text DEFAULT '';
  END IF;
END $$;