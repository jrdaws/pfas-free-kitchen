-- ============================================
-- C2C Marketplace with Auction System Schema
-- Created: 2026-01-04
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE listing_type AS ENUM ('auction', 'fixed', 'both');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'ended', 'sold', 'cancelled');
CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'disputed');
CREATE TYPE shipping_status AS ENUM ('pending', 'shipped', 'in_transit', 'delivered', 'returned');

-- ============================================
-- SELLER PROFILES
-- ============================================

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  verified_seller BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE listing_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES listing_categories(id),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO listing_categories (name, slug, icon, sort_order) VALUES
  ('Electronics', 'electronics', '📱', 1),
  ('Fashion', 'fashion', '👕', 2),
  ('Home & Garden', 'home-garden', '🏠', 3),
  ('Sports', 'sports', '⚽', 4),
  ('Collectibles', 'collectibles', '🎨', 5),
  ('Motors', 'motors', '🚗', 6),
  ('Books & Media', 'books-media', '📚', 7),
  ('Toys & Games', 'toys-games', '🎮', 8),
  ('Health & Beauty', 'health-beauty', '💄', 9),
  ('Other', 'other', '📦', 99);

-- ============================================
-- LISTINGS
-- ============================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Categorization
  category_id UUID REFERENCES listing_categories(id),
  condition item_condition DEFAULT 'good',
  
  -- Pricing
  starting_price DECIMAL(12,2) NOT NULL DEFAULT 0.01,
  current_price DECIMAL(12,2),
  buy_it_now_price DECIMAL(12,2),
  reserve_price DECIMAL(12,2),
  reserve_met BOOLEAN DEFAULT false,
  
  -- Listing Type & Status
  listing_type listing_type NOT NULL DEFAULT 'auction',
  status listing_status DEFAULT 'draft',
  
  -- Auction Timing
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  duration_days INTEGER DEFAULT 7,
  auto_extend BOOLEAN DEFAULT true,
  extended_count INTEGER DEFAULT 0,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  watch_count INTEGER DEFAULT 0,
  bid_count INTEGER DEFAULT 0,
  
  -- Winner
  winning_bid_id UUID,
  winning_bidder_id UUID REFERENCES auth.users(id),
  
  -- Shipping
  shipping_cost DECIMAL(8,2) DEFAULT 0.00,
  ships_from TEXT,
  ships_to TEXT[] DEFAULT '{"US"}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (starting_price > 0),
  CHECK (buy_it_now_price IS NULL OR buy_it_now_price > starting_price),
  CHECK (reserve_price IS NULL OR reserve_price >= starting_price)
);

-- Index for searching
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_ends_at ON listings(ends_at) WHERE status = 'active';
CREATE INDEX idx_listings_search ON listings USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- BIDS
-- ============================================

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bid Amount
  amount DECIMAL(12,2) NOT NULL,
  max_bid DECIMAL(12,2), -- For proxy/auto bidding
  
  -- Status
  is_winning BOOLEAN DEFAULT false,
  is_auto_bid BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  
  -- Constraints
  CHECK (amount > 0),
  CHECK (max_bid IS NULL OR max_bid >= amount)
);

CREATE INDEX idx_bids_listing ON bids(listing_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_winning ON bids(listing_id) WHERE is_winning = true;

-- ============================================
-- SELLER RATINGS
-- ============================================

CREATE TABLE seller_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  transaction_id UUID,
  
  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Aspects
  item_as_described INTEGER CHECK (item_as_described >= 1 AND item_as_described <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  shipping_speed INTEGER CHECK (shipping_speed >= 1 AND shipping_speed <= 5),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One rating per transaction
  UNIQUE(buyer_id, listing_id)
);

CREATE INDEX idx_ratings_seller ON seller_ratings(seller_id);
CREATE INDEX idx_ratings_buyer ON seller_ratings(buyer_id);

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Pricing
  sale_price DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(8,2) DEFAULT 0.00,
  platform_fee DECIMAL(8,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,
  
  -- Payment
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
  payment_intent_id TEXT, -- Stripe
  paid_at TIMESTAMPTZ,
  
  -- Shipping
  shipping_status shipping_status DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Addresses (JSON for flexibility)
  shipping_address JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);

-- ============================================
-- WATCHLIST
-- ============================================

CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_listing ON watchlist(listing_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_categories ENABLE ROW LEVEL SECURITY;

-- Seller Profiles
CREATE POLICY "Seller profiles are viewable by everyone"
  ON seller_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own seller profile"
  ON seller_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller profile"
  ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON listing_categories FOR SELECT USING (true);

-- Listings
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status IN ('active', 'ended', 'sold') OR auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own draft listings"
  ON listings FOR DELETE USING (auth.uid() = seller_id AND status = 'draft');

-- Bids
CREATE POLICY "Bids are viewable by listing participants"
  ON bids FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = bids.listing_id
      AND (listings.seller_id = auth.uid() OR bids.bidder_id = auth.uid() OR listings.status = 'active')
    )
  );

CREATE POLICY "Authenticated users can place bids"
  ON bids FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = bidder_id
    AND EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_id 
      AND listings.status = 'active'
      AND listings.seller_id != auth.uid() -- Can't bid on own listing
    )
  );

-- Ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON seller_ratings FOR SELECT USING (true);

CREATE POLICY "Buyers can create ratings after purchase"
  ON seller_ratings FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.buyer_id = auth.uid() 
      AND transactions.listing_id = seller_ratings.listing_id
      AND transactions.payment_status = 'paid'
    )
  );

CREATE POLICY "Users can update own ratings"
  ON seller_ratings FOR UPDATE USING (auth.uid() = buyer_id);

-- Transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() IN (seller_id, buyer_id));

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() IN (seller_id, buyer_id));

CREATE POLICY "Participants can update transactions"
  ON transactions FOR UPDATE USING (auth.uid() IN (seller_id, buyer_id));

-- Watchlist
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update seller rating average when new rating is added
CREATE OR REPLACE FUNCTION update_seller_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_profiles
  SET 
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM seller_ratings
      WHERE seller_id = NEW.seller_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM seller_ratings
      WHERE seller_id = NEW.seller_id
    )
  WHERE user_id = NEW.seller_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_avg_on_insert
  AFTER INSERT ON seller_ratings
  FOR EACH ROW EXECUTE FUNCTION update_seller_rating_avg();

-- Update listing bid count and current price
CREATE OR REPLACE FUNCTION update_listing_on_bid()
RETURNS TRIGGER AS $$
BEGIN
  -- Update previous winning bid
  UPDATE bids SET is_winning = false
  WHERE listing_id = NEW.listing_id AND is_winning = true;
  
  -- Mark new bid as winning
  NEW.is_winning = true;
  
  -- Update listing
  UPDATE listings
  SET 
    current_price = NEW.amount,
    bid_count = bid_count + 1,
    winning_bid_id = NEW.id,
    winning_bidder_id = NEW.bidder_id,
    reserve_met = CASE 
      WHEN reserve_price IS NOT NULL AND NEW.amount >= reserve_price THEN true
      ELSE reserve_met
    END,
    -- Auto-extend if bid in last 2 minutes
    ends_at = CASE
      WHEN auto_extend = true 
        AND ends_at - NOW() < INTERVAL '2 minutes'
        AND extended_count < 10
      THEN ends_at + INTERVAL '2 minutes'
      ELSE ends_at
    END,
    extended_count = CASE
      WHEN auto_extend = true 
        AND ends_at - NOW() < INTERVAL '2 minutes'
        AND extended_count < 10
      THEN extended_count + 1
      ELSE extended_count
    END
  WHERE id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_on_new_bid
  BEFORE INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION update_listing_on_bid();

-- Auto-create seller profile on first listing
CREATE OR REPLACE FUNCTION auto_create_seller_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO seller_profiles (user_id, display_name)
  SELECT NEW.seller_id, COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.seller_id),
    'Seller'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_seller_profile_on_listing
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION auto_create_seller_profile();

-- Increment seller stats on completed sale
CREATE OR REPLACE FUNCTION update_seller_stats_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    UPDATE seller_profiles
    SET 
      total_sales = total_sales + 1,
      total_revenue = total_revenue + NEW.sale_price
    WHERE user_id = NEW.seller_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_on_sale
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_seller_stats_on_sale();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for bids (for live auction updates)
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE listings;

