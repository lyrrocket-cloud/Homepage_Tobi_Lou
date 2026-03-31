import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

// 世界国家数据
const worldCountries = [
  // 欧洲国家
  { id: 800, name: '德国' }, { id: 801, name: '法国' }, { id: 802, name: '意大利' }, { id: 803, name: '瑞士' },
  { id: 804, name: '奥地利' }, { id: 805, name: '英国' }, { id: 806, name: '西班牙' }, { id: 807, name: '葡萄牙' },
  { id: 808, name: '荷兰' }, { id: 809, name: '比利时' }, { id: 810, name: '希腊' }, { id: 811, name: '瑞典' },
  { id: 812, name: '挪威' }, { id: 813, name: '丹麦' }, { id: 814, name: '芬兰' }, { id: 815, name: '爱尔兰' },
  { id: 816, name: '波兰' }, { id: 817, name: '捷克' }, { id: 818, name: '匈牙利' }, { id: 819, name: '冰岛' },
  { id: 820, name: '俄罗斯' }, { id: 821, name: '土耳其' }, { id: 822, name: '乌克兰' }, { id: 823, name: '克罗地亚' },
  { id: 824, name: '罗马尼亚' }, { id: 825, name: '保加利亚' }, { id: 826, name: '塞尔维亚' }, { id: 827, name: '斯洛伐克' },
  { id: 828, name: '斯洛文尼亚' }, { id: 829, name: '卢森堡' }, { id: 830, name: '马耳他' }, { id: 831, name: '塞浦路斯' },
  { id: 832, name: '爱沙尼亚' }, { id: 833, name: '拉脱维亚' }, { id: 834, name: '立陶宛' }, { id: 835, name: '摩纳哥' },
  { id: 836, name: '梵蒂冈' }, { id: 837, name: '圣马力诺' }, { id: 838, name: '列支敦士登' }, { id: 839, name: '安道尔' },
  { id: 840, name: '北马其顿' }, { id: 841, name: '阿尔巴尼亚' }, { id: 842, name: '黑山' }, { id: 843, name: '波黑' },
  { id: 844, name: '摩尔多瓦' }, { id: 845, name: '白俄罗斯' }, { id: 846, name: '格鲁吉亚' }, { id: 847, name: '亚美尼亚' },
  { id: 848, name: '阿塞拜疆' }, { id: 849, name: '哈萨克斯坦' },
  // 亚洲国家
  { id: 900, name: '日本' }, { id: 901, name: '韩国' }, { id: 902, name: '朝鲜' }, { id: 903, name: '泰国' },
  { id: 904, name: '新加坡' }, { id: 905, name: '马来西亚' }, { id: 906, name: '印度尼西亚' }, { id: 907, name: '菲律宾' },
  { id: 908, name: '越南' }, { id: 909, name: '柬埔寨' }, { id: 910, name: '缅甸' }, { id: 911, name: '老挝' },
  { id: 912, name: '印度' }, { id: 913, name: '尼泊尔' }, { id: 914, name: '不丹' }, { id: 915, name: '斯里兰卡' },
  { id: 916, name: '孟加拉国' }, { id: 917, name: '巴基斯坦' }, { id: 918, name: '阿富汗' }, { id: 919, name: '伊朗' },
  { id: 920, name: '伊拉克' }, { id: 921, name: '叙利亚' }, { id: 922, name: '约旦' }, { id: 923, name: '黎巴嫩' },
  { id: 924, name: '以色列' }, { id: 925, name: '巴勒斯坦' }, { id: 926, name: '沙特阿拉伯' }, { id: 927, name: '阿联酋' },
  { id: 928, name: '卡塔尔' }, { id: 929, name: '科威特' }, { id: 930, name: '巴林' }, { id: 931, name: '阿曼' },
  { id: 932, name: '也门' }, { id: 933, name: '蒙古' }, { id: 934, name: '文莱' }, { id: 935, name: '东帝汶' },
  { id: 936, name: '马尔代夫' }, { id: 937, name: '乌兹别克斯坦' }, { id: 938, name: '土库曼斯坦' }, { id: 939, name: '塔吉克斯坦' },
  { id: 940, name: '吉尔吉斯斯坦' },
  // 北美洲国家
  { id: 1000, name: '美国' }, { id: 1001, name: '加拿大' }, { id: 1002, name: '墨西哥' }, { id: 1003, name: '古巴' },
  { id: 1004, name: '牙买加' }, { id: 1005, name: '巴哈马' }, { id: 1006, name: '多米尼加' }, { id: 1007, name: '海地' },
  { id: 1008, name: '波多黎各' }, { id: 1009, name: '危地马拉' }, { id: 1010, name: '伯利兹' }, { id: 1011, name: '洪都拉斯' },
  { id: 1012, name: '萨尔瓦多' }, { id: 1013, name: '尼加拉瓜' }, { id: 1014, name: '哥斯达黎加' }, { id: 1015, name: '巴拿马' },
  { id: 1016, name: '特立尼达和多巴哥' }, { id: 1017, name: '巴巴多斯' }, { id: 1018, name: '格陵兰' },
  // 大洋洲国家
  { id: 1100, name: '澳大利亚' }, { id: 1101, name: '新西兰' }, { id: 1102, name: '斐济' }, { id: 1103, name: '巴布亚新几内亚' },
  { id: 1104, name: '所罗门群岛' }, { id: 1105, name: '瓦努阿图' }, { id: 1106, name: '萨摩亚' }, { id: 1107, name: '汤加' },
  { id: 1108, name: '密克罗尼西亚' }, { id: 1109, name: '基里巴斯' }, { id: 1110, name: '马绍尔群岛' }, { id: 1111, name: '帕劳' },
  { id: 1112, name: '瑙鲁' }, { id: 1113, name: '图瓦卢' },
  // 南美洲国家
  { id: 1200, name: '巴西' }, { id: 1201, name: '阿根廷' }, { id: 1202, name: '智利' }, { id: 1203, name: '哥伦比亚' },
  { id: 1204, name: '秘鲁' }, { id: 1205, name: '委内瑞拉' }, { id: 1206, name: '厄瓜多尔' }, { id: 1207, name: '玻利维亚' },
  { id: 1208, name: '巴拉圭' }, { id: 1209, name: '乌拉圭' }, { id: 1210, name: '圭亚那' }, { id: 1211, name: '苏里南' },
  { id: 1212, name: '法属圭亚那' },
  // 非洲国家
  { id: 1300, name: '南非' }, { id: 1301, name: '埃及' }, { id: 1302, name: '摩洛哥' }, { id: 1303, name: '肯尼亚' },
  { id: 1304, name: '坦桑尼亚' }, { id: 1305, name: '埃塞俄比亚' }, { id: 1306, name: '尼日利亚' }, { id: 1307, name: '加纳' },
  { id: 1308, name: '塞内加尔' }, { id: 1309, name: '突尼斯' }, { id: 1310, name: '阿尔及利亚' }, { id: 1311, name: '利比亚' },
  { id: 1312, name: '苏丹' }, { id: 1313, name: '乌干达' }, { id: 1314, name: '卢旺达' }, { id: 1315, name: '津巴布韦' },
  { id: 1316, name: '赞比亚' }, { id: 1317, name: '博茨瓦纳' }, { id: 1318, name: '纳米比亚' }, { id: 1319, name: '莫桑比克' },
  { id: 1320, name: '马达加斯加' }, { id: 1321, name: '毛里求斯' }, { id: 1322, name: '塞舌尔' }, { id: 1323, name: '喀麦隆' },
  { id: 1324, name: '科特迪瓦' }, { id: 1325, name: '刚果' }, { id: 1326, name: '刚果民主共和国' }, { id: 1327, name: '安哥拉' },
  { id: 1328, name: '马里' }, { id: 1329, name: '尼日尔' }, { id: 1330, name: '乍得' }, { id: 1331, name: '索马里' },
  { id: 1332, name: '厄立特里亚' }, { id: 1333, name: '吉布提' },
];

// POST - 同步世界国家数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // 简单密码验证
    if (password !== 'tobi7758258') {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const client = getSupabaseClient();
    
    // 批量插入，跳过已存在的记录
    const records = worldCountries.map(c => ({
      id: c.id,
      name: c.name,
      type: 'world',
      parent_id: null,
      order_num: c.id,
    }));

    // 分批插入，每批 50 条
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('regions')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })
        .select();

      if (error) {
        console.error('[Sync Countries] Error inserting batch:', error);
        // 尝试逐条插入
        for (const record of batch) {
          const { error: singleError } = await client
            .from('regions')
            .upsert(record, { onConflict: 'id' });
          
          if (singleError) {
            console.error('[Sync Countries] Error inserting single:', record.id, singleError.message);
            skipped++;
          } else {
            inserted++;
          }
        }
      } else {
        inserted += data?.length || 0;
      }
    }

    return NextResponse.json({
      success: true,
      message: `同步完成: 成功 ${inserted} 条, 跳过 ${skipped} 条`,
      total: worldCountries.length,
    });
  } catch (error) {
    console.error('[Sync Countries] Error:', error);
    return NextResponse.json(
      { error: '同步失败' },
      { status: 500 }
    );
  }
}

// GET - 检查同步状态
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('regions')
      .select('id, name')
      .eq('type', 'world');

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    const existingIds = new Set(data?.map(r => r.id) || []);
    const missingCountries = worldCountries.filter(c => !existingIds.has(c.id));

    return NextResponse.json({
      success: true,
      existing: data?.length || 0,
      total: worldCountries.length,
      missing: missingCountries.length,
      missingCountries: missingCountries.slice(0, 10), // 只显示前 10 个缺失的
    });
  } catch (error) {
    console.error('[Sync Countries] Error:', error);
    return NextResponse.json(
      { error: '查询失败' },
      { status: 500 }
    );
  }
}
