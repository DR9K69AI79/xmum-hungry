-- XMUM Hungry Database Schema

CREATE TABLE users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  email     TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  cuisines    TEXT,   -- CSV "Malay,Thai"
  avg_price   INTEGER, -- RM
  description TEXT,
  photo_url   TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dishes (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  rest_id  INTEGER NOT NULL,
  name     TEXT NOT NULL,
  price    INTEGER NOT NULL,
  photo_url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rest_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_id   INTEGER NOT NULL,
  user_id   INTEGER NOT NULL,
  stars     INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment   TEXT,
  photo_url TEXT,
  audio_url TEXT,
  ts        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, pass_hash) VALUES 
(1, 'admin@xmum.edu.my', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample restaurants around XMUM campus
INSERT INTO restaurants (name, lat, lng, cuisines, avg_price, description) VALUES
('Campus Cafeteria', 2.4448, 103.3890, 'Local,Chinese,Malay', 8, 'Main campus dining hall with variety of local dishes'),
('Mamak Corner', 2.4455, 103.3885, 'Indian,Mamak', 6, 'Traditional mamak stall with roti canai and teh tarik'),
('Noodle House', 2.4442, 103.3895, 'Chinese,Noodles', 10, 'Authentic Chinese noodle dishes and dim sum'),
('Malay Delights', 2.4450, 103.3880, 'Malay,Local', 7, 'Traditional Malay cuisine with nasi lemak and rendang'),
('Western Grill', 2.4460, 103.3900, 'Western,Grill', 15, 'Western-style grilled dishes and burgers'),
('Thai Express', 2.4445, 103.3875, 'Thai,Spicy', 12, 'Authentic Thai food with tom yum and pad thai'),
('Japanese Sushi', 2.4465, 103.3905, 'Japanese,Sushi', 20, 'Fresh sushi and Japanese cuisine'),
('Korean BBQ', 2.4440, 103.3870, 'Korean,BBQ', 18, 'Korean barbecue and kimchi dishes'),
('Pizza Corner', 2.4470, 103.3910, 'Italian,Pizza', 16, 'Wood-fired pizza and Italian pasta'),
('Vegetarian Delight', 2.4435, 103.3865, 'Vegetarian,Healthy', 9, 'Healthy vegetarian and vegan options'),
('Seafood Paradise', 2.4475, 103.3915, 'Seafood,Chinese', 25, 'Fresh seafood dishes and Chinese cuisine'),
('Coffee Bean Cafe', 2.4430, 103.3860, 'Cafe,Western', 11, 'Coffee, pastries, and light Western meals'),
('Bubble Tea Station', 2.4480, 103.3920, 'Drinks,Taiwanese', 5, 'Taiwanese bubble tea and snacks'),
('Indian Curry House', 2.4425, 103.3855, 'Indian,Curry', 13, 'Authentic Indian curry and tandoori dishes'),
('Local Delicacies', 2.4485, 103.3925, 'Local,Traditional', 8, 'Traditional Malaysian local delicacies');

-- Insert sample dishes for each restaurant
INSERT INTO dishes (rest_id, name, price, description) VALUES
-- Campus Cafeteria dishes
(1, 'Nasi Lemak', 5, 'Traditional Malaysian rice dish with coconut rice'),
(1, 'Chicken Rice', 6, 'Hainanese chicken rice with tender chicken'),
(1, 'Mee Goreng', 7, 'Stir-fried noodles with vegetables and egg'),
(1, 'Curry Chicken', 8, 'Malaysian curry chicken with rice'),

-- Mamak Corner dishes
(2, 'Roti Canai', 3, 'Flaky flatbread served with curry dhal'),
(2, 'Teh Tarik', 2, 'Traditional pulled milk tea'),
(2, 'Mee Mamak', 6, 'Mamak-style fried noodles'),
(2, 'Nasi Kandar', 8, 'Rice with various curry dishes'),

-- Noodle House dishes
(3, 'Wonton Noodles', 9, 'Egg noodles with pork wontons in clear broth'),
(3, 'Char Siu Bao', 4, 'Steamed buns with barbecued pork filling'),
(3, 'Dim Sum Platter', 12, 'Assorted dim sum selection'),
(3, 'Beef Noodle Soup', 11, 'Rich beef broth with hand-pulled noodles'),

-- Malay Delights dishes
(4, 'Nasi Lemak Special', 8, 'Premium nasi lemak with rendang and sambal'),
(4, 'Rendang Beef', 10, 'Slow-cooked beef in coconut curry'),
(4, 'Satay Skewers', 6, 'Grilled meat skewers with peanut sauce'),
(4, 'Laksa Johor', 9, 'Spicy noodle soup with coconut milk'),

-- Western Grill dishes
(5, 'Grilled Chicken Chop', 15, 'Grilled chicken breast with black pepper sauce'),
(5, 'Beef Burger', 12, 'Juicy beef patty with cheese and vegetables'),
(5, 'Fish & Chips', 14, 'Battered fish with crispy fries'),
(5, 'Lamb Chop', 18, 'Grilled lamb with herbs and garlic');

