-- Add Holo Variant Prices to Price History
-- Run this migration AFTER the initial price_history migration

-- =============================================
-- ADD HOLO PRICE COLUMNS
-- =============================================

-- CardMarket holo prices (EUR)
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_avg_holo DECIMAL(10,2);
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_low_holo DECIMAL(10,2);
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_trend_holo DECIMAL(10,2);
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_avg1_holo DECIMAL(10,2);
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_avg7_holo DECIMAL(10,2);
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_avg30_holo DECIMAL(10,2);

-- CardMarket additional field we were missing
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_avg DECIMAL(10,2);

-- Price update timestamps from the API
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS tcgplayer_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS cardmarket_updated_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON COLUMN price_history.cardmarket_avg IS 'CardMarket average price (EUR)';
COMMENT ON COLUMN price_history.cardmarket_avg_holo IS 'CardMarket holo variant average (EUR)';
COMMENT ON COLUMN price_history.cardmarket_low_holo IS 'CardMarket holo variant lowest price (EUR)';
COMMENT ON COLUMN price_history.cardmarket_trend_holo IS 'CardMarket holo variant trend price (EUR)';
COMMENT ON COLUMN price_history.cardmarket_avg1_holo IS 'CardMarket holo 1-day average (EUR)';
COMMENT ON COLUMN price_history.cardmarket_avg7_holo IS 'CardMarket holo 7-day average (EUR)';
COMMENT ON COLUMN price_history.cardmarket_avg30_holo IS 'CardMarket holo 30-day average (EUR)';
COMMENT ON COLUMN price_history.tcgplayer_updated_at IS 'When TCGPlayer price was last updated';
COMMENT ON COLUMN price_history.cardmarket_updated_at IS 'When CardMarket price was last updated';
