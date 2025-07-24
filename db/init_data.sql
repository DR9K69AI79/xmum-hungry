-- Insert demo user
INSERT OR IGNORE INTO users (id, email, pass_hash) VALUES 
(1, 'demo@xmum.edu.my', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample restaurants
INSERT OR IGNORE INTO restaurants (id, name, lat, lng, cuisines, avg_price, description, photo_url) VALUES
(1, '校园食堂', 2.4448, 103.3890, '中式,马来', 8, '提供各种本地美食，价格实惠，是学生们的首选。', 'canteen.jpg'),
(2, 'Pizza Corner', 2.4450, 103.3892, '西式,意式', 15, '正宗意式披萨，新鲜食材，口感丰富。', 'pizza.jpg'),
(3, '马来风味餐厅', 2.4446, 103.3888, '马来', 12, '地道马来菜，椰浆饭、咖喱鸡等经典菜品。', 'malay.jpg'),
(4, '中华面馆', 2.4449, 103.3891, '中式', 10, '手工拉面，汤头浓郁，配菜丰富。', 'noodles.jpg'),
(5, 'Indian Spice', 2.4447, 103.3889, '印度', 13, '香料丰富的印度菜，咖喱和烤饼是招牌。', 'indian.jpg'),
(6, 'Thai Garden', 2.4451, 103.3893, '泰式', 14, '正宗泰式料理，酸辣开胃，口味独特。', 'thai.jpg'),
(7, 'Japanese Sushi', 2.4445, 103.3887, '日式', 20, '新鲜寿司和刺身，日式料理的精髓。', 'sushi.jpg'),
(8, 'Korean BBQ', 2.4452, 103.3894, '韩式', 18, '韩式烧烤，泡菜配菜，正宗韩国风味。', 'korean.jpg');

-- Insert sample dishes
INSERT OR IGNORE INTO dishes (id, rest_id, name, price, description, photo_url) VALUES
-- 校园食堂
(1, 1, '椰浆饭', 6, '马来传统早餐，配咖喱鸡和参巴酱', 'nasi_lemak.jpg'),
(2, 1, '炒河粉', 7, '广式炒河粉，配豆芽菜和韭菜', 'char_kway_teow.jpg'),
(3, 1, '海南鸡饭', 8, '嫩滑鸡肉配香米饭和特制酱料', 'chicken_rice.jpg'),

-- Pizza Corner
(4, 2, '玛格丽特披萨', 12, '经典意式披萨，番茄酱、马苏里拉奶酪和罗勒', 'margherita.jpg'),
(5, 2, '意式肉酱面', 15, '传统博洛尼亚肉酱配意大利面', 'spaghetti.jpg'),
(6, 2, '凯撒沙拉', 10, '新鲜生菜配凯撒酱和帕尔马奶酪', 'caesar_salad.jpg'),

-- 马来风味餐厅
(7, 3, '咖喱鸡', 12, '香浓椰浆咖喱配嫩鸡肉', 'curry_chicken.jpg'),
(8, 3, '沙爹串', 10, '烤肉串配花生酱', 'satay.jpg'),
(9, 3, '叻沙', 11, '椰浆汤底配米粉和海鲜', 'laksa.jpg'),

-- 中华面馆
(10, 4, '兰州拉面', 9, '手工拉面配牛肉汤', 'lanzhou_noodles.jpg'),
(11, 4, '小笼包', 8, '上海小笼包，汤汁丰富', 'xiaolongbao.jpg'),
(12, 4, '宫保鸡丁', 12, '四川经典菜，花生配鸡丁', 'kungpao_chicken.jpg'),

-- Indian Spice
(13, 5, '印度咖喱', 13, '香料丰富的传统咖喱', 'indian_curry.jpg'),
(14, 5, '印度飞饼', 8, '现烤印度薄饼', 'naan.jpg'),
(15, 5, '坦督里鸡', 15, '烤箱烤制的香料鸡肉', 'tandoori_chicken.jpg'),

-- Thai Garden
(16, 6, '冬阴功汤', 12, '酸辣虾汤，泰式经典', 'tom_yum.jpg'),
(17, 6, '泰式炒河粉', 11, '甜酸口味的炒河粉', 'pad_thai.jpg'),
(18, 6, '芒果糯米饭', 8, '甜品，新鲜芒果配糯米', 'mango_sticky_rice.jpg'),

-- Japanese Sushi
(19, 7, '三文鱼寿司', 18, '新鲜三文鱼握寿司', 'salmon_sushi.jpg'),
(20, 7, '天妇罗', 16, '酥脆天妇罗配蘸料', 'tempura.jpg'),
(21, 7, '味噌汤', 6, '传统日式味噌汤', 'miso_soup.jpg'),

-- Korean BBQ
(22, 8, '韩式烤肉', 20, '腌制牛肉烤制', 'korean_bbq.jpg'),
(23, 8, '泡菜炒饭', 12, '韩式泡菜配炒饭', 'kimchi_fried_rice.jpg'),
(24, 8, '石锅拌饭', 14, '蔬菜配米饭在石锅中', 'bibimbap.jpg');

-- Insert sample reviews
INSERT OR IGNORE INTO reviews (id, dish_id, user_id, stars, comment, photo_url, audio_url, ts) VALUES
(1, 1, 1, 5, '椰浆饭很正宗，咖喱鸡很嫩，参巴酱也很香！', NULL, NULL, '2024-01-15 08:30:00'),
(2, 4, 1, 4, '披萨很好吃，芝士很足，就是稍微有点咸。', NULL, NULL, '2024-01-16 12:15:00'),
(3, 7, 1, 5, '咖喱鸡超级棒！椰浆味很浓，鸡肉很嫩。', NULL, NULL, '2024-01-17 18:45:00'),
(4, 10, 1, 4, '拉面汤头很浓郁，面条有嚼劲，牛肉也很香。', NULL, NULL, '2024-01-18 13:20:00'),
(5, 13, 1, 3, '咖喱味道不错，但是对我来说稍微有点辣。', NULL, NULL, '2024-01-19 19:10:00');

