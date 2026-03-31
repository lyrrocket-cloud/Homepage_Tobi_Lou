'use client';

import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface WorldMapProps {
  onRegionClick: (regionId: number, regionName: string) => void;
  selectedRegion?: { id: number; name: string } | null;
  visitedRegions?: Set<number>;
  className?: string;
}

// 世界地图数据源
const WORLD_MAP_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// 国家名称到数据库 ID 的映射
// 数据库中世界地图区域的ID规则：
// - 大洲: 8-11 (欧洲、亚洲、北美洲、大洋洲等)
// - 国家: 大洲ID * 100 + 国家序号 (如德国=800, 日本=900, 美国=1000)
const countryNameToId: Record<string, number> = {
  // 欧洲 (大洲ID: 8)
  'Germany': 800, '德国': 800,
  'France': 801, '法国': 801,
  'Italy': 802, '意大利': 802,
  'Switzerland': 803, '瑞士': 803,
  'Austria': 804, '奥地利': 804,
  'United Kingdom': 805, '英国': 805, 'UK': 805,
  'England': 805, '英格兰': 805,
  'Scotland': 805, '苏格兰': 805,
  'Spain': 806, '西班牙': 806,
  'Portugal': 807, '葡萄牙': 807,
  'Netherlands': 808, '荷兰': 808,
  'Belgium': 809, '比利时': 809,
  'Greece': 810, '希腊': 810,
  'Sweden': 811, '瑞典': 811,
  'Norway': 812, '挪威': 812,
  'Denmark': 813, '丹麦': 813,
  'Finland': 814, '芬兰': 814,
  'Ireland': 815, '爱尔兰': 815,
  'Poland': 816, '波兰': 816,
  'Czech Republic': 817, '捷克': 817, 'Czechia': 817,
  'Hungary': 818, '匈牙利': 818,
  'Iceland': 819, '冰岛': 819,
  'Russia': 820, '俄罗斯': 820,
  'Turkey': 821, '土耳其': 821,
  'Ukraine': 822, '乌克兰': 822,
  'Croatia': 823, '克罗地亚': 823,
  'Romania': 824, '罗马尼亚': 824,
  'Bulgaria': 825, '保加利亚': 825,
  'Serbia': 826, '塞尔维亚': 826,
  'Slovakia': 827, '斯洛伐克': 827,
  'Slovenia': 828, '斯洛文尼亚': 828,
  'Luxembourg': 829, '卢森堡': 829,
  'Malta': 830, '马耳他': 830,
  'Cyprus': 831, '塞浦路斯': 831,
  'Estonia': 832, '爱沙尼亚': 832,
  'Latvia': 833, '拉脱维亚': 833,
  'Lithuania': 834, '立陶宛': 834,
  'Monaco': 835, '摩纳哥': 835,
  'Vatican': 836, '梵蒂冈': 836, 'Vatican City': 836,
  'San Marino': 837, '圣马力诺': 837,
  'Liechtenstein': 838, '列支敦士登': 838,
  'Andorra': 839, '安道尔': 839,
  'North Macedonia': 840, '北马其顿': 840,
  'Albania': 841, '阿尔巴尼亚': 841,
  'Montenegro': 842, '黑山': 842,
  'Bosnia and Herz.': 843, '波黑': 843, 'Bosnia and Herzegovina': 843,
  'Moldova': 844, '摩尔多瓦': 844,
  'Belarus': 845, '白俄罗斯': 845,
  'Georgia': 846, '格鲁吉亚': 846,
  'Armenia': 847, '亚美尼亚': 847,
  'Azerbaijan': 848, '阿塞拜疆': 848,
  'Kazakhstan': 849, '哈萨克斯坦': 849,

  // 亚洲 (大洲ID: 9)
  'Japan': 900, '日本': 900,
  'South Korea': 901, '韩国': 901, 'Korea': 901, 'Republic of Korea': 901,
  'North Korea': 902, '朝鲜': 902,
  'Thailand': 903, '泰国': 903,
  'Singapore': 904, '新加坡': 904,
  'Malaysia': 905, '马来西亚': 905,
  'Indonesia': 906, '印度尼西亚': 906,
  'Philippines': 907, '菲律宾': 907,
  'Vietnam': 908, '越南': 908,
  'Cambodia': 909, '柬埔寨': 909,
  'Myanmar': 910, '缅甸': 910,
  'Laos': 911, '老挝': 911,
  'India': 912, '印度': 912,
  'Nepal': 913, '尼泊尔': 913,
  'Bhutan': 914, '不丹': 914,
  'Sri Lanka': 915, '斯里兰卡': 915,
  'Bangladesh': 916, '孟加拉国': 916,
  'Pakistan': 917, '巴基斯坦': 917,
  'Afghanistan': 918, '阿富汗': 918,
  'Iran': 919, '伊朗': 919,
  'Iraq': 920, '伊拉克': 920,
  'Syria': 921, '叙利亚': 921,
  'Jordan': 922, '约旦': 922,
  'Lebanon': 923, '黎巴嫩': 923,
  'Israel': 924, '以色列': 924,
  'Palestine': 925, '巴勒斯坦': 925,
  'Saudi Arabia': 926, '沙特阿拉伯': 926,
  'United Arab Emirates': 927, '阿联酋': 927, 'UAE': 927,
  'Qatar': 928, '卡塔尔': 928,
  'Kuwait': 929, '科威特': 929,
  'Bahrain': 930, '巴林': 930,
  'Oman': 931, '阿曼': 931,
  'Yemen': 932, '也门': 932,
  'Mongolia': 933, '蒙古': 933,
  'Brunei': 934, '文莱': 934,
  'Timor-Leste': 935, '东帝汶': 935,
  'Maldives': 936, '马尔代夫': 936,
  'Uzbekistan': 937, '乌兹别克斯坦': 937,
  'Turkmenistan': 938, '土库曼斯坦': 938,
  'Tajikistan': 939, '塔吉克斯坦': 939,
  'Kyrgyzstan': 940, '吉尔吉斯斯坦': 940,
  'China': 100, '中国': 100, // 中国在数据库中属于 china 类型

  // 北美洲 (大洲ID: 10)
  'United States': 1000, '美国': 1000, 'USA': 1000, 'United States of America': 1000,
  'Canada': 1001, '加拿大': 1001,
  'Mexico': 1002, '墨西哥': 1002,
  'Cuba': 1003, '古巴': 1003,
  'Jamaica': 1004, '牙买加': 1004,
  'Bahamas': 1005, '巴哈马': 1005,
  'Dominican Rep.': 1006, '多米尼加': 1006, 'Dominican Republic': 1006,
  'Haiti': 1007, '海地': 1007,
  'Puerto Rico': 1008, '波多黎各': 1008,
  'Guatemala': 1009, '危地马拉': 1009,
  'Belize': 1010, '伯利兹': 1010,
  'Honduras': 1011, '洪都拉斯': 1011,
  'El Salvador': 1012, '萨尔瓦多': 1012,
  'Nicaragua': 1013, '尼加拉瓜': 1013,
  'Costa Rica': 1014, '哥斯达黎加': 1014,
  'Panama': 1015, '巴拿马': 1015,
  'Trinidad and Tobago': 1016, '特立尼达和多巴哥': 1016,
  'Barbados': 1017, '巴巴多斯': 1017,
  'Greenland': 1018, '格陵兰': 1018,

  // 大洋洲 (大洲ID: 11)
  'Australia': 1100, '澳大利亚': 1100,
  'New Zealand': 1101, '新西兰': 1101,
  'Fiji': 1102, '斐济': 1102,
  'Papua New Guinea': 1103, '巴布亚新几内亚': 1103,
  'Solomon Is.': 1104, '所罗门群岛': 1104, 'Solomon Islands': 1104,
  'Vanuatu': 1105, '瓦努阿图': 1105,
  'Samoa': 1106, '萨摩亚': 1106,
  'Tonga': 1107, '汤加': 1107,
  'Micronesia': 1108, '密克罗尼西亚': 1108,
  'Kiribati': 1109, '基里巴斯': 1109,
  'Marshall Islands': 1110, '马绍尔群岛': 1110,
  'Palau': 1111, '帕劳': 1111,
  'Nauru': 1112, '瑙鲁': 1112,
  'Tuvalu': 1113, '图瓦卢': 1113,

  // 南美洲 (预留大洲ID: 12)
  'Brazil': 1200, '巴西': 1200,
  'Argentina': 1201, '阿根廷': 1201,
  'Chile': 1202, '智利': 1202,
  'Colombia': 1203, '哥伦比亚': 1203,
  'Peru': 1204, '秘鲁': 1204,
  'Venezuela': 1205, '委内瑞拉': 1205,
  'Ecuador': 1206, '厄瓜多尔': 1206,
  'Bolivia': 1207, '玻利维亚': 1207,
  'Paraguay': 1208, '巴拉圭': 1208,
  'Uruguay': 1209, '乌拉圭': 1209,
  'Guyana': 1210, '圭亚那': 1210,
  'Suriname': 1211, '苏里南': 1211,
  'French Guiana': 1212, '法属圭亚那': 1212,

  // 非洲 (预留大洲ID: 13)
  'South Africa': 1300, '南非': 1300,
  'Egypt': 1301, '埃及': 1301,
  'Morocco': 1302, '摩洛哥': 1302,
  'Kenya': 1303, '肯尼亚': 1303,
  'Tanzania': 1304, '坦桑尼亚': 1304,
  'Ethiopia': 1305, '埃塞俄比亚': 1305,
  'Nigeria': 1306, '尼日利亚': 1306,
  'Ghana': 1307, '加纳': 1307,
  'Senegal': 1308, '塞内加尔': 1308,
  'Tunisia': 1309, '突尼斯': 1309,
  'Algeria': 1310, '阿尔及利亚': 1310,
  'Libya': 1311, '利比亚': 1311,
  'Sudan': 1312, '苏丹': 1312,
  'Uganda': 1313, '乌干达': 1313,
  'Rwanda': 1314, '卢旺达': 1314,
  'Zimbabwe': 1315, '津巴布韦': 1315,
  'Zambia': 1316, '赞比亚': 1316,
  'Botswana': 1317, '博茨瓦纳': 1317,
  'Namibia': 1318, '纳米比亚': 1318,
  'Mozambique': 1319, '莫桑比克': 1319,
  'Madagascar': 1320, '马达加斯加': 1320,
  'Mauritius': 1321, '毛里求斯': 1321,
  'Seychelles': 1322, '塞舌尔': 1322,
  'Cameroon': 1323, '喀麦隆': 1323,
  'Côte d\'Ivoire': 1324, '科特迪瓦': 1324, 'Ivory Coast': 1324,
  'Congo': 1325, '刚果': 1325,
  'Dem. Rep. Congo': 1326, '刚果民主共和国': 1326, 'Democratic Republic of the Congo': 1326,
  'Angola': 1327, '安哥拉': 1327,
  'Mali': 1328, '马里': 1328,
  'Niger': 1329, '尼日尔': 1329,
  'Chad': 1330, '乍得': 1330,
  'Somalia': 1331, '索马里': 1331,
  'Eritrea': 1332, '厄立特里亚': 1332,
  'Djibouti': 1333, '吉布提': 1333,
};

export function WorldMap({ onRegionClick, selectedRegion, visitedRegions = new Set(), className = '' }: WorldMapProps) {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(WORLD_MAP_URL);
        if (!response.ok) throw new Error('Failed to fetch map data');
        const data = await response.json();
        setMapData(data);
        setLoading(false);
      } catch (err) {
        setError('无法加载地图数据');
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  const getCountryName = (geo: any): string => {
    return geo.properties?.ADMIN ||
           geo.properties?.name ||
           geo.properties?.NAME ||
           geo.properties?.country ||
           '';
  };

  const getRegionId = (geo: any): number => {
    const name = getCountryName(geo);
    return countryNameToId[name] || 0;
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const name = getCountryName(geo);
    const regionId = getRegionId(geo);
    const isVisited = visitedRegions.has(regionId);

    if (name) {
      setTooltip({
        show: true,
        content: `${name}${isVisited ? ' ✓' : ''}`,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  const handleClick = (geo: any) => {
    const name = getCountryName(geo);
    const regionId = getRegionId(geo);
    if (regionId > 0 && name) {
      onRegionClick(regionId, name);
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-[300px] md:h-[400px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#CEA472] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载世界地图中...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className={`w-full h-[300px] md:h-[400px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-white/60 mb-4">{error || '地图数据加载失败'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f] rounded-lg font-semibold"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[300px] md:h-[400px] bg-black/40 backdrop-blur-md rounded-lg border border-[#CEA472]/20 overflow-hidden select-none ${className}`}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 170,
          center: [0, 0],
        }}
        className="w-full h-full"
      >
        <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionId = getRegionId(geo);
                const isVisited = visitedRegions.has(regionId);
                const isSelected = selectedRegion?.id === regionId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(geo)}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isVisited ? '#CEA472' : isSelected ? '#CEA472' : 'rgba(255, 255, 255, 0.1)',
                        fillOpacity: isVisited ? 0.9 : isSelected ? 0.8 : 0.3,
                        stroke: '#CEA472',
                        strokeWidth: regionId > 0 ? 0.3 : 0.1,
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        cursor: regionId > 0 ? 'pointer' : 'default',
                      },
                      hover: {
                        fill: '#CEA472',
                        fillOpacity: regionId > 0 ? 0.9 : 0.5,
                        stroke: '#CEA472',
                        strokeWidth: regionId > 0 ? 0.8 : 0.3,
                        outline: 'none',
                        cursor: regionId > 0 ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#CEA472',
                        fillOpacity: 1,
                        stroke: '#CEA472',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: regionId > 0 ? 'pointer' : 'default',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed pointer-events-none bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 border border-[#CEA472]/30"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            transform: 'translateY(-100%)',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
