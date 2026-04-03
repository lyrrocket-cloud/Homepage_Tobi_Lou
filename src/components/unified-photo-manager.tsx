'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Globe,
  Lock,
  Settings,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';

// 照片类型
interface GalleryPhoto {
  id: number;
  title: string;
  region_id: number;
  date: string;
  year: number;
  image_key: string;
  image_url: string;
  url?: string;
  category: string;
  is_yearly?: boolean;
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// 地区类型定义
interface Region {
  id: number;
  name: string;
  type: string;
  parentId: number | null;
}

// 国家分组
interface CountryGroup {
  continent: string;
  countries: { id: number; name: string }[];
}

// 国家数据
const countryGroups: CountryGroup[] = [
  {
    continent: '欧洲',
    countries: [
      { id: 800, name: '德国' }, { id: 801, name: '法国' }, { id: 802, name: '意大利' },
      { id: 803, name: '瑞士' }, { id: 804, name: '奥地利' }, { id: 805, name: '英国' },
      { id: 806, name: '西班牙' }, { id: 807, name: '葡萄牙' }, { id: 808, name: '荷兰' },
      { id: 809, name: '比利时' }, { id: 810, name: '希腊' }, { id: 811, name: '瑞典' },
      { id: 812, name: '挪威' }, { id: 813, name: '丹麦' }, { id: 814, name: '芬兰' },
      { id: 815, name: '爱尔兰' }, { id: 816, name: '波兰' }, { id: 817, name: '捷克' },
      { id: 818, name: '匈牙利' }, { id: 819, name: '冰岛' }, { id: 820, name: '俄罗斯' },
      { id: 821, name: '土耳其' }, { id: 822, name: '乌克兰' }, { id: 823, name: '克罗地亚' },
      { id: 824, name: '罗马尼亚' }, { id: 825, name: '保加利亚' }, { id: 826, name: '塞尔维亚' },
      { id: 827, name: '斯洛伐克' }, { id: 828, name: '斯洛文尼亚' }, { id: 829, name: '卢森堡' },
      { id: 830, name: '马耳他' }, { id: 831, name: '塞浦路斯' }, { id: 832, name: '爱沙尼亚' },
      { id: 833, name: '拉脱维亚' }, { id: 834, name: '立陶宛' }, { id: 835, name: '摩纳哥' },
      { id: 836, name: '梵蒂冈' }, { id: 837, name: '圣马力诺' }, { id: 838, name: '列支敦士登' },
      { id: 839, name: '安道尔' }, { id: 840, name: '北马其顿' }, { id: 841, name: '阿尔巴尼亚' },
      { id: 842, name: '黑山' }, { id: 843, name: '波黑' }, { id: 844, name: '摩尔多瓦' },
      { id: 845, name: '白俄罗斯' }, { id: 846, name: '格鲁吉亚' }, { id: 847, name: '亚美尼亚' },
      { id: 848, name: '阿塞拜疆' }, { id: 849, name: '哈萨克斯坦' },
    ],
  },
  {
    continent: '亚洲',
    countries: [
      { id: 900, name: '日本' }, { id: 901, name: '韩国' }, { id: 902, name: '朝鲜' },
      { id: 903, name: '泰国' }, { id: 904, name: '新加坡' }, { id: 905, name: '马来西亚' },
      { id: 906, name: '印度尼西亚' }, { id: 907, name: '菲律宾' }, { id: 908, name: '越南' },
      { id: 909, name: '柬埔寨' }, { id: 910, name: '缅甸' }, { id: 911, name: '老挝' },
      { id: 912, name: '印度' }, { id: 913, name: '尼泊尔' }, { id: 914, name: '不丹' },
      { id: 915, name: '斯里兰卡' }, { id: 916, name: '孟加拉国' }, { id: 917, name: '巴基斯坦' },
      { id: 918, name: '阿富汗' }, { id: 919, name: '伊朗' }, { id: 920, name: '伊拉克' },
      { id: 921, name: '叙利亚' }, { id: 922, name: '约旦' }, { id: 923, name: '黎巴嫩' },
      { id: 924, name: '以色列' }, { id: 925, name: '巴勒斯坦' }, { id: 926, name: '沙特阿拉伯' },
      { id: 927, name: '阿联酋' }, { id: 928, name: '卡塔尔' }, { id: 929, name: '科威特' },
      { id: 930, name: '巴林' }, { id: 931, name: '阿曼' }, { id: 932, name: '也门' },
      { id: 933, name: '蒙古' }, { id: 934, name: '文莱' }, { id: 935, name: '东帝汶' },
      { id: 936, name: '马尔代夫' }, { id: 937, name: '乌兹别克斯坦' }, { id: 938, name: '土库曼斯坦' },
      { id: 939, name: '塔吉克斯坦' }, { id: 940, name: '吉尔吉斯斯坦' },
    ],
  },
  {
    continent: '北美洲',
    countries: [
      { id: 1000, name: '美国' }, { id: 1001, name: '加拿大' }, { id: 1002, name: '墨西哥' },
      { id: 1003, name: '古巴' }, { id: 1004, name: '牙买加' }, { id: 1005, name: '巴哈马' },
      { id: 1006, name: '多米尼加' }, { id: 1007, name: '海地' }, { id: 1008, name: '波多黎各' },
      { id: 1009, name: '危地马拉' }, { id: 1010, name: '伯利兹' }, { id: 1011, name: '洪都拉斯' },
      { id: 1012, name: '萨尔瓦多' }, { id: 1013, name: '尼加拉瓜' }, { id: 1014, name: '哥斯达黎加' },
      { id: 1015, name: '巴拿马' }, { id: 1016, name: '特立尼达和多巴哥' }, { id: 1017, name: '巴巴多斯' },
      { id: 1018, name: '格陵兰' },
    ],
  },
  {
    continent: '大洋洲',
    countries: [
      { id: 1100, name: '澳大利亚' }, { id: 1101, name: '新西兰' }, { id: 1102, name: '斐济' },
      { id: 1103, name: '巴布亚新几内亚' }, { id: 1104, name: '所罗门群岛' }, { id: 1105, name: '瓦努阿图' },
      { id: 1106, name: '萨摩亚' }, { id: 1107, name: '汤加' }, { id: 1108, name: '密克罗尼西亚' },
      { id: 1109, name: '基里巴斯' }, { id: 1110, name: '马绍尔群岛' }, { id: 1111, name: '帕劳' },
      { id: 1112, name: '瑙鲁' }, { id: 1113, name: '图瓦卢' },
    ],
  },
  {
    continent: '南美洲',
    countries: [
      { id: 1200, name: '巴西' }, { id: 1201, name: '阿根廷' }, { id: 1202, name: '智利' },
      { id: 1203, name: '哥伦比亚' }, { id: 1204, name: '秘鲁' }, { id: 1205, name: '委内瑞拉' },
      { id: 1206, name: '厄瓜多尔' }, { id: 1207, name: '玻利维亚' }, { id: 1208, name: '巴拉圭' },
      { id: 1209, name: '乌拉圭' }, { id: 1210, name: '圭亚那' }, { id: 1211, name: '苏里南' },
      { id: 1212, name: '法属圭亚那' },
    ],
  },
  {
    continent: '非洲',
    countries: [
      { id: 1300, name: '南非' }, { id: 1301, name: '埃及' }, { id: 1302, name: '摩洛哥' },
      { id: 1303, name: '肯尼亚' }, { id: 1304, name: '坦桑尼亚' }, { id: 1305, name: '埃塞俄比亚' },
      { id: 1306, name: '尼日利亚' }, { id: 1307, name: '加纳' }, { id: 1308, name: '塞内加尔' },
      { id: 1309, name: '突尼斯' }, { id: 1310, name: '阿尔及利亚' }, { id: 1311, name: '利比亚' },
      { id: 1312, name: '苏丹' }, { id: 1313, name: '乌干达' }, { id: 1314, name: '卢旺达' },
      { id: 1315, name: '津巴布韦' }, { id: 1316, name: '赞比亚' }, { id: 1317, name: '博茨瓦纳' },
      { id: 1318, name: '纳米比亚' }, { id: 1319, name: '莫桑比克' }, { id: 1320, name: '马达加斯加' },
      { id: 1321, name: '毛里求斯' }, { id: 1322, name: '塞舌尔' }, { id: 1323, name: '喀麦隆' },
      { id: 1324, name: '科特迪瓦' }, { id: 1325, name: '刚果' }, { id: 1326, name: '刚果民主共和国' },
      { id: 1327, name: '安哥拉' }, { id: 1328, name: '马里' }, { id: 1329, name: '尼日尔' },
      { id: 1330, name: '乍得' }, { id: 1331, name: '索马里' }, { id: 1332, name: '厄立特里亚' },
      { id: 1333, name: '吉布提' },
    ],
  },
];

// 分类列表
const categories = [
  { id: 'friend', name: '朋友' },
  { id: 'family', name: '家庭' },
  { id: 'work', name: '工作' },
  { id: 'personal', name: '个人' },
];

interface UnifiedPhotoManagerProps {
  onPhotoAdded?: () => void;
}

export function UnifiedPhotoManager({ onPhotoAdded }: UnifiedPhotoManagerProps) {
  // 基础状态
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // 标签切换：'world' | 'china'
  const [activeTab, setActiveTab] = useState<'world' | 'china'>('china');
  
  // 年度筛选
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  
  // 排序方式：'desc' 降序（最新在前）| 'asc' 升序（最旧在前）
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // 数据
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 添加/编辑弹窗
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 新照片表单
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    regionId: null as number | null,
    yearMonth: '',
    isYearly: false, // 是否为年度相册
    image: '',
    imageKey: '',
    url: '',
    categories: [] as string[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // 加载数据
  const loadRegions = async () => {
    try {
      const response = await fetch('/api/regions?type=china');
      const data = await response.json();
      if (data.success && data.data) {
        const provinces = data.data.filter((r: Region) => !r.parentId);
        setRegions(provinces);
      }
    } catch (error) {
      console.error('加载地区失败:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();
      if (result.photos) {
        setPhotos(result.photos);
      }
    } catch (error) {
      console.error('加载照片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    if (isManageOpen) {
      loadRegions();
      loadPhotos();
    }
  }, [isManageOpen]);

  // 获取所有年份（从照片数据中提取）
  const availableYears = Array.from(new Set(photos.map(p => p.year))).sort((a, b) => b - a);
  
  // 获取当前标签的照片（带年度筛选和排序）
  const currentPhotos = (() => {
    let filtered = activeTab === 'world' 
      ? photos.filter(p => p.region?.type === 'world')
      : photos.filter(p => p.region?.type === 'china');
    
    // 年度筛选
    if (filterYear !== 'all') {
      filtered = filtered.filter(p => p.year === filterYear);
    }
    
    // 排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  })();

  // 打开管理界面
  const handleOpen = () => {
    setIsPasswordOpen(true);
    setPassword('');
    setPasswordError(false);
  };

  // 验证密码
  const handlePasswordSubmit = () => {
    if (password === 'tobi7758258') {
      setIsPasswordOpen(false);
      setIsManageOpen(true);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // 关闭管理界面
  const handleClose = () => {
    setIsManageOpen(false);
    setIsAddPhotoOpen(false);
    setIsEditPhotoOpen(false);
    setEditingPhoto(null);
    resetForm();
  };

  // 重置表单
  const resetForm = () => {
    setNewPhoto({
      title: '',
      regionId: null,
      yearMonth: '',
      isYearly: false,
      image: '',
      imageKey: '',
      url: '',
      categories: [],
    });
  };

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', 'tobi7758258');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        if (isEdit && editingPhoto) {
          setEditingPhoto({ ...editingPhoto, image_url: result.data.url, image_key: result.data.key });
        } else {
          setNewPhoto(prev => ({ ...prev, image: result.data.url, imageKey: result.data.key }));
        }
      } else {
        alert('上传失败: ' + result.error);
      }
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 添加照片
  const handleAddPhoto = async () => {
    // 年度相册时只需要年份，月份照片需要年月
    if (!newPhoto.title || !newPhoto.regionId || !newPhoto.image) return;
    if (!newPhoto.isYearly && !newPhoto.yearMonth) return;
    if (newPhoto.isYearly && !newPhoto.yearMonth) return; // 年度相册也需要年份
    if (activeTab === 'china' && newPhoto.categories.length === 0) return;

    setSaving(true);

    try {
      const yearValue = newPhoto.yearMonth.split('-')[0];
      const year = parseInt(isSpecialYear(yearValue) ? yearValue : yearValue);
      const categoryString = newPhoto.categories.length > 0 ? newPhoto.categories.join(',') : (activeTab === 'world' ? 'world' : '');
      // 年度相册的 date 存储：特殊年份转换为数据库格式，普通年份存储为 "YYYY-00"
      const dbYearValue = newPhoto.isYearly ? convertToDbFormat(yearValue) : yearValue;
      const date = newPhoto.isYearly ? `${dbYearValue}-00` : newPhoto.yearMonth;

      const response = await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPhoto.title,
          regionId: newPhoto.regionId,
          date,
          year,
          imageKey: newPhoto.imageKey,
          imageUrl: newPhoto.image,
          url: newPhoto.url || null,
          category: categoryString,
          isYearly: newPhoto.isYearly,
        }),
      });

      const result = await response.json();
      if (result.photo) {
        await loadPhotos();
        resetForm();
        setIsAddPhotoOpen(false);
        if (onPhotoAdded) onPhotoAdded();
      } else {
        alert(result.error || '添加失败');
      }
    } catch (error) {
      console.error('添加照片失败:', error);
      alert('添加照片失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 打开编辑弹窗
  const handleOpenEdit = (photo: GalleryPhoto) => {
    setEditingPhoto({ ...photo });
    setIsEditPhotoOpen(true);
  };

  // 更新照片
  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    setSaving(true);

    try {
      const yearValue = editingPhoto.date.split('-')[0];
      // 如果是特殊年份格式（如 2001A），需要提取数字部分作为 year
      const frontendValue = convertToFrontendFormat(editingPhoto.date);
      const isSpecial = isSpecialYear(frontendValue);
      const year = parseInt(isSpecial ? frontendValue.match(/\d+/)?.[0] || yearValue : yearValue);

      const response = await fetch('/api/gallery/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPhoto.id,
          title: editingPhoto.title,
          regionId: editingPhoto.region_id,
          date: editingPhoto.date,
          year,
          imageKey: editingPhoto.image_key,
          imageUrl: editingPhoto.image_url,
          url: editingPhoto.url || null,
          category: editingPhoto.category,
          isYearly: editingPhoto.is_yearly || false,
        }),
      });

      if (response.ok) {
        await loadPhotos();
        setIsEditPhotoOpen(false);
        setEditingPhoto(null);
        if (onPhotoAdded) onPhotoAdded();
      } else {
        alert('更新失败');
      }
    } catch (error) {
      console.error('更新照片失败:', error);
      alert('更新照片失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 删除照片
  const handleDeletePhoto = async (id: number) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const response = await fetch(`/api/gallery/photos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadPhotos();
        if (onPhotoAdded) onPhotoAdded();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      alert('删除照片失败');
    }
  };

  // 切换分类标签
  const togglePhotoCategory = (categoryId: string) => {
    setNewPhoto(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  // 特殊年份映射（前端显示 → 后端存储）
  const SPECIAL_YEAR_MAP: Record<string, string> = {
    '2001-2010': '2001A',
    '1991-2000': '1991B',
    '-1990': '1990C',
  };

  // 反向映射（后端存储 → 前端显示）
  const REVERSE_SPECIAL_YEAR_MAP: Record<string, string> = {
    '2001A': '2001-2010',
    '1991B': '1991-2000',
    '1990C': '-1990',
  };

  // 检查是否是特殊年份
  const isSpecialYear = (value: string): boolean => {
    return Object.keys(SPECIAL_YEAR_MAP).includes(value);
  };

  // 将前端特殊年份转换为后端存储格式
  const convertToDbFormat = (yearValue: string): string => {
    return SPECIAL_YEAR_MAP[yearValue] || yearValue;
  };

  // 将后端存储格式转换为前端显示
  const convertToFrontendFormat = (dateStr: string): string => {
    const [year, month] = dateStr.split('-');
    // 检查是否是特殊年份存储格式
    if (REVERSE_SPECIAL_YEAR_MAP[year]) {
      return REVERSE_SPECIAL_YEAR_MAP[year];
    }
    return year;
  };

  // 格式化日期
  const formatDate = (dateStr: string, isYearly?: boolean) => {
    const [year, month] = dateStr.split('-');
    // 检查是否是特殊年份存储格式
    if (year === '2001A') return '2001-2010年';
    if (year === '1991B') return '1991-2000年';
    if (year === '1990C') return '1990及以前';
    // 年度相册或月份为00时只显示年份
    if (isYearly || month === '00') {
      return `${year}年`;
    }
    return `${year}年${month}月`;
  };

  // 从日期中提取年份或特殊年份标识
  const getYearFromDate = (dateStr?: string) => {
    if (!dateStr) return '';
    // 检查是否是特殊年份存储格式
    if (dateStr.startsWith('2001A-00')) return '2001-2010';
    if (dateStr.startsWith('1991B-00')) return '1991-2000';
    if (dateStr.startsWith('1990C-00')) return '-1990';
    // 单一年份，提取第一部分
    return dateStr.split('-')[0];
  };
  const getRegionName = (photo: GalleryPhoto) => {
    return photo.region?.name || '未知地点';
  };

  // 获取国家名称
  const getCountryName = (countryId: number): string => {
    for (const group of countryGroups) {
      const country = group.countries.find(c => c.id === countryId);
      if (country) return country.name;
    }
    return '未知国家';
  };

  return (
    <>
      {/* 管理按钮 */}
      <Button
        onClick={handleOpen}
        variant="outline"
        size="icon"
        className="bg-black/40 border-[#CEA472]/30 hover:bg-[#CEA472]/20 hover:border-[#CEA472]/50"
      >
        <Settings className="w-4 h-4 text-[#CEA472]" />
      </Button>

      {/* 密码验证弹窗 */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/20 text-white max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#CEA472]">
              <Lock className="w-5 h-5" />
              管理员验证
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-400">请输入管理密码</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="输入密码..."
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
              {passwordError && (
                <p className="text-red-400 text-sm">密码错误，请重试</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handlePasswordSubmit}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                确认
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 管理弹窗 */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="min-w-[1000px] w-[92vw] max-w-[1400px] max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5 text-[#CEA472]" />
                <span>照片管理</span>
              </div>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 标签切换、筛选和添加按钮 */}
            <div className="flex items-center justify-between border-b border-[#CEA472]/20 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('china')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'china'
                      ? 'bg-[#CEA472] text-[#0a0a0f]'
                      : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black/60'
                  }`}
                >
                  中国
                </button>
                <button
                  onClick={() => setActiveTab('world')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'world'
                      ? 'bg-[#CEA472] text-[#0a0a0f]'
                      : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black/60'
                  }`}
                >
                  世界
                </button>
              </div>
              
              {/* 筛选和排序 */}
              <div className="flex items-center gap-4">
                {/* 年度筛选 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">年度：</span>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-3 py-1.5 bg-black/40 border border-[#CEA472]/30 rounded-md text-white text-sm"
                  >
                    <option value="all">全部</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>

                {/* 添加按钮 */}
                <Button
                  onClick={() => { setIsAddPhotoOpen(true); resetForm(); }}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加照片
                </Button>
              </div>
            </div>

            {/* 照片统计 */}
            <div className="text-sm text-gray-400">
              共 {currentPhotos.length} 张照片
              {filterYear !== 'all' && ` (${filterYear}年)`}
            </div>

            {/* 照片列表 - 一行两组 */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-[#CEA472] animate-spin" />
              </div>
            ) : currentPhotos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无{activeTab === 'world' ? '世界地图' : ''}照片</p>
                <p className="text-sm mt-1">点击"添加照片"开始录入</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {currentPhotos.map((photo) => (
                  <div key={photo.id} className="flex gap-4 p-4 bg-black/40 rounded-lg border border-[#CEA472]/10 hover:border-[#CEA472]/30 transition-all">
                    <div className="w-[120px] h-[80px] relative rounded overflow-hidden flex-shrink-0">
                      <Image src={photo.image_url} alt={photo.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-white font-medium truncate">{photo.title}</h4>
                      <p className="text-gray-400 text-sm mt-1 truncate">
                        {getRegionName(photo)} · {formatDate(photo.date, photo.is_yearly)}
                      </p>
                      {photo.category && photo.category !== 'world' && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {photo.category.split(',').map(catId => {
                            const cat = categories.find(c => c.id === catId);
                            return cat ? <span key={catId} className="text-xs text-[#CEA472] px-2 py-0.5 bg-[#CEA472]/10 rounded-full">{cat.name}</span> : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(photo)} className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472] h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePhoto(photo.id)} className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加照片弹窗 */}
      <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white">添加{activeTab === 'world' ? '世界地图' : ''}照片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">照片标题</Label>
              <Input
                value={newPhoto.title}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/40 border-[#CEA472]/30 text-white"
                placeholder="请输入标题"
              />
            </div>

            <div>
              <Label className="text-gray-400">{activeTab === 'world' ? '国家' : '地点'}</Label>
              {activeTab === 'world' ? (
                <select
                  value={newPhoto.regionId || ''}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, regionId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                >
                  <option value="">请选择国家</option>
                  {countryGroups.map((group) => (
                    <optgroup key={group.continent} label={group.continent}>
                      {group.countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <select
                  value={newPhoto.regionId || ''}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, regionId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                >
                  <option value="">请选择地点</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-400">
                  {newPhoto.isYearly ? '年份' : '日期（年-月）'}
                </Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPhoto.isYearly}
                    onChange={(e) => setNewPhoto(prev => ({ 
                      ...prev, 
                      isYearly: e.target.checked,
                      yearMonth: '' // 切换时清空
                    }))}
                    className="w-4 h-4 rounded border-[#CEA472]/30 bg-black/40 text-[#CEA472] focus:ring-[#CEA472]"
                  />
                  <span className="text-sm text-gray-400">年度相册</span>
                </label>
              </div>
              {newPhoto.isYearly ? (
                <select
                  value={newPhoto.yearMonth.includes('-01') ? newPhoto.yearMonth.replace('-01', '') : newPhoto.yearMonth}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, yearMonth: `${e.target.value}-01` }))}
                  className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                >
                  <option value="">请选择年份</option>
                  {/* 单一年份 */}
                  {Array.from({ length: 16 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                  {/* 特殊年份选项 */}
                  <option value="2001-2010">2001-2010</option>
                  <option value="1991-2000">1991-2000</option>
                  <option value="-1990">1990及以前</option>
                </select>
              ) : (
                <Input
                  type="month"
                  value={newPhoto.yearMonth}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, yearMonth: e.target.value }))}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                />
              )}
              {newPhoto.isYearly && (
                <p className="text-xs text-gray-500 mt-1">年度相册将显示在当年照片的最后</p>
              )}
            </div>

            <div>
              <Label className="text-gray-400">分类</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => togglePhotoCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      newPhoto.categories.includes(cat.id)
                        ? 'bg-[#CEA472] text-[#0a0a0f]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-400">照片</Label>
              <div className="mt-2">
                {newPhoto.image ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image src={newPhoto.image} alt="预览" fill className="object-cover" />
                    <button
                      onClick={() => setNewPhoto(prev => ({ ...prev, image: '', imageKey: '' }))}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#CEA472]/30 rounded-lg cursor-pointer hover:border-[#CEA472]/50 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#CEA472]/50" />
                        <span className="text-gray-400 text-sm mt-2">点击上传照片</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-400">链接（可选）</Label>
              <Input
                value={newPhoto.url}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, url: e.target.value }))}
                className="bg-black/40 border-[#CEA472]/30 text-white"
                placeholder="点击照片跳转的链接"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleAddPhoto}
                disabled={saving || !newPhoto.title || !newPhoto.regionId || !newPhoto.yearMonth || !newPhoto.image}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '添加'}
              </Button>
              <Button variant="outline" onClick={() => setIsAddPhotoOpen(false)} className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]">
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑照片弹窗 */}
      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0f] border-[#CEA472]/20">
          <DialogHeader>
            <DialogTitle className="text-white">编辑照片</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">照片标题</Label>
                <Input
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-400">{editingPhoto.region?.type === 'world' ? '国家' : '地点'}</Label>
                {editingPhoto.region?.type === 'world' ? (
                  <select
                    value={editingPhoto.region_id || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, region_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                  >
                    <option value="">请选择国家</option>
                    {countryGroups.map((group) => (
                      <optgroup key={group.continent} label={group.continent}>
                        {group.countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <select
                    value={editingPhoto.region_id || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, region_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                  >
                    <option value="">请选择地点</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-400">
                    {editingPhoto.is_yearly ? '年份' : '日期（年-月）'}
                  </Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPhoto.is_yearly || false}
                      onChange={(e) => {
                        const newIsYearly = e.target.checked;
                        setEditingPhoto({ 
                          ...editingPhoto, 
                          is_yearly: newIsYearly,
                          // 切换为年度相册时，如果日期是 YYYY-MM 格式，转换为 YYYY-00 或特殊年份格式
                          date: newIsYearly && editingPhoto.date ? `${convertToFrontendFormat(editingPhoto.date)}-00` : editingPhoto.date
                        });
                      }}
                      className="w-4 h-4 rounded border-[#CEA472]/30 bg-black/40 text-[#CEA472] focus:ring-[#CEA472]"
                    />
                    <span className="text-sm text-gray-400">年度相册</span>
                  </label>
                </div>
                {editingPhoto.is_yearly ? (
                  <select
                    value={getYearFromDate(editingPhoto.date)}
                    onChange={(e) => {
                      const yearValue = e.target.value;
                      // 将前端特殊年份转换为数据库格式
                      const dbYearValue = convertToDbFormat(yearValue);
                      setEditingPhoto({ ...editingPhoto, date: `${dbYearValue}-00` });
                    }}
                    className="w-full px-3 py-2 bg-black/40 border border-[#CEA472]/30 rounded-md text-white"
                  >
                    <option value="">请选择年份</option>
                    {/* 单一年份 */}
                    {Array.from({ length: 16 }, (_, i) => 2026 - i).map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                    {/* 特殊年份选项 */}
                    <option value="2001-2010">2001-2010</option>
                    <option value="1991-2000">1991-2000</option>
                    <option value="-1990">1990及以前</option>
                  </select>
                ) : (
                  <Input
                    type="month"
                    value={editingPhoto.date?.endsWith('-00') ? '' : editingPhoto.date}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                    className="bg-black/40 border-[#CEA472]/30 text-white"
                  />
                )}
              </div>

              <div>
                <Label className="text-gray-400">分类</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => {
                    const selectedCategories = editingPhoto.category?.split(',') || [];
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          const newCategories = selectedCategories.includes(cat.id)
                            ? selectedCategories.filter(c => c !== cat.id)
                            : [...selectedCategories, cat.id];
                          setEditingPhoto({ ...editingPhoto, category: newCategories.join(',') });
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-[#CEA472] text-[#0a0a0f]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-gray-400">照片</Label>
                <div className="mt-2">
                  {editingPhoto.image_url ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <Image src={editingPhoto.image_url} alt="预览" fill className="object-cover" />
                      <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-[#CEA472]" />
                            <span className="text-[#CEA472] text-sm">点击更换照片</span>
                          </>
                        )}
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#CEA472]/30 rounded-lg cursor-pointer hover:border-[#CEA472]/50 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#CEA472]/50" />
                          <span className="text-gray-400 text-sm mt-2">点击上传照片</span>
                        </>
                      )}
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-gray-400">链接（可选）</Label>
                <Input
                  value={editingPhoto.url || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                  className="bg-black/40 border-[#CEA472]/30 text-white"
                  placeholder="点击照片跳转的链接"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleUpdatePhoto}
                  disabled={saving}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditPhotoOpen(false)} className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10 hover:text-[#CEA472]">
                  取消
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
