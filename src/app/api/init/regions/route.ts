import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 中国省市区数据
const REGIONS_DATA = [
  // 省份
  { name: '北京', type: 'china', parentId: null, orderNum: 1 },
  { name: '天津', type: 'china', parentId: null, orderNum: 2 },
  { name: '河北', type: 'china', parentId: null, orderNum: 3 },
  { name: '山西', type: 'china', parentId: null, orderNum: 4 },
  { name: '内蒙古', type: 'china', parentId: null, orderNum: 5 },
  { name: '辽宁', type: 'china', parentId: null, orderNum: 6 },
  { name: '吉林', type: 'china', parentId: null, orderNum: 7 },
  { name: '黑龙江', type: 'china', parentId: null, orderNum: 8 },
  { name: '上海', type: 'china', parentId: null, orderNum: 9 },
  { name: '江苏', type: 'china', parentId: null, orderNum: 10 },
  { name: '浙江', type: 'china', parentId: null, orderNum: 11 },
  { name: '安徽', type: 'china', parentId: null, orderNum: 12 },
  { name: '福建', type: 'china', parentId: null, orderNum: 13 },
  { name: '江西', type: 'china', parentId: null, orderNum: 14 },
  { name: '山东', type: 'china', parentId: null, orderNum: 15 },
  { name: '河南', type: 'china', parentId: null, orderNum: 16 },
  { name: '湖北', type: 'china', parentId: null, orderNum: 17 },
  { name: '湖南', type: 'china', parentId: null, orderNum: 18 },
  { name: '广东', type: 'china', parentId: null, orderNum: 19 },
  { name: '广西', type: 'china', parentId: null, orderNum: 20 },
  { name: '海南', type: 'china', parentId: null, orderNum: 21 },
  { name: '重庆', type: 'china', parentId: null, orderNum: 22 },
  { name: '四川', type: 'china', parentId: null, orderNum: 23 },
  { name: '贵州', type: 'china', parentId: null, orderNum: 24 },
  { name: '云南', type: 'china', parentId: null, orderNum: 25 },
  { name: '西藏', type: 'china', parentId: null, orderNum: 26 },
  { name: '陕西', type: 'china', parentId: null, orderNum: 27 },
  { name: '甘肃', type: 'china', parentId: null, orderNum: 28 },
  { name: '青海', type: 'china', parentId: null, orderNum: 29 },
  { name: '宁夏', type: 'china', parentId: null, orderNum: 30 },
  { name: '新疆', type: 'china', parentId: null, orderNum: 31 },
  { name: '台湾', type: 'china', parentId: null, orderNum: 32 },
  { name: '香港', type: 'china', parentId: null, orderNum: 33 },
  { name: '澳门', type: 'china', parentId: null, orderNum: 34 },
];

// 城市数据（简化版本，只包含主要城市）
const CITIES_DATA: Record<string, { name: string; orderNum: number }[]> = {
  '北京': [
    { name: '朝阳区', orderNum: 1 },
    { name: '海淀区', orderNum: 2 },
    { name: '东城区', orderNum: 3 },
    { name: '西城区', orderNum: 4 },
    { name: '丰台区', orderNum: 5 },
    { name: '石景山区', orderNum: 6 },
    { name: '通州区', orderNum: 7 },
    { name: '顺义区', orderNum: 8 },
    { name: '昌平区', orderNum: 9 },
    { name: '大兴区', orderNum: 10 },
  ],
  '上海': [
    { name: '黄浦区', orderNum: 1 },
    { name: '徐汇区', orderNum: 2 },
    { name: '长宁区', orderNum: 3 },
    { name: '静安区', orderNum: 4 },
    { name: '普陀区', orderNum: 5 },
    { name: '虹口区', orderNum: 6 },
    { name: '杨浦区', orderNum: 7 },
    { name: '浦东新区', orderNum: 8 },
    { name: '闵行区', orderNum: 9 },
    { name: '宝山区', orderNum: 10 },
    { name: '嘉定区', orderNum: 11 },
    { name: '金山区', orderNum: 12 },
    { name: '松江区', orderNum: 13 },
    { name: '青浦区', orderNum: 14 },
    { name: '奉贤区', orderNum: 15 },
    { name: '崇明区', orderNum: 16 },
  ],
  '天津': [
    { name: '和平区', orderNum: 1 },
    { name: '河西区', orderNum: 2 },
    { name: '南开区', orderNum: 3 },
    { name: '河东区', orderNum: 4 },
    { name: '河北区', orderNum: 5 },
    { name: '红桥区', orderNum: 6 },
    { name: '东丽区', orderNum: 7 },
    { name: '西青区', orderNum: 8 },
    { name: '津南区', orderNum: 9 },
    { name: '北辰区', orderNum: 10 },
    { name: '武清区', orderNum: 11 },
    { name: '宝坻区', orderNum: 12 },
    { name: '滨海新区', orderNum: 13 },
    { name: '宁河区', orderNum: 14 },
    { name: '静海区', orderNum: 15 },
    { name: '蓟州区', orderNum: 16 },
  ],
  '重庆': [
    { name: '万州区', orderNum: 1 },
    { name: '涪陵区', orderNum: 2 },
    { name: '渝中区', orderNum: 3 },
    { name: '大渡口区', orderNum: 4 },
    { name: '江北区', orderNum: 5 },
    { name: '沙坪坝区', orderNum: 6 },
    { name: '九龙坡区', orderNum: 7 },
    { name: '南岸区', orderNum: 8 },
    { name: '北碚区', orderNum: 9 },
    { name: '綦江区', orderNum: 10 },
    { name: '大足区', orderNum: 11 },
    { name: '渝北区', orderNum: 12 },
    { name: '巴南区', orderNum: 13 },
    { name: '黔江区', orderNum: 14 },
    { name: '长寿区', orderNum: 15 },
  ],
  '浙江': [
    { name: '杭州市', orderNum: 1 },
    { name: '宁波市', orderNum: 2 },
    { name: '温州市', orderNum: 3 },
    { name: '嘉兴市', orderNum: 4 },
    { name: '湖州市', orderNum: 5 },
    { name: '绍兴市', orderNum: 6 },
    { name: '金华市', orderNum: 7 },
    { name: '衢州市', orderNum: 8 },
    { name: '舟山市', orderNum: 9 },
    { name: '台州市', orderNum: 10 },
    { name: '丽水市', orderNum: 11 },
  ],
  '江苏': [
    { name: '南京市', orderNum: 1 },
    { name: '无锡市', orderNum: 2 },
    { name: '徐州市', orderNum: 3 },
    { name: '常州市', orderNum: 4 },
    { name: '苏州市', orderNum: 5 },
    { name: '南通市', orderNum: 6 },
    { name: '连云港市', orderNum: 7 },
    { name: '淮安市', orderNum: 8 },
    { name: '盐城市', orderNum: 9 },
    { name: '扬州市', orderNum: 10 },
    { name: '镇江市', orderNum: 11 },
    { name: '泰州市', orderNum: 12 },
    { name: '宿迁市', orderNum: 13 },
  ],
  '广东': [
    { name: '广州市', orderNum: 1 },
    { name: '深圳市', orderNum: 2 },
    { name: '珠海市', orderNum: 3 },
    { name: '汕头市', orderNum: 4 },
    { name: '佛山市', orderNum: 5 },
    { name: '韶关市', orderNum: 6 },
    { name: '湛江市', orderNum: 7 },
    { name: '肇庆市', orderNum: 8 },
    { name: '江门市', orderNum: 9 },
    { name: '茂名市', orderNum: 10 },
    { name: '惠州市', orderNum: 11 },
    { name: '梅州市', orderNum: 12 },
    { name: '汕尾市', orderNum: 13 },
    { name: '河源市', orderNum: 14 },
    { name: '阳江市', orderNum: 15 },
    { name: '清远市', orderNum: 16 },
    { name: '东莞市', orderNum: 17 },
    { name: '中山市', orderNum: 18 },
    { name: '潮州市', orderNum: 19 },
    { name: '揭阳市', orderNum: 20 },
    { name: '云浮市', orderNum: 21 },
  ],
  '山东': [
    { name: '济南市', orderNum: 1 },
    { name: '青岛市', orderNum: 2 },
    { name: '淄博市', orderNum: 3 },
    { name: '枣庄市', orderNum: 4 },
    { name: '东营市', orderNum: 5 },
    { name: '烟台市', orderNum: 6 },
    { name: '潍坊市', orderNum: 7 },
    { name: '济宁市', orderNum: 8 },
    { name: '泰安市', orderNum: 9 },
    { name: '威海市', orderNum: 10 },
    { name: '日照市', orderNum: 11 },
    { name: '临沂市', orderNum: 12 },
    { name: '德州市', orderNum: 13 },
    { name: '聊城市', orderNum: 14 },
    { name: '滨州市', orderNum: 15 },
    { name: '菏泽市', orderNum: 16 },
  ],
  '四川': [
    { name: '成都市', orderNum: 1 },
    { name: '自贡市', orderNum: 2 },
    { name: '攀枝花市', orderNum: 3 },
    { name: '泸州市', orderNum: 4 },
    { name: '德阳市', orderNum: 5 },
    { name: '绵阳市', orderNum: 6 },
    { name: '广元市', orderNum: 7 },
    { name: '遂宁市', orderNum: 8 },
    { name: '内江市', orderNum: 9 },
    { name: '乐山市', orderNum: 10 },
    { name: '南充市', orderNum: 11 },
    { name: '眉山市', orderNum: 12 },
    { name: '宜宾市', orderNum: 13 },
    { name: '广安市', orderNum: 14 },
    { name: '达州市', orderNum: 15 },
    { name: '雅安市', orderNum: 16 },
    { name: '巴中市', orderNum: 17 },
    { name: '资阳市', orderNum: 18 },
  ],
  '湖北': [
    { name: '武汉市', orderNum: 1 },
    { name: '黄石市', orderNum: 2 },
    { name: '十堰市', orderNum: 3 },
    { name: '宜昌市', orderNum: 4 },
    { name: '襄阳市', orderNum: 5 },
    { name: '鄂州市', orderNum: 6 },
    { name: '荆门市', orderNum: 7 },
    { name: '孝感市', orderNum: 8 },
    { name: '荆州市', orderNum: 9 },
    { name: '黄冈市', orderNum: 10 },
    { name: '咸宁市', orderNum: 11 },
    { name: '随州市', orderNum: 12 },
    { name: '恩施土家族苗族自治州', orderNum: 13 },
  ],
  '湖南': [
    { name: '长沙市', orderNum: 1 },
    { name: '株洲市', orderNum: 2 },
    { name: '湘潭市', orderNum: 3 },
    { name: '衡阳市', orderNum: 4 },
    { name: '邵阳市', orderNum: 5 },
    { name: '岳阳市', orderNum: 6 },
    { name: '常德市', orderNum: 7 },
    { name: '张家界市', orderNum: 8 },
    { name: '益阳市', orderNum: 9 },
    { name: '郴州市', orderNum: 10 },
    { name: '永州市', orderNum: 11 },
    { name: '怀化市', orderNum: 12 },
    { name: '娄底市', orderNum: 13 },
    { name: '湘西土家族苗族自治州', orderNum: 14 },
  ],
  '河南': [
    { name: '郑州市', orderNum: 1 },
    { name: '开封市', orderNum: 2 },
    { name: '洛阳市', orderNum: 3 },
    { name: '平顶山市', orderNum: 4 },
    { name: '安阳市', orderNum: 5 },
    { name: '鹤壁市', orderNum: 6 },
    { name: '新乡市', orderNum: 7 },
    { name: '焦作市', orderNum: 8 },
    { name: '濮阳市', orderNum: 9 },
    { name: '许昌市', orderNum: 10 },
    { name: '漯河市', orderNum: 11 },
    { name: '三门峡市', orderNum: 12 },
    { name: '南阳市', orderNum: 13 },
    { name: '商丘市', orderNum: 14 },
    { name: '信阳市', orderNum: 15 },
    { name: '周口市', orderNum: 16 },
    { name: '驻马店市', orderNum: 17 },
    { name: '济源市', orderNum: 18 },
  ],
  '福建': [
    { name: '福州市', orderNum: 1 },
    { name: '厦门市', orderNum: 2 },
    { name: '莆田市', orderNum: 3 },
    { name: '三明市', orderNum: 4 },
    { name: '泉州市', orderNum: 5 },
    { name: '漳州市', orderNum: 6 },
    { name: '南平市', orderNum: 7 },
    { name: '龙岩市', orderNum: 8 },
    { name: '宁德市', orderNum: 9 },
  ],
  '云南': [
    { name: '昆明市', orderNum: 1 },
    { name: '曲靖市', orderNum: 2 },
    { name: '玉溪市', orderNum: 3 },
    { name: '保山市', orderNum: 4 },
    { name: '昭通市', orderNum: 5 },
    { name: '丽江市', orderNum: 6 },
    { name: '普洱市', orderNum: 7 },
    { name: '临沧市', orderNum: 8 },
    { name: '楚雄彝族自治州', orderNum: 9 },
    { name: '红河哈尼族彝族自治州', orderNum: 10 },
    { name: '文山壮族苗族自治州', orderNum: 11 },
    { name: '西双版纳傣族自治州', orderNum: 12 },
    { name: '大理白族自治州', orderNum: 13 },
    { name: '德宏傣族景颇族自治州', orderNum: 14 },
    { name: '怒江傈僳族自治州', orderNum: 15 },
    { name: '迪庆藏族自治州', orderNum: 16 },
  ],
  '广西': [
    { name: '南宁市', orderNum: 1 },
    { name: '柳州市', orderNum: 2 },
    { name: '桂林市', orderNum: 3 },
    { name: '梧州市', orderNum: 4 },
    { name: '北海市', orderNum: 5 },
    { name: '防城港市', orderNum: 6 },
    { name: '钦州市', orderNum: 7 },
    { name: '贵港市', orderNum: 8 },
    { name: '玉林市', orderNum: 9 },
    { name: '百色市', orderNum: 10 },
    { name: '贺州市', orderNum: 11 },
    { name: '河池市', orderNum: 12 },
    { name: '来宾市', orderNum: 13 },
    { name: '崇左市', orderNum: 14 },
  ],
  '安徽': [
    { name: '合肥市', orderNum: 1 },
    { name: '芜湖市', orderNum: 2 },
    { name: '蚌埠市', orderNum: 3 },
    { name: '淮南市', orderNum: 4 },
    { name: '马鞍山市', orderNum: 5 },
    { name: '淮北市', orderNum: 6 },
    { name: '铜陵市', orderNum: 7 },
    { name: '安庆市', orderNum: 8 },
    { name: '黄山市', orderNum: 9 },
    { name: '滁州市', orderNum: 10 },
    { name: '阜阳市', orderNum: 11 },
    { name: '宿州市', orderNum: 12 },
    { name: '六安市', orderNum: 13 },
    { name: '亳州市', orderNum: 14 },
    { name: '池州市', orderNum: 15 },
    { name: '宣城市', orderNum: 16 },
  ],
  '江西': [
    { name: '南昌市', orderNum: 1 },
    { name: '景德镇市', orderNum: 2 },
    { name: '萍乡市', orderNum: 3 },
    { name: '九江市', orderNum: 4 },
    { name: '新余市', orderNum: 5 },
    { name: '鹰潭市', orderNum: 6 },
    { name: '赣州市', orderNum: 7 },
    { name: '吉安市', orderNum: 8 },
    { name: '宜春市', orderNum: 9 },
    { name: '抚州市', orderNum: 10 },
    { name: '上饶市', orderNum: 11 },
  ],
  '陕西': [
    { name: '西安市', orderNum: 1 },
    { name: '铜川市', orderNum: 2 },
    { name: '宝鸡市', orderNum: 3 },
    { name: '咸阳市', orderNum: 4 },
    { name: '渭南市', orderNum: 5 },
    { name: '延安市', orderNum: 6 },
    { name: '汉中市', orderNum: 7 },
    { name: '榆林市', orderNum: 8 },
    { name: '安康市', orderNum: 9 },
    { name: '商洛市', orderNum: 10 },
  ],
  '贵州': [
    { name: '贵阳市', orderNum: 1 },
    { name: '六盘水市', orderNum: 2 },
    { name: '遵义市', orderNum: 3 },
    { name: '安顺市', orderNum: 4 },
    { name: '毕节市', orderNum: 5 },
    { name: '铜仁市', orderNum: 6 },
    { name: '黔西南布依族苗族自治州', orderNum: 7 },
    { name: '黔东南苗族侗族自治州', orderNum: 8 },
    { name: '黔南布依族苗族自治州', orderNum: 9 },
  ],
  '辽宁': [
    { name: '沈阳市', orderNum: 1 },
    { name: '大连市', orderNum: 2 },
    { name: '鞍山市', orderNum: 3 },
    { name: '抚顺市', orderNum: 4 },
    { name: '本溪市', orderNum: 5 },
    { name: '丹东市', orderNum: 6 },
    { name: '锦州市', orderNum: 7 },
    { name: '营口市', orderNum: 8 },
    { name: '阜新市', orderNum: 9 },
    { name: '辽阳市', orderNum: 10 },
    { name: '盘锦市', orderNum: 11 },
    { name: '铁岭市', orderNum: 12 },
    { name: '朝阳市', orderNum: 13 },
    { name: '葫芦岛市', orderNum: 14 },
  ],
  '河北': [
    { name: '石家庄市', orderNum: 1 },
    { name: '唐山市', orderNum: 2 },
    { name: '秦皇岛市', orderNum: 3 },
    { name: '邯郸市', orderNum: 4 },
    { name: '邢台市', orderNum: 5 },
    { name: '保定市', orderNum: 6 },
    { name: '张家口市', orderNum: 7 },
    { name: '承德市', orderNum: 8 },
    { name: '沧州市', orderNum: 9 },
    { name: '廊坊市', orderNum: 10 },
    { name: '衡水市', orderNum: 11 },
  ],
  '吉林': [
    { name: '长春市', orderNum: 1 },
    { name: '吉林市', orderNum: 2 },
    { name: '四平市', orderNum: 3 },
    { name: '辽源市', orderNum: 4 },
    { name: '通化市', orderNum: 5 },
    { name: '白山市', orderNum: 6 },
    { name: '松原市', orderNum: 7 },
    { name: '白城市', orderNum: 8 },
    { name: '延边朝鲜族自治州', orderNum: 9 },
  ],
  '黑龙江': [
    { name: '哈尔滨市', orderNum: 1 },
    { name: '齐齐哈尔市', orderNum: 2 },
    { name: '鸡西市', orderNum: 3 },
    { name: '鹤岗市', orderNum: 4 },
    { name: '双鸭山市', orderNum: 5 },
    { name: '大庆市', orderNum: 6 },
    { name: '伊春市', orderNum: 7 },
    { name: '佳木斯市', orderNum: 8 },
    { name: '七台河市', orderNum: 9 },
    { name: '牡丹江市', orderNum: 10 },
    { name: '黑河市', orderNum: 11 },
    { name: '绥化市', orderNum: 12 },
    { name: '大兴安岭地区', orderNum: 13 },
  ],
  '山西': [
    { name: '太原市', orderNum: 1 },
    { name: '大同市', orderNum: 2 },
    { name: '阳泉市', orderNum: 3 },
    { name: '长治市', orderNum: 4 },
    { name: '晋城市', orderNum: 5 },
    { name: '朔州市', orderNum: 6 },
    { name: '晋中市', orderNum: 7 },
    { name: '运城市', orderNum: 8 },
    { name: '忻州市', orderNum: 9 },
    { name: '临汾市', orderNum: 10 },
    { name: '吕梁市', orderNum: 11 },
  ],
  '内蒙古': [
    { name: '呼和浩特市', orderNum: 1 },
    { name: '包头市', orderNum: 2 },
    { name: '乌海市', orderNum: 3 },
    { name: '赤峰市', orderNum: 4 },
    { name: '通辽市', orderNum: 5 },
    { name: '鄂尔多斯市', orderNum: 6 },
    { name: '呼伦贝尔市', orderNum: 7 },
    { name: '巴彦淖尔市', orderNum: 8 },
    { name: '乌兰察布市', orderNum: 9 },
    { name: '兴安盟', orderNum: 10 },
    { name: '锡林郭勒盟', orderNum: 11 },
    { name: '阿拉善盟', orderNum: 12 },
  ],
  '海南': [
    { name: '海口市', orderNum: 1 },
    { name: '三亚市', orderNum: 2 },
    { name: '三沙市', orderNum: 3 },
    { name: '儋州市', orderNum: 4 },
    { name: '五指山市', orderNum: 5 },
    { name: '琼海市', orderNum: 6 },
    { name: '文昌市', orderNum: 7 },
    { name: '万宁市', orderNum: 8 },
    { name: '东方市', orderNum: 9 },
  ],
  '甘肃': [
    { name: '兰州市', orderNum: 1 },
    { name: '嘉峪关市', orderNum: 2 },
    { name: '金昌市', orderNum: 3 },
    { name: '白银市', orderNum: 4 },
    { name: '天水市', orderNum: 5 },
    { name: '武威市', orderNum: 6 },
    { name: '张掖市', orderNum: 7 },
    { name: '平凉市', orderNum: 8 },
    { name: '酒泉市', orderNum: 9 },
    { name: '庆阳市', orderNum: 10 },
    { name: '定西市', orderNum: 11 },
    { name: '陇南市', orderNum: 12 },
    { name: '临夏回族自治州', orderNum: 13 },
    { name: '甘南藏族自治州', orderNum: 14 },
  ],
  '新疆': [
    { name: '乌鲁木齐市', orderNum: 1 },
    { name: '克拉玛依市', orderNum: 2 },
    { name: '吐鲁番市', orderNum: 3 },
    { name: '哈密市', orderNum: 4 },
    { name: '昌吉回族自治州', orderNum: 5 },
    { name: '博尔塔拉蒙古自治州', orderNum: 6 },
    { name: '巴音郭楞蒙古自治州', orderNum: 7 },
    { name: '阿克苏地区', orderNum: 8 },
    { name: '克孜勒苏柯尔克孜自治州', orderNum: 9 },
    { name: '喀什地区', orderNum: 10 },
    { name: '和田地区', orderNum: 11 },
    { name: '伊犁哈萨克自治州', orderNum: 12 },
    { name: '塔城地区', orderNum: 13 },
    { name: '阿勒泰地区', orderNum: 14 },
    { name: '石河子市', orderNum: 15 },
  ],
  '西藏': [
    { name: '拉萨市', orderNum: 1 },
    { name: '日喀则市', orderNum: 2 },
    { name: '昌都市', orderNum: 3 },
    { name: '林芝市', orderNum: 4 },
    { name: '山南市', orderNum: 5 },
    { name: '那曲市', orderNum: 6 },
    { name: '阿里地区', orderNum: 7 },
  ],
  '宁夏': [
    { name: '银川市', orderNum: 1 },
    { name: '石嘴山市', orderNum: 2 },
    { name: '吴忠市', orderNum: 3 },
    { name: '固原市', orderNum: 4 },
    { name: '中卫市', orderNum: 5 },
  ],
  '青海': [
    { name: '西宁市', orderNum: 1 },
    { name: '海东市', orderNum: 2 },
    { name: '海北藏族自治州', orderNum: 3 },
    { name: '黄南藏族自治州', orderNum: 4 },
    { name: '海南藏族自治州', orderNum: 5 },
    { name: '果洛藏族自治州', orderNum: 6 },
    { name: '玉树藏族自治州', orderNum: 7 },
    { name: '海西蒙古族藏族自治州', orderNum: 8 },
  ],
  '台湾': [
    { name: '台北市', orderNum: 1 },
    { name: '新北市', orderNum: 2 },
    { name: '桃园市', orderNum: 3 },
    { name: '台中市', orderNum: 4 },
    { name: '台南市', orderNum: 5 },
    { name: '高雄市', orderNum: 6 },
    { name: '基隆市', orderNum: 7 },
    { name: '新竹市', orderNum: 8 },
    { name: '嘉义市', orderNum: 9 },
  ],
  '香港': [
    { name: '中西区', orderNum: 1 },
    { name: '湾仔区', orderNum: 2 },
    { name: '东区', orderNum: 3 },
    { name: '南区', orderNum: 4 },
    { name: '油尖旺区', orderNum: 5 },
    { name: '深水埗区', orderNum: 6 },
    { name: '九龙城区', orderNum: 7 },
    { name: '黄大仙区', orderNum: 8 },
    { name: '观塘区', orderNum: 9 },
    { name: '葵青区', orderNum: 10 },
    { name: '荃湾区', orderNum: 11 },
    { name: '屯门区', orderNum: 12 },
    { name: '元朗区', orderNum: 13 },
    { name: '北区', orderNum: 14 },
    { name: '大埔区', orderNum: 15 },
    { name: '沙田区', orderNum: 16 },
    { name: '西贡区', orderNum: 17 },
    { name: '离岛区', orderNum: 18 },
  ],
  '澳门': [
    { name: '澳门半岛', orderNum: 1 },
    { name: '氹仔', orderNum: 2 },
    { name: '路环', orderNum: 3 },
  ],
};

// POST - 初始化地区数据
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';

    // 检查是否已经初始化
    const { data: existingRegions } = await client
      .from('regions')
      .select('count')
      .eq('type', 'china');

    const hasData = existingRegions && existingRegions.length > 0 && (existingRegions as any)[0]?.count > 0;

    if (hasData && !force) {
      return NextResponse.json({
        success: false,
        message: '地区数据已存在，无需重复初始化。如需重新初始化，请添加 ?force=true 参数',
      });
    }

    // 如果强制重新初始化，先删除所有中国地区数据和相关的访问记录
    if (force && hasData) {
      console.log('[Init Regions] Force reinitialization: deleting existing data...');
      
      // 先获取所有中国地区的 ID
      const { data: chinaRegions } = await client
        .from('regions')
        .select('id')
        .eq('type', 'china');
      
      if (chinaRegions && chinaRegions.length > 0) {
        const regionIds = chinaRegions.map((r: any) => r.id);
        console.log('[Init Regions] Deleting', regionIds.length, 'regions and their children...');
        
        // 先删除所有这些地区的访问记录
        const { error: deleteVisitsError } = await client
          .from('visits')
          .delete()
          .in('region_id', regionIds);

        if (deleteVisitsError) {
          console.error('[Init Regions] Error deleting visits:', deleteVisitsError);
        }
        
        // 再删除所有中国地区数据（包括子地区）
        const { error: deleteError } = await client
          .from('regions')
          .delete()
          .in('id', regionIds);

        if (deleteError) {
          console.error('[Init Regions] Error deleting existing regions:', deleteError);
          return NextResponse.json(
            { success: false, error: '删除旧数据失败' },
            { status: 500 }
          );
        }
      }
      
      console.log('[Init Regions] Existing data deleted successfully');
    }

    // 插入省份（分批插入以避免问题）
    const batchSize = 10;
    let insertedProvinces: any[] = [];
    let currentId = 100; // 从 100 开始的 ID，避免与数据库序列冲突
    
    for (let i = 0; i < REGIONS_DATA.length; i += batchSize) {
      const batch = REGIONS_DATA.slice(i, i + batchSize);
      const { data: insertedData, error: batchError } = await client
        .from('regions')
        .insert(
          batch.map((r) => ({
            id: currentId++, // 显式指定 ID
            name: r.name,
            type: r.type,
            parent_id: r.parentId,
            order_num: r.orderNum,
          }))
        )
        .select();

      if (batchError) {
        console.error('[Init Regions] Error inserting province batch:', batchError);
        return NextResponse.json(
          { success: false, error: `插入省份数据失败（批次 ${i / batchSize + 1}）: ${batchError.message}` },
          { status: 500 }
        );
      }
      
      if (insertedData) {
        insertedProvinces = insertedProvinces.concat(insertedData);
      }
    }

    console.log('[Init Regions] Provinces inserted:', insertedProvinces.length);

    // 获取省份 ID 映射
    const provinceIdMap: Record<string, number> = {};
    if (insertedProvinces) {
      insertedProvinces.forEach((p: any) => {
        provinceIdMap[p.name] = p.id;
      });
    }

    // 插入城市（使用显式 ID）
    const citiesToInsert: any[] = [];
    let cityId = 200; // 从 200 开始的 ID（省份 ID 是 100-133）
    
    Object.entries(CITIES_DATA).forEach(([provinceName, cities]) => {
      const parentId = provinceIdMap[provinceName];
      if (parentId) {
        cities.forEach((city) => {
          citiesToInsert.push({
            id: cityId++, // 显式指定 ID
            name: city.name,
            type: 'china',
            parent_id: parentId,
            order_num: city.orderNum,
          });
        });
      }
    });

    console.log('[Init Regions] Cities to insert:', citiesToInsert.length);

    if (citiesToInsert.length > 0) {
      // 分批插入城市数据
      const cityBatchSize = 50;
      let insertedCitiesCount = 0;
      
      for (let i = 0; i < citiesToInsert.length; i += cityBatchSize) {
        const batch = citiesToInsert.slice(i, i + cityBatchSize);
        const { error: citiesError } = await client
          .from('regions')
          .insert(batch);

        if (citiesError) {
          console.error('[Init Regions] Error inserting city batch:', citiesError);
          return NextResponse.json(
            { success: false, error: `插入城市数据失败（批次 ${i / cityBatchSize + 1}）: ${citiesError.message}` },
            { status: 500 }
          );
        }
        insertedCitiesCount += batch.length;
      }
      
      console.log('[Init Regions] Cities inserted:', insertedCitiesCount);
    }

    return NextResponse.json({
      success: true,
      message: force 
        ? `成功重新初始化 ${REGIONS_DATA.length} 个省份和 ${citiesToInsert.length} 个城市`
        : `成功初始化 ${REGIONS_DATA.length} 个省份和 ${citiesToInsert.length} 个城市`,
    });
  } catch (error) {
    console.error('[Init Regions] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `初始化失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
