import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CategoryService } from '../services/CategoryService';
import { Category, CategoryInput } from '../types/models';
import { showToast } from '../utils/toast';
import {
  Plus,
  Layers,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";

import { useSearchParams } from 'react-router-dom';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // URL search params logic
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('action');
        return newParams;
      }, { replace: true });

      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      setIsModalOpen(true);
    }
  }, [searchParams, setSearchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categoryService = useMemo(() => new CategoryService(), []);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    const response = await categoryService.getAllCategories();
    if (response.success) {
      setCategories(response.data);
    }
    setIsLoading(false);
  }, [categoryService]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast.error('اسم الفئة مطلوب');
      return;
    }

    let response;
    if (editingCategory) {
      response = await categoryService.updateCategory(editingCategory.id, formData);
    } else {
      response = await categoryService.createCategory(formData);
    }

    if (response.success) {
      showToast.success(editingCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
      setIsModalOpen(false);
      loadCategories();
    } else {
      showToast.error(response.error.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    const response = await categoryService.deleteCategory(deletingCategory.id);
    if (response.success) {
      showToast.success('تم حذف الفئة بنجاح');
      setIsDeleteModalOpen(false);
      loadCategories();
    } else {
      showToast.error(response.error.message);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto" dir="rtl">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold w-fit mb-4">
            <Layers size={14} />
            <span>تنظيم البيانات</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">إدارة التصنيفات</h1>
          <p className="text-slate-500 font-medium">تنظيم المنتجات في فئات لسهولة الوصول إليها وإدارتها</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-lg font-black gap-2 transition-none"
        >
          <Plus size={24} />
          إضافة تصنيف جديد
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[40px] p-20 text-center shadow-none">
          <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-slate-200 border border-slate-100">
              <FolderOpen size={48} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">لا يوجد تصنيفات حالياً</h3>
              <p className="text-slate-500 font-medium">ابدأ بإضافة أول تصنيف لتنظيم منتجاتك بشكل احترافي</p>
            </div>
            <Button onClick={() => handleOpenModal()} variant="outline" className="h-12 px-8 rounded-xl border-slate-200 font-bold">إضافة أول تصنيف</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="group border-slate-200 rounded-[32px] overflow-hidden bg-white flex flex-col shadow-sm">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100" onClick={() => handleOpenModal(category)}>
                      <Edit size={16} className="text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => {
                      setDeletingCategory(category);
                      setIsDeleteModalOpen(true);
                    }}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 mt-4">{category.name}</CardTitle>
                <CardDescription className="text-slate-500 font-medium line-clamp-2 min-h-[3rem]">
                  {category.description || 'لا يوجد وصف لهذا التصنيف'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-8 pt-4 mt-auto border-t border-slate-50 flex items-center gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-0 overflow-hidden">
          <div className="bg-slate-50">
            <DialogHeader className="bg-slate-900 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  {editingCategory ? <Edit size={24} /> : <Plus size={24} />}
                </div>
                <DialogTitle className="text-3xl font-black">{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</DialogTitle>
              </div>
              <DialogDescription className="text-slate-200 opacity-80">أدخل تفاصيل التصنيف لتنظيم منتجاتك بشكل أفضل</DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 pr-1">اسم التصنيف</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl text-lg font-bold"
                  placeholder="مثال: الملابس، الإلكترونيات..."
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 pr-1">الوصف</Label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm font-medium"
                  placeholder="اكتب وصفاً مختصراً لهذا التصنيف..."
                />
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 flex gap-4">
              <Button onClick={handleSubmit} className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-lg">
                {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl border-slate-200 font-bold">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-500 font-medium">
              هل أنت متأكد من حذف تصنيف <span className="text-red-600 font-black">"{deletingCategory?.name}"</span>؟ لا يمكن حذف التصنيف إذا كان يحتوي على منتجات.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleDelete} className="flex-1 h-12 rounded-xl font-black">حذف نهائياً</Button>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold">تراجع</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CategoryManagement;
