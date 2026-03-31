'use client';

import { useState, useEffect, useRef } from 'react';
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
  Save,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
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
  region?: {
    id: number;
    name: string;
    type: string;
  };
}

// 国家分组
interface CountryGroup {
  continent: string;
  countries: { id: number; name: string }[];
}

// 国家数据（从 world-map.tsx 同步）
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

interface WorldPhotoManagerProps {
  onPhotoAdded?: () => void;
}

export function WorldPhotoManager({ onPhotoAdded }: WorldPhotoManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 照片列表
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  
  // 编辑状态
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // 表单数据
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [url, setUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取照片列表
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery/photos');
      const result = await response.json();
      if (result.photos) {
        // 只获取世界地图类型的照片
        const worldPhotos = result.photos.filter(
          (photo: GalleryPhoto) => photo.region?.type === 'world'
        );
        setPhotos(worldPhotos);
      }
    } catch (err) {
      console.error('[WorldPhotoManager] Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  // 打开管理界面
  const handleOpen = () => {
    setIsPasswordDialogOpen(true);
    setPassword('');
    setPasswordError('');
  };

  // 验证密码
  const handleVerifyPassword = () => {
    if (password === 'tobi7758258') {
      setIsPasswordDialogOpen(false);
      setIsOpen(true);
      setPassword('');
      setPasswordError('');
      fetchPhotos();
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  // 关闭管理界面
  const handleClose = () => {
    setIsOpen(false);
    setEditingPhoto(null);
    setIsAddMode(false);
    resetForm();
  };

  // 重置表单
  const resetForm = () => {
    setSelectedCountry(null);
    setTitle('');
    setDate('');
    setImageFile(null);
    setImagePreview('');
    setUrl('');
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 上传图片到对象存储
  const uploadImage = async (file: File): Promise<{ key: string; url: string } | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', 'tobi7758258');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return { key: result.data.key, url: result.data.url };
      }
      return null;
    } catch (err) {
      console.error('[WorldPhotoManager] Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 添加照片
  const handleAdd = async () => {
    if (!selectedCountry || !date || !imageFile) {
      alert('请填写所有必填字段并上传图片');
      return;
    }

    setLoading(true);

    try {
      // 上传图片
      const uploadResult = await uploadImage(imageFile);
      if (!uploadResult) {
        alert('图片上传失败');
        setLoading(false);
        return;
      }

      // 解析日期
      const [year] = date.split('-');
      const countryName = getCountryName(selectedCountry);

      // 保存到数据库
      const response = await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || countryName,
          regionId: selectedCountry,
          date,
          year: parseInt(year),
          imageKey: uploadResult.key,
          imageUrl: uploadResult.url,
          url: url || null,
          category: 'world',
        }),
      });

      const result = await response.json();
      if (result.photo) {
        fetchPhotos();
        setIsAddMode(false);
        resetForm();
        if (onPhotoAdded) onPhotoAdded();
        alert('添加成功！');
      } else {
        alert(result.error || '保存失败');
      }
    } catch (err) {
      console.error('[WorldPhotoManager] Add error:', err);
      alert('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 编辑照片
  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setSelectedCountry(photo.region_id);
    setTitle(photo.title);
    setDate(photo.date);
    setImagePreview(photo.image_url);
    setUrl(photo.url || '');
    setIsAddMode(false);
  };

  // 更新照片
  const handleUpdate = async () => {
    if (!editingPhoto || !selectedCountry || !date) {
      alert('请填写所有必填字段');
      return;
    }

    setLoading(true);

    try {
      let imageKey = editingPhoto.image_key;
      let imageUrl = editingPhoto.image_url;

      // 如果有新图片，上传
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        if (uploadResult) {
          imageKey = uploadResult.key;
          imageUrl = uploadResult.url;
        }
      }

      const [year] = date.split('-');

      const response = await fetch('/api/gallery/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPhoto.id,
          title: title || getCountryName(selectedCountry),
          regionId: selectedCountry,
          date,
          year: parseInt(year),
          imageKey,
          imageUrl,
          url: url || null,
          category: 'world',
        }),
      });

      const result = await response.json();
      if (result.photo) {
        fetchPhotos();
        setEditingPhoto(null);
        resetForm();
        if (onPhotoAdded) onPhotoAdded();
        alert('更新成功！');
      } else {
        alert(result.error || '更新失败');
      }
    } catch (err) {
      console.error('[WorldPhotoManager] Update error:', err);
      alert('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除照片
  const handleDelete = async (photoId: number) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/photos?id=${photoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        fetchPhotos();
        if (onPhotoAdded) onPhotoAdded();
      }
    } catch (err) {
      console.error('[WorldPhotoManager] Delete error:', err);
    } finally {
      setLoading(false);
    }
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
        <Globe className="w-4 h-4 text-[#CEA472]" />
      </Button>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        id="world-photo-upload"
      />

      {/* 密码验证弹窗 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#CEA472]">
              <Lock className="w-5 h-5" />
              管理员验证
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="world-password" className="text-[#FFFFFF]/80">
                请输入管理密码
              </Label>
              <Input
                id="world-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                placeholder="输入密码..."
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
              >
                取消
              </Button>
              <Button
                onClick={handleVerifyPassword}
                className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 管理界面 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-[#CEA472]">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                世界地图照片管理
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => { setIsAddMode(true); resetForm(); }}
                  className="bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加照片
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-[#FFFFFF]/60 text-sm">
              管理世界地图打卡照片，点击照片卡片编辑或删除
            </p>

            {loading && photos.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
              </div>
            ) : photos.length === 0 && !isAddMode ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#FFFFFF]/50">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>暂无照片</p>
                <p className="text-sm mt-1">点击"添加照片"开始录入</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-black/40 border border-[#CEA472]/20 rounded-lg overflow-hidden hover:border-[#CEA472]/40 transition-all"
                  >
                    {/* 图片预览 */}
                    <div className="relative aspect-video">
                      {photo.image_url ? (
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black/60 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-[#CEA472]/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleEdit(photo)}
                          variant="outline"
                          size="sm"
                          className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          onClick={() => handleDelete(photo.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* 信息 */}
                    <div className="p-4">
                      <h4 className="font-bold text-[#FFFFFF] truncate">{photo.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-[#FFFFFF]/60 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#CEA472]" />
                          {photo.region?.name || getCountryName(photo.region_id)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#CEA472]" />
                          {photo.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加照片弹窗 */}
      <Dialog open={isAddMode} onOpenChange={setIsAddMode}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-[#CEA472]">添加世界地图照片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 图片上传 */}
            <div className="space-y-2">
              <Label className="text-[#FFFFFF]/80">照片 *</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-video rounded-lg border-2 border-dashed border-[#CEA472]/30 hover:border-[#CEA472]/50 cursor-pointer overflow-hidden transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#CEA472]" />
                        <span className="text-[#CEA472] text-sm">点击上传照片</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>

            {/* 国家选择 */}
            <div className="space-y-2">
              <Label className="text-[#FFFFFF]/80">国家 *</Label>
              <select
                value={selectedCountry || ''}
                onChange={(e) => setSelectedCountry(parseInt(e.target.value))}
                className="w-full p-2 bg-black/50 border border-[#CEA472]/20 rounded text-[#FFFFFF] focus:border-[#CEA472] outline-none"
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
            </div>

            {/* 标题 */}
            <div className="space-y-2">
              <Label className="text-[#FFFFFF]/80">标题（可选）</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="留空则使用国家名称"
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
            </div>

            {/* 日期 */}
            <div className="space-y-2">
              <Label className="text-[#FFFFFF]/80">日期 *</Label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="例如：2025-01"
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
            </div>

            {/* 外部链接 */}
            <div className="space-y-2">
              <Label className="text-[#FFFFFF]/80">外部链接（可选）</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAdd}
                disabled={loading || uploading}
                className="flex-1 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '确认添加'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsAddMode(false); resetForm(); }}
                className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑照片弹窗 */}
      <Dialog open={!!editingPhoto} onOpenChange={() => { setEditingPhoto(null); resetForm(); }}>
        <DialogContent className="bg-[#0a0a0f] border-[#CEA472]/30 text-white max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-[#CEA472]">编辑世界地图照片</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4 py-4">
              {/* 图片上传 */}
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">照片</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-video rounded-lg border-2 border-dashed border-[#CEA472]/30 hover:border-[#CEA472]/50 cursor-pointer overflow-hidden transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-[#CEA472] animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#CEA472]" />
                          <span className="text-[#CEA472] text-sm">点击更换照片</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>

              {/* 国家选择 */}
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">国家</Label>
                <select
                  value={selectedCountry || ''}
                  onChange={(e) => setSelectedCountry(parseInt(e.target.value))}
                  className="w-full p-2 bg-black/50 border border-[#CEA472]/20 rounded text-[#FFFFFF] focus:border-[#CEA472] outline-none"
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
              </div>

              {/* 标题 */}
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">标题</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="留空则使用国家名称"
                  className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
                />
              </div>

              {/* 日期 */}
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">日期</Label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="例如：2025-01"
                  className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
                />
              </div>

              {/* 外部链接 */}
              <div className="space-y-2">
                <Label className="text-[#FFFFFF]/80">外部链接</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black/40 border-[#CEA472]/30 text-white placeholder:text-white/40 focus:border-[#CEA472]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdate}
                  disabled={loading || uploading}
                  className="flex-1 bg-[#CEA472] hover:bg-[#CEA472]/80 text-[#0a0a0f]"
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '确认修改'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setEditingPhoto(null); resetForm(); }}
                  className="border-[#CEA472]/30 text-[#CEA472] hover:bg-[#CEA472]/10"
                >
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
