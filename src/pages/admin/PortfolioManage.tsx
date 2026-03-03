import React, { useState } from 'react';
import { useCMS, PortfolioItem } from '../../store/CMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Check, GripVertical } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableGalleryItem({ id, url, isCover, onSetCover, onRemove }: { key?: React.Key, id: string, url: string, isCover: boolean, onSetCover: () => void, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`relative group rounded-lg overflow-hidden border-2 bg-stone-100 ${isCover ? 'border-burgundy-500' : 'border-transparent'}`}>
      <div {...attributes} {...listeners} className="absolute top-2 right-2 z-10 bg-stone-900/50 text-white p-1.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-900/80">
        <GripVertical size={16} />
      </div>
      <img src={url} alt="Gallery" className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center space-y-2 pointer-events-none">
        {!isCover && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onSetCover(); }} className="pointer-events-auto text-xs bg-white text-stone-900 px-3 py-1.5 rounded shadow font-medium hover:bg-stone-100">대표 설정</button>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="pointer-events-auto text-xs bg-red-500 text-white px-3 py-1.5 rounded shadow font-medium hover:bg-red-600">삭제</button>
      </div>
      {isCover && (
        <div className="absolute top-2 left-2 bg-burgundy-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Cover</div>
      )}
    </div>
  );
}

function SortablePortfolioRow({ item, onEdit, onDelete }: { key?: React.Key, item: PortfolioItem, onEdit: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-stone-50/50 transition-colors bg-white relative z-0">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div {...attributes} {...listeners} className="mr-4 text-stone-400 cursor-grab active:cursor-grabbing hover:text-stone-600 p-1">
            <GripVertical size={20} />
          </div>
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-200">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-stone-900">{item.title}</div>
        <div className="text-sm text-stone-500 truncate max-w-xs mt-1">{item.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-100 text-stone-600 uppercase tracking-wider">
          {item.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={onEdit} className="text-stone-400 hover:text-burgundy-600 transition-colors mr-4" title="Edit">
          <Edit2 size={18} />
        </button>
        <button onClick={onDelete} className="text-stone-400 hover:text-red-600 transition-colors" title="Delete">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}

export default function PortfolioManage() {
  const { portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, reorderPortfolio } = useCMS();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({});
  const [tempUrl, setTempUrl] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleEdit = (item: PortfolioItem) => {
    setIsEditing(item.id);
    setFormData(item);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deletePortfolioItem(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    for (const file of files) {
      try {
        // Compress more aggressively to avoid Firestore 1MB document limit, but keep quality acceptable
        // For photographers, we use higher resolution (2000px) and quality (0.9)
        const compressedBase64 = await compressImage(file, 2000, 2000, 0.9);
        setFormData(prev => {
          const newGallery = [...(prev.gallery || []), compressedBase64];
          return {
            ...prev,
            gallery: newGallery,
            imageUrl: prev.imageUrl || compressedBase64
          };
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => {
      const newGallery = (prev.gallery || []).filter(url => url !== urlToRemove);
      let newImageUrl = prev.imageUrl;
      if (newImageUrl === urlToRemove) {
        newImageUrl = newGallery.length > 0 ? newGallery[0] : '';
      }
      return { ...prev, gallery: newGallery, imageUrl: newImageUrl };
    });
  };

  const setCoverImage = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleDragEndGallery = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        if (!prev.gallery) return prev;
        const oldIndex = prev.gallery.indexOf(active.id as string);
        const newIndex = prev.gallery.indexOf(over.id as string);
        return { ...prev, gallery: arrayMove(prev.gallery, oldIndex, newIndex) };
      });
    }
  };

  const handleDragEndPortfolio = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = portfolio.findIndex(item => item.id === active.id);
      const newIndex = portfolio.findIndex(item => item.id === over.id);
      reorderPortfolio(arrayMove(portfolio, oldIndex, newIndex));
    }
  };

  const handleSave = () => {
    if (isEditing) {
      updatePortfolioItem(isEditing, formData);
      setIsEditing(null);
    } else if (isAdding) {
      if (formData.title && formData.category && formData.imageUrl) {
        addPortfolioItem(formData as Omit<PortfolioItem, 'id'>);
        setIsAdding(false);
      } else {
        alert('필수 항목(Title, Category, Image)을 모두 입력해주세요.');
        return;
      }
    }
    setFormData({});
    setTempUrl('');
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({});
    setTempUrl('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">Portfolio Management</h2>
          <p className="text-stone-500 mt-1">Add, edit, or remove works from your portfolio.</p>
        </div>
        {!isAdding && !isEditing && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-burgundy-700 hover:bg-burgundy-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="text-lg font-semibold text-stone-800">
                {isEditing ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
              </h3>
              <button onClick={handleCancel} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    placeholder="e.g. Wedding in Seoul"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Category *</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                    placeholder="e.g. Wedding, Portrait"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Video URL (Optional)</label>
                <input
                  type="text"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  placeholder="YouTube or Vimeo URL (e.g. https://www.youtube.com/watch?v=...)"
                />
                <p className="text-xs text-stone-500 mt-2">유튜브(YouTube) 또는 비메오(Vimeo) 영상 링크를 넣으시면 포트폴리오에 영상이 표시됩니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Images (Gallery) *</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg (URL 입력)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempUrl && !(formData.gallery || []).includes(tempUrl)) {
                          setFormData(prev => ({
                            ...prev,
                            gallery: [...(prev.gallery || []), tempUrl],
                            imageUrl: prev.imageUrl || tempUrl
                          }));
                          setTempUrl('');
                        }
                      }
                    }}
                    className="flex-1 min-w-[200px] border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUrl && !(formData.gallery || []).includes(tempUrl)) {
                        setFormData(prev => ({
                          ...prev,
                          gallery: [...(prev.gallery || []), tempUrl],
                          imageUrl: prev.imageUrl || tempUrl
                        }));
                        setTempUrl('');
                      }
                    }}
                    className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    URL 추가
                  </button>
                  <div className="relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button
                      type="button"
                      className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-lg font-medium transition-colors h-full whitespace-nowrap"
                    >
                      + PC에서 찾기
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-4">
                  여러 장의 사진을 추가할 수 있습니다. 대표 이미지를 지정해주세요. 이미지를 드래그하여 순서를 변경할 수 있습니다.
                  <br />
                  <span className="text-burgundy-600 font-medium">* 고화질 팁: 가로 2000px 정도의 JPG 파일을 권장하며, 게시물당 사진은 5장 이내로 올려주세요.</span>
                </p>
                
                {(formData.gallery && formData.gallery.length > 0) ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndGallery}>
                    <SortableContext items={formData.gallery} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {formData.gallery.map((imgUrl) => (
                          <SortableGalleryItem
                            key={imgUrl}
                            id={imgUrl}
                            url={imgUrl}
                            isCover={formData.imageUrl === imgUrl}
                            onSetCover={() => setCoverImage(imgUrl)}
                            onRemove={() => removeImage(imgUrl)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  formData.imageUrl && (
                    <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-stone-200">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 transition-colors resize-none"
                  placeholder="Short description of the work..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-burgundy-700 hover:bg-burgundy-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                >
                  <Check size={18} />
                  <span>Save Item</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPortfolio}>
              <SortableContext items={portfolio.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-stone-100">
                  {portfolio.map((item) => (
                    <SortablePortfolioRow
                      key={item.id}
                      item={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
          {portfolio.length === 0 && (
            <div className="p-12 text-center text-stone-500">
              No portfolio items found. Add some to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
