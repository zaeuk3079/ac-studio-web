export const uploadImageToCloudCDN = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // High-Speed Unlimited Free Image Cloud CDN (ImgBB API)
    const apiKey = '3b8fae923e4210e7b8f9e2b17b629b35';
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.url) {
        return data.data.url; // Return fast, unlimited CDN URL
      }
    }
  } catch (err) {
    console.warn('Cloud CDN upload fallback to compressed base64:', err);
  }

  // Fallback if network drops: compress to 4K ultra-high resolution
  return compressImage(file, 3840, 3840, 0.98);
};

export const compressImage = (file: File, maxWidth = 3840, maxHeight = 3840, quality = 0.98): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          const isPng = file.type?.includes('png') || file.name?.toLowerCase().endsWith('.png');
          if (isPng) {
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const compressBase64String = (base64Str: string, maxDim = 450, quality = 0.7): Promise<string> => {
  if (!base64Str || !base64Str.startsWith('data:image')) return Promise.resolve(base64Str);
  if (base64Str.length < 150000) return Promise.resolve(base64Str);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const isPngStr = base64Str.startsWith('data:image/png');
          resolve(canvas.toDataURL(isPngStr ? 'image/png' : 'image/jpeg', quality));
        } else {
          resolve(base64Str);
        }
      } catch (e) {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const parseFontFamilyStyle = (fontName?: string): { fontFamily: string; fontWeight?: number } => {
  if (!fontName) return { fontFamily: 'Pretendard, sans-serif' };
  if (fontName.startsWith('Pretendard-')) {
    const weightMap: Record<string, number> = {
      'Pretendard-Light': 300,
      'Pretendard-Medium': 500,
      'Pretendard-SemiBold': 600,
      'Pretendard-Bold': 700,
      'Pretendard-Black': 900,
    };
    return {
      fontFamily: 'Pretendard, sans-serif',
      fontWeight: weightMap[fontName] || 400
    };
  }
  return { fontFamily: fontName };
};

export const compressImageToBlob = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mime = getMimeType(file);
          if (mime === 'image/png') {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            }, 'image/png');
          } else {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            }, mime, quality);
          }
        } else {
          reject(new Error('Canvas context failed'));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
