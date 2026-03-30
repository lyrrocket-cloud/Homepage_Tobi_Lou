-- 初始化中国省市区数据
-- 注意：这个脚本需要在 Supabase 中手动执行一次

-- 创建 regions 表（如果不存在）
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('china', 'world')),
  parent_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(type);
CREATE INDEX IF NOT EXISTS idx_regions_parent_id ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_order_num ON regions(order_num);

-- 清空现有数据（可选，谨慎使用）
-- TRUNCATE TABLE regions CASCADE;

-- 插入中国省份数据
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('北京', 'china', NULL, 1),
  ('天津', 'china', NULL, 2),
  ('河北', 'china', NULL, 3),
  ('山西', 'china', NULL, 4),
  ('内蒙古', 'china', NULL, 5),
  ('辽宁', 'china', NULL, 6),
  ('吉林', 'china', NULL, 7),
  ('黑龙江', 'china', NULL, 8),
  ('上海', 'china', NULL, 9),
  ('江苏', 'china', NULL, 10),
  ('浙江', 'china', NULL, 11),
  ('安徽', 'china', NULL, 12),
  ('福建', 'china', NULL, 13),
  ('江西', 'china', NULL, 14),
  ('山东', 'china', NULL, 15),
  ('河南', 'china', NULL, 16),
  ('湖北', 'china', NULL, 17),
  ('湖南', 'china', NULL, 18),
  ('广东', 'china', NULL, 19),
  ('广西', 'china', NULL, 20),
  ('海南', 'china', NULL, 21),
  ('重庆', 'china', NULL, 22),
  ('四川', 'china', NULL, 23),
  ('贵州', 'china', NULL, 24),
  ('云南', 'china', NULL, 25),
  ('西藏', 'china', NULL, 26),
  ('陕西', 'china', NULL, 27),
  ('甘肃', 'china', NULL, 28),
  ('青海', 'china', NULL, 29),
  ('宁夏', 'china', NULL, 30),
  ('新疆', 'china', NULL, 31),
  ('台湾', 'china', NULL, 32),
  ('香港', 'china', NULL, 33),
  ('澳门', 'china', NULL, 34)
ON CONFLICT DO NOTHING;

-- 获取省份 ID 并插入对应的市/区数据
-- 北京
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('朝阳区', 'china', (SELECT id FROM regions WHERE name = '北京'), 1),
  ('海淀区', 'china', (SELECT id FROM regions WHERE name = '北京'), 2),
  ('东城区', 'china', (SELECT id FROM regions WHERE name = '北京'), 3),
  ('西城区', 'china', (SELECT id FROM regions WHERE name = '北京'), 4),
  ('丰台区', 'china', (SELECT id FROM regions WHERE name = '北京'), 5),
  ('石景山区', 'china', (SELECT id FROM regions WHERE name = '北京'), 6),
  ('通州区', 'china', (SELECT id FROM regions WHERE name = '北京'), 7),
  ('顺义区', 'china', (SELECT id FROM regions WHERE name = '北京'), 8),
  ('昌平区', 'china', (SELECT id FROM regions WHERE name = '北京'), 9),
  ('大兴区', 'china', (SELECT id FROM regions WHERE name = '北京'), 10)
ON CONFLICT DO NOTHING;

-- 上海
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('黄浦区', 'china', (SELECT id FROM regions WHERE name = '上海'), 1),
  ('徐汇区', 'china', (SELECT id FROM regions WHERE name = '上海'), 2),
  ('长宁区', 'china', (SELECT id FROM regions WHERE name = '上海'), 3),
  ('静安区', 'china', (SELECT id FROM regions WHERE name = '上海'), 4),
  ('普陀区', 'china', (SELECT id FROM regions WHERE name = '上海'), 5),
  ('虹口区', 'china', (SELECT id FROM regions WHERE name = '上海'), 6),
  ('杨浦区', 'china', (SELECT id FROM regions WHERE name = '上海'), 7),
  ('浦东新区', 'china', (SELECT id FROM regions WHERE name = '上海'), 8),
  ('闵行区', 'china', (SELECT id FROM regions WHERE name = '上海'), 9),
  ('宝山区', 'china', (SELECT id FROM regions WHERE name = '上海'), 10),
  ('嘉定区', 'china', (SELECT id FROM regions WHERE name = '上海'), 11),
  ('金山区', 'china', (SELECT id FROM regions WHERE name = '上海'), 12),
  ('松江区', 'china', (SELECT id FROM regions WHERE name = '上海'), 13),
  ('青浦区', 'china', (SELECT id FROM regions WHERE name = '上海'), 14),
  ('奉贤区', 'china', (SELECT id FROM regions WHERE name = '上海'), 15),
  ('崇明区', 'china', (SELECT id FROM regions WHERE name = '上海'), 16)
ON CONFLICT DO NOTHING;

-- 天津
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('和平区', 'china', (SELECT id FROM regions WHERE name = '天津'), 1),
  ('河西区', 'china', (SELECT id FROM regions WHERE name = '天津'), 2),
  ('南开区', 'china', (SELECT id FROM regions WHERE name = '天津'), 3),
  ('河东区', 'china', (SELECT id FROM regions WHERE name = '天津'), 4),
  ('河北区', 'china', (SELECT id FROM regions WHERE name = '天津'), 5),
  ('红桥区', 'china', (SELECT id FROM regions WHERE name = '天津'), 6),
  ('东丽区', 'china', (SELECT id FROM regions WHERE name = '天津'), 7),
  ('西青区', 'china', (SELECT id FROM regions WHERE name = '天津'), 8),
  ('津南区', 'china', (SELECT id FROM regions WHERE name = '天津'), 9),
  ('北辰区', 'china', (SELECT id FROM regions WHERE name = '天津'), 10),
  ('武清区', 'china', (SELECT id FROM regions WHERE name = '天津'), 11),
  ('宝坻区', 'china', (SELECT id FROM regions WHERE name = '天津'), 12),
  ('滨海新区', 'china', (SELECT id FROM regions WHERE name = '天津'), 13),
  ('宁河区', 'china', (SELECT id FROM regions WHERE name = '天津'), 14),
  ('静海区', 'china', (SELECT id FROM regions WHERE name = '天津'), 15),
  ('蓟州区', 'china', (SELECT id FROM regions WHERE name = '天津'), 16)
ON CONFLICT DO NOTHING;

-- 重庆
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('万州区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 1),
  ('涪陵区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 2),
  ('渝中区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 3),
  ('大渡口区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 4),
  ('江北区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 5),
  ('沙坪坝区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 6),
  ('九龙坡区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 7),
  ('南岸区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 8),
  ('北碚区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 9),
  ('綦江区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 10),
  ('大足区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 11),
  ('渝北区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 12),
  ('巴南区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 13),
  ('黔江区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 14),
  ('长寿区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 15),
  ('江津区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 16),
  ('合川区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 17),
  ('永川区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 18),
  ('南川区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 19),
  ('璧山区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 20),
  ('铜梁区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 21),
  ('潼南区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 22),
  ('荣昌区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 23),
  ('开州区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 24),
  ('梁平区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 25),
  ('武隆区', 'china', (SELECT id FROM regions WHERE name = '重庆'), 26)
ON CONFLICT DO NOTHING;

-- 浙江
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('杭州市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 1),
  ('宁波市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 2),
  ('温州市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 3),
  ('嘉兴市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 4),
  ('湖州市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 5),
  ('绍兴市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 6),
  ('金华市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 7),
  ('衢州市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 8),
  ('舟山市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 9),
  ('台州市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 10),
  ('丽水市', 'china', (SELECT id FROM regions WHERE name = '浙江'), 11)
ON CONFLICT DO NOTHING;

-- 江苏
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('南京市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 1),
  ('无锡市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 2),
  ('徐州市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 3),
  ('常州市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 4),
  ('苏州市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 5),
  ('南通市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 6),
  ('连云港市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 7),
  ('淮安市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 8),
  ('盐城市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 9),
  ('扬州市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 10),
  ('镇江市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 11),
  ('泰州市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 12),
  ('宿迁市', 'china', (SELECT id FROM regions WHERE name = '江苏'), 13)
ON CONFLICT DO NOTHING;

-- 广东
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('广州市', 'china', (SELECT id FROM regions WHERE name = '广东'), 1),
  ('韶关市', 'china', (SELECT id FROM regions WHERE name = '广东'), 2),
  ('深圳市', 'china', (SELECT id FROM regions WHERE name = '广东'), 3),
  ('珠海市', 'china', (SELECT id FROM regions WHERE name = '广东'), 4),
  ('汕头市', 'china', (SELECT id FROM regions WHERE name = '广东'), 5),
  ('佛山市', 'china', (SELECT id FROM regions WHERE name = '广东'), 6),
  ('江门市', 'china', (SELECT id FROM regions WHERE name = '广东'), 7),
  ('湛江市', 'china', (SELECT id FROM regions WHERE name = '广东'), 8),
  ('茂名市', 'china', (SELECT id FROM regions WHERE name = '广东'), 9),
  ('肇庆市', 'china', (SELECT id FROM regions WHERE name = '广东'), 10),
  ('惠州市', 'china', (SELECT id FROM regions WHERE name = '广东'), 11),
  ('梅州市', 'china', (SELECT id FROM regions WHERE name = '广东'), 12),
  ('汕尾市', 'china', (SELECT id FROM regions WHERE name = '广东'), 13),
  ('河源市', 'china', (SELECT id FROM regions WHERE name = '广东'), 14),
  ('阳江市', 'china', (SELECT id FROM regions WHERE name = '广东'), 15),
  ('清远市', 'china', (SELECT id FROM regions WHERE name = '广东'), 16),
  ('东莞市', 'china', (SELECT id FROM regions WHERE name = '广东'), 17),
  ('中山市', 'china', (SELECT id FROM regions WHERE name = '广东'), 18),
  ('潮州市', 'china', (SELECT id FROM regions WHERE name = '广东'), 19),
  ('揭阳市', 'china', (SELECT id FROM regions WHERE name = '广东'), 20),
  ('云浮市', 'china', (SELECT id FROM regions WHERE name = '广东'), 21)
ON CONFLICT DO NOTHING;

-- 山东
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('济南市', 'china', (SELECT id FROM regions WHERE name = '山东'), 1),
  ('青岛市', 'china', (SELECT id FROM regions WHERE name = '山东'), 2),
  ('淄博市', 'china', (SELECT id FROM regions WHERE name = '山东'), 3),
  ('枣庄市', 'china', (SELECT id FROM regions WHERE name = '山东'), 4),
  ('东营市', 'china', (SELECT id FROM regions WHERE name = '山东'), 5),
  ('烟台市', 'china', (SELECT id FROM regions WHERE name = '山东'), 6),
  ('潍坊市', 'china', (SELECT id FROM regions WHERE name = '山东'), 7),
  ('济宁市', 'china', (SELECT id FROM regions WHERE name = '山东'), 8),
  ('泰安市', 'china', (SELECT id FROM regions WHERE name = '山东'), 9),
  ('威海市', 'china', (SELECT id FROM regions WHERE name = '山东'), 10),
  ('日照市', 'china', (SELECT id FROM regions WHERE name = '山东'), 11),
  ('临沂市', 'china', (SELECT id FROM regions WHERE name = '山东'), 12),
  ('德州市', 'china', (SELECT id FROM regions WHERE name = '山东'), 13),
  ('聊城市', 'china', (SELECT id FROM regions WHERE name = '山东'), 14),
  ('滨州市', 'china', (SELECT id FROM regions WHERE name = '山东'), 15),
  ('菏泽市', 'china', (SELECT id FROM regions WHERE name = '山东'), 16)
ON CONFLICT DO NOTHING;

-- 四川
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('成都市', 'china', (SELECT id FROM regions WHERE name = '四川'), 1),
  ('自贡市', 'china', (SELECT id FROM regions WHERE name = '四川'), 2),
  ('攀枝花市', 'china', (SELECT id FROM regions WHERE name = '四川'), 3),
  ('泸州市', 'china', (SELECT id FROM regions WHERE name = '四川'), 4),
  ('德阳市', 'china', (SELECT id FROM regions WHERE name = '四川'), 5),
  ('绵阳市', 'china', (SELECT id FROM regions WHERE name = '四川'), 6),
  ('广元市', 'china', (SELECT id FROM regions WHERE name = '四川'), 7),
  ('遂宁市', 'china', (SELECT id FROM regions WHERE name = '四川'), 8),
  ('内江市', 'china', (SELECT id FROM regions WHERE name = '四川'), 9),
  ('乐山市', 'china', (SELECT id FROM regions WHERE name = '四川'), 10),
  ('南充市', 'china', (SELECT id FROM regions WHERE name = '四川'), 11),
  ('眉山市', 'china', (SELECT id FROM regions WHERE name = '四川'), 12),
  ('宜宾市', 'china', (SELECT id FROM regions WHERE name = '四川'), 13),
  ('广安市', 'china', (SELECT id FROM regions WHERE name = '四川'), 14),
  ('达州市', 'china', (SELECT id FROM regions WHERE name = '四川'), 15),
  ('雅安市', 'china', (SELECT id FROM regions WHERE name = '四川'), 16),
  ('巴中市', 'china', (SELECT id FROM regions WHERE name = '四川'), 17),
  ('资阳市', 'china', (SELECT id FROM regions WHERE name = '四川'), 18),
  ('阿坝藏族羌族自治州', 'china', (SELECT id FROM regions WHERE name = '四川'), 19),
  ('甘孜藏族自治州', 'china', (SELECT id FROM regions WHERE name = '四川'), 20),
  ('凉山彝族自治州', 'china', (SELECT id FROM regions WHERE name = '四川'), 21)
ON CONFLICT DO NOTHING;

-- 湖北
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('武汉市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 1),
  ('黄石市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 2),
  ('十堰市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 3),
  ('宜昌市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 4),
  ('襄阳市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 5),
  ('鄂州市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 6),
  ('荆门市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 7),
  ('孝感市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 8),
  ('荆州市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 9),
  ('黄冈市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 10),
  ('咸宁市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 11),
  ('随州市', 'china', (SELECT id FROM regions WHERE name = '湖北'), 12),
  ('恩施土家族苗族自治州', 'china', (SELECT id FROM regions WHERE name = '湖北'), 13)
ON CONFLICT DO NOTHING;

-- 湖南
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('长沙市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 1),
  ('株洲市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 2),
  ('湘潭市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 3),
  ('衡阳市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 4),
  ('邵阳市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 5),
  ('岳阳市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 6),
  ('常德市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 7),
  ('张家界市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 8),
  ('益阳市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 9),
  ('郴州市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 10),
  ('永州市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 11),
  ('怀化市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 12),
  ('娄底市', 'china', (SELECT id FROM regions WHERE name = '湖南'), 13),
  ('湘西土家族苗族自治州', 'china', (SELECT id FROM regions WHERE name = '湖南'), 14)
ON CONFLICT DO NOTHING;

-- 河南
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('郑州市', 'china', (SELECT id FROM regions WHERE name = '河南'), 1),
  ('开封市', 'china', (SELECT id FROM regions WHERE name = '河南'), 2),
  ('洛阳市', 'china', (SELECT id FROM regions WHERE name = '河南'), 3),
  ('平顶山市', 'china', (SELECT id FROM regions WHERE name = '河南'), 4),
  ('安阳市', 'china', (SELECT id FROM regions WHERE name = '河南'), 5),
  ('鹤壁市', 'china', (SELECT id FROM regions WHERE name = '河南'), 6),
  ('新乡市', 'china', (SELECT id FROM regions WHERE name = '河南'), 7),
  ('焦作市', 'china', (SELECT id FROM regions WHERE name = '河南'), 8),
  ('濮阳市', 'china', (SELECT id FROM regions WHERE name = '河南'), 9),
  ('许昌市', 'china', (SELECT id FROM regions WHERE name = '河南'), 10),
  ('漯河市', 'china', (SELECT id FROM regions WHERE name = '河南'), 11),
  ('三门峡市', 'china', (SELECT id FROM regions WHERE name = '河南'), 12),
  ('南阳市', 'china', (SELECT id FROM regions WHERE name = '河南'), 13),
  ('商丘市', 'china', (SELECT id FROM regions WHERE name = '河南'), 14),
  ('信阳市', 'china', (SELECT id FROM regions WHERE name = '河南'), 15),
  ('周口市', 'china', (SELECT id FROM regions WHERE name = '河南'), 16),
  ('驻马店市', 'china', (SELECT id FROM regions WHERE name = '河南'), 17),
  ('济源市', 'china', (SELECT id FROM regions WHERE name = '河南'), 18)
ON CONFLICT DO NOTHING;

-- 福建
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('福州市', 'china', (SELECT id FROM regions WHERE name = '福建'), 1),
  ('厦门市', 'china', (SELECT id FROM regions WHERE name = '福建'), 2),
  ('莆田市', 'china', (SELECT id FROM regions WHERE name = '福建'), 3),
  ('三明市', 'china', (SELECT id FROM regions WHERE name = '福建'), 4),
  ('泉州市', 'china', (SELECT id FROM regions WHERE name = '福建'), 5),
  ('漳州市', 'china', (SELECT id FROM regions WHERE name = '福建'), 6),
  ('南平市', 'china', (SELECT id FROM regions WHERE name = '福建'), 7),
  ('龙岩市', 'china', (SELECT id FROM regions WHERE name = '福建'), 8),
  ('宁德市', 'china', (SELECT id FROM regions WHERE name = '福建'), 9)
ON CONFLICT DO NOTHING;

-- 云南
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('昆明市', 'china', (SELECT id FROM regions WHERE name = '云南'), 1),
  ('曲靖市', 'china', (SELECT id FROM regions WHERE name = '云南'), 2),
  ('玉溪市', 'china', (SELECT id FROM regions WHERE name = '云南'), 3),
  ('保山市', 'china', (SELECT id FROM regions WHERE name = '云南'), 4),
  ('昭通市', 'china', (SELECT id FROM regions WHERE name = '云南'), 5),
  ('丽江市', 'china', (SELECT id FROM regions WHERE name = '云南'), 6),
  ('普洱市', 'china', (SELECT id FROM regions WHERE name = '云南'), 7),
  ('临沧市', 'china', (SELECT id FROM regions WHERE name = '云南'), 8),
  ('楚雄彝族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 9),
  ('红河哈尼族彝族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 10),
  ('文山壮族苗族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 11),
  ('西双版纳傣族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 12),
  ('大理白族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 13),
  ('德宏傣族景颇族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 14),
  ('怒江傈僳族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 15),
  ('迪庆藏族自治州', 'china', (SELECT id FROM regions WHERE name = '云南'), 16)
ON CONFLICT DO NOTHING;

-- 广西
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('南宁市', 'china', (SELECT id FROM regions WHERE name = '广西'), 1),
  ('柳州市', 'china', (SELECT id FROM regions WHERE name = '广西'), 2),
  ('桂林市', 'china', (SELECT id FROM regions WHERE name = '广西'), 3),
  ('梧州市', 'china', (SELECT id FROM regions WHERE name = '广西'), 4),
  ('北海市', 'china', (SELECT id FROM regions WHERE name = '广西'), 5),
  ('防城港市', 'china', (SELECT id FROM regions WHERE name = '广西'), 6),
  ('钦州市', 'china', (SELECT id FROM regions WHERE name = '广西'), 7),
  ('贵港市', 'china', (SELECT id FROM regions WHERE name = '广西'), 8),
  ('玉林市', 'china', (SELECT id FROM regions WHERE name = '广西'), 9),
  ('百色市', 'china', (SELECT id FROM regions WHERE name = '广西'), 10),
  ('贺州市', 'china', (SELECT id FROM regions WHERE name = '广西'), 11),
  ('河池市', 'china', (SELECT id FROM regions WHERE name = '广西'), 12),
  ('来宾市', 'china', (SELECT id FROM regions WHERE name = '广西'), 13),
  ('崇左市', 'china', (SELECT id FROM regions WHERE name = '广西'), 14)
ON CONFLICT DO NOTHING;

-- 安徽
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('合肥市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 1),
  ('芜湖市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 2),
  ('蚌埠市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 3),
  ('淮南市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 4),
  ('马鞍山市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 5),
  ('淮北市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 6),
  ('铜陵市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 7),
  ('安庆市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 8),
  ('黄山市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 9),
  ('滁州市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 10),
  ('阜阳市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 11),
  ('宿州市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 12),
  ('六安市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 13),
  ('亳州市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 14),
  ('池州市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 15),
  ('宣城市', 'china', (SELECT id FROM regions WHERE name = '安徽'), 16)
ON CONFLICT DO NOTHING;

-- 江西
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('南昌市', 'china', (SELECT id FROM regions WHERE name = '江西'), 1),
  ('景德镇市', 'china', (SELECT id FROM regions WHERE name = '江西'), 2),
  ('萍乡市', 'china', (SELECT id FROM regions WHERE name = '江西'), 3),
  ('九江市', 'china', (SELECT id FROM regions WHERE name = '江西'), 4),
  ('新余市', 'china', (SELECT id FROM regions WHERE name = '江西'), 5),
  ('鹰潭市', 'china', (SELECT id FROM regions WHERE name = '江西'), 6),
  ('赣州市', 'china', (SELECT id FROM regions WHERE name = '江西'), 7),
  ('吉安市', 'china', (SELECT id FROM regions WHERE name = '江西'), 8),
  ('宜春市', 'china', (SELECT id FROM regions WHERE name = '江西'), 9),
  ('抚州市', 'china', (SELECT id FROM regions WHERE name = '江西'), 10),
  ('上饶市', 'china', (SELECT id FROM regions WHERE name = '江西'), 11)
ON CONFLICT DO NOTHING;

-- 陕西
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('西安市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 1),
  ('铜川市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 2),
  ('宝鸡市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 3),
  ('咸阳市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 4),
  ('渭南市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 5),
  ('延安市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 6),
  ('汉中市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 7),
  ('榆林市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 8),
  ('安康市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 9),
  ('商洛市', 'china', (SELECT id FROM regions WHERE name = '陕西'), 10)
ON CONFLICT DO NOTHING;

-- 贵州
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('贵阳市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 1),
  ('六盘水市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 2),
  ('遵义市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 3),
  ('安顺市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 4),
  ('毕节市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 5),
  ('铜仁市', 'china', (SELECT id FROM regions WHERE name = '贵州'), 6),
  ('黔西南布依族苗族自治州', 'china', (SELECT id FROM regions WHERE name = '贵州'), 7),
  ('黔东南苗族侗族自治州', 'china', (SELECT id FROM regions WHERE name = '贵州'), 8),
  ('黔南布依族苗族自治州', 'china', (SELECT id FROM regions WHERE name = '贵州'), 9)
ON CONFLICT DO NOTHING;

-- 辽宁
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('沈阳市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 1),
  ('大连市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 2),
  ('鞍山市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 3),
  ('抚顺市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 4),
  ('本溪市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 5),
  ('丹东市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 6),
  ('锦州市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 7),
  ('营口市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 8),
  ('阜新市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 9),
  ('辽阳市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 10),
  ('盘锦市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 11),
  ('铁岭市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 12),
  ('朝阳市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 13),
  ('葫芦岛市', 'china', (SELECT id FROM regions WHERE name = '辽宁'), 14)
ON CONFLICT DO NOTHING;

-- 河北
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('石家庄市', 'china', (SELECT id FROM regions WHERE name = '河北'), 1),
  ('唐山市', 'china', (SELECT id FROM regions WHERE name = '河北'), 2),
  ('秦皇岛市', 'china', (SELECT id FROM regions WHERE name = '河北'), 3),
  ('邯郸市', 'china', (SELECT id FROM regions WHERE name = '河北'), 4),
  ('邢台市', 'china', (SELECT id FROM regions WHERE name = '河北'), 5),
  ('保定市', 'china', (SELECT id FROM regions WHERE name = '河北'), 6),
  ('张家口市', 'china', (SELECT id FROM regions WHERE name = '河北'), 7),
  ('承德市', 'china', (SELECT id FROM regions WHERE name = '河北'), 8),
  ('沧州市', 'china', (SELECT id FROM regions WHERE name = '河北'), 9),
  ('廊坊市', 'china', (SELECT id FROM regions WHERE name = '河北'), 10),
  ('衡水市', 'china', (SELECT id FROM regions WHERE name = '河北'), 11)
ON CONFLICT DO NOTHING;

-- 吉林
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('长春市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 1),
  ('吉林市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 2),
  ('四平市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 3),
  ('辽源市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 4),
  ('通化市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 5),
  ('白山市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 6),
  ('松原市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 7),
  ('白城市', 'china', (SELECT id FROM regions WHERE name = '吉林'), 8),
  ('延边朝鲜族自治州', 'china', (SELECT id FROM regions WHERE name = '吉林'), 9)
ON CONFLICT DO NOTHING;

-- 黑龙江
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('哈尔滨市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 1),
  ('齐齐哈尔市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 2),
  ('鸡西市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 3),
  ('鹤岗市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 4),
  ('双鸭山市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 5),
  ('大庆市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 6),
  ('伊春市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 7),
  ('佳木斯市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 8),
  ('七台河市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 9),
  ('牡丹江市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 10),
  ('黑河市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 11),
  ('绥化市', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 12),
  ('大兴安岭地区', 'china', (SELECT id FROM regions WHERE name = '黑龙江'), 13)
ON CONFLICT DO NOTHING;

-- 山西
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('太原市', 'china', (SELECT id FROM regions WHERE name = '山西'), 1),
  ('大同市', 'china', (SELECT id FROM regions WHERE name = '山西'), 2),
  ('阳泉市', 'china', (SELECT id FROM regions WHERE name = '山西'), 3),
  ('长治市', 'china', (SELECT id FROM regions WHERE name = '山西'), 4),
  ('晋城市', 'china', (SELECT id FROM regions WHERE name = '山西'), 5),
  ('朔州市', 'china', (SELECT id FROM regions WHERE name = '山西'), 6),
  ('晋中市', 'china', (SELECT id FROM regions WHERE name = '山西'), 7),
  ('运城市', 'china', (SELECT id FROM regions WHERE name = '山西'), 8),
  ('忻州市', 'china', (SELECT id FROM regions WHERE name = '山西'), 9),
  ('临汾市', 'china', (SELECT id FROM regions WHERE name = '山西'), 10),
  ('吕梁市', 'china', (SELECT id FROM regions WHERE name = '山西'), 11)
ON CONFLICT DO NOTHING;

-- 内蒙古
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('呼和浩特市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 1),
  ('包头市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 2),
  ('乌海市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 3),
  ('赤峰市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 4),
  ('通辽市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 5),
  ('鄂尔多斯市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 6),
  ('呼伦贝尔市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 7),
  ('巴彦淖尔市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 8),
  ('乌兰察布市', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 9),
  ('兴安盟', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 10),
  ('锡林郭勒盟', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 11),
  ('阿拉善盟', 'china', (SELECT id FROM regions WHERE name = '内蒙古'), 12)
ON CONFLICT DO NOTHING;

-- 海南
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('海口市', 'china', (SELECT id FROM regions WHERE name = '海南'), 1),
  ('三亚市', 'china', (SELECT id FROM regions WHERE name = '海南'), 2),
  ('三沙市', 'china', (SELECT id FROM regions WHERE name = '海南'), 3),
  ('儋州市', 'china', (SELECT id FROM regions WHERE name = '海南'), 4),
  ('五指山市', 'china', (SELECT id FROM regions WHERE name = '海南'), 5),
  ('琼海市', 'china', (SELECT id FROM regions WHERE name = '海南'), 6),
  ('文昌市', 'china', (SELECT id FROM regions WHERE name = '海南'), 7),
  ('万宁市', 'china', (SELECT id FROM regions WHERE name = '海南'), 8),
  ('东方市', 'china', (SELECT id FROM regions WHERE name = '海南'), 9)
ON CONFLICT DO NOTHING;

-- 甘肃
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('兰州市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 1),
  ('嘉峪关市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 2),
  ('金昌市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 3),
  ('白银市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 4),
  ('天水市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 5),
  ('武威市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 6),
  ('张掖市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 7),
  ('平凉市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 8),
  ('酒泉市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 9),
  ('庆阳市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 10),
  ('定西市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 11),
  ('陇南市', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 12),
  ('临夏回族自治州', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 13),
  ('甘南藏族自治州', 'china', (SELECT id FROM regions WHERE name = '甘肃'), 14)
ON CONFLICT DO NOTHING;

-- 新疆
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('乌鲁木齐市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 1),
  ('克拉玛依市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 2),
  ('吐鲁番市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 3),
  ('哈密市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 4),
  ('昌吉回族自治州', 'china', (SELECT id FROM regions WHERE name = '新疆'), 5),
  ('博尔塔拉蒙古自治州', 'china', (SELECT id FROM regions WHERE name = '新疆'), 6),
  ('巴音郭楞蒙古自治州', 'china', (SELECT id FROM regions WHERE name = '新疆'), 7),
  ('阿克苏地区', 'china', (SELECT id FROM regions WHERE name = '新疆'), 8),
  ('克孜勒苏柯尔克孜自治州', 'china', (SELECT id FROM regions WHERE name = '新疆'), 9),
  ('喀什地区', 'china', (SELECT id FROM regions WHERE name = '新疆'), 10),
  ('和田地区', 'china', (SELECT id FROM regions WHERE name = '新疆'), 11),
  ('伊犁哈萨克自治州', 'china', (SELECT id FROM regions WHERE name = '新疆'), 12),
  ('塔城地区', 'china', (SELECT id FROM regions WHERE name = '新疆'), 13),
  ('阿勒泰地区', 'china', (SELECT id FROM regions WHERE name = '新疆'), 14),
  ('石河子市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 15),
  ('阿拉尔市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 16),
  ('图木舒克市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 17),
  ('五家渠市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 18),
  ('北屯市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 19),
  ('铁门关市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 20),
  ('双河市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 21),
  ('可克达拉市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 22),
  ('昆玉市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 23),
  ('胡杨河市', 'china', (SELECT id FROM regions WHERE name = '新疆'), 24)
ON CONFLICT DO NOTHING;

-- 西藏
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('拉萨市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 1),
  ('日喀则市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 2),
  ('昌都市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 3),
  ('林芝市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 4),
  ('山南市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 5),
  ('那曲市', 'china', (SELECT id FROM regions WHERE name = '西藏'), 6),
  ('阿里地区', 'china', (SELECT id FROM regions WHERE name = '西藏'), 7)
ON CONFLICT DO NOTHING;

-- 宁夏
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('银川市', 'china', (SELECT id FROM regions WHERE name = '宁夏'), 1),
  ('石嘴山市', 'china', (SELECT id FROM regions WHERE name = '宁夏'), 2),
  ('吴忠市', 'china', (SELECT id FROM regions WHERE name = '宁夏'), 3),
  ('固原市', 'china', (SELECT id FROM regions WHERE name = '宁夏'), 4),
  ('中卫市', 'china', (SELECT id FROM regions WHERE name = '宁夏'), 5)
ON CONFLICT DO NOTHING;

-- 青海
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('西宁市', 'china', (SELECT id FROM regions WHERE name = '青海'), 1),
  ('海东市', 'china', (SELECT id FROM regions WHERE name = '青海'), 2),
  ('海北藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 3),
  ('黄南藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 4),
  ('海南藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 5),
  ('果洛藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 6),
  ('玉树藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 7),
  ('海西蒙古族藏族自治州', 'china', (SELECT id FROM regions WHERE name = '青海'), 8)
ON CONFLICT DO NOTHING;

-- 台湾
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('台北市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 1),
  ('新北市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 2),
  ('桃园市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 3),
  ('台中市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 4),
  ('台南市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 5),
  ('高雄市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 6),
  ('基隆市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 7),
  ('新竹市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 8),
  ('嘉义市', 'china', (SELECT id FROM regions WHERE name = '台湾'), 9)
ON CONFLICT DO NOTHING;

-- 香港
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('中西区', 'china', (SELECT id FROM regions WHERE name = '香港'), 1),
  ('湾仔区', 'china', (SELECT id FROM regions WHERE name = '香港'), 2),
  ('东区', 'china', (SELECT id FROM regions WHERE name = '香港'), 3),
  ('南区', 'china', (SELECT id FROM regions WHERE name = '香港'), 4),
  ('油尖旺区', 'china', (SELECT id FROM regions WHERE name = '香港'), 5),
  ('深水埗区', 'china', (SELECT id FROM regions WHERE name = '香港'), 6),
  ('九龙城区', 'china', (SELECT id FROM regions WHERE name = '香港'), 7),
  ('黄大仙区', 'china', (SELECT id FROM regions WHERE name = '香港'), 8),
  ('观塘区', 'china', (SELECT id FROM regions WHERE name = '香港'), 9),
  ('葵青区', 'china', (SELECT id FROM regions WHERE name = '香港'), 10),
  ('荃湾区', 'china', (SELECT id FROM regions WHERE name = '香港'), 11),
  ('屯门区', 'china', (SELECT id FROM regions WHERE name = '香港'), 12),
  ('元朗区', 'china', (SELECT id FROM regions WHERE name = '香港'), 13),
  ('北区', 'china', (SELECT id FROM regions WHERE name = '香港'), 14),
  ('大埔区', 'china', (SELECT id FROM regions WHERE name = '香港'), 15),
  ('沙田区', 'china', (SELECT id FROM regions WHERE name = '香港'), 16),
  ('西贡区', 'china', (SELECT id FROM regions WHERE name = '香港'), 17),
  ('离岛区', 'china', (SELECT id FROM regions WHERE name = '香港'), 18)
ON CONFLICT DO NOTHING;

-- 澳门
INSERT INTO regions (name, type, parent_id, order_num) VALUES
  ('澳门半岛', 'china', (SELECT id FROM regions WHERE name = '澳门'), 1),
  ('氹仔', 'china', (SELECT id FROM regions WHERE name = '澳门'), 2),
  ('路环', 'china', (SELECT id FROM regions WHERE name = '澳门'), 3)
ON CONFLICT DO NOTHING;

-- 完成
SELECT 'Regions initialization completed successfully' as message;
