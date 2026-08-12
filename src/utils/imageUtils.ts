export const uploadImageToCloudCDN = async (file: File, maxDim = 2000, quality = 0.82): Promise<string> => {
  try {
    // Compress client-side before upload. Uploading the original camera-resolution file
    // as-is meant every visitor — mobile included — downloaded the same multi-MB image
    // even though it's rendered far smaller on their screen, making the hero banner load
    // noticeably slower on mobile connections.
    let uploadFile: File | Blob = file;
    try {
      const compressedBase64 = await compressImage(file, maxDim, maxDim, quality);
      const compressedBlob = await (await fetch(compressedBase64)).blob();
      if (compressedBlob.size < file.size) {
        uploadFile = compressedBlob;
      }
    } catch (compressErr) {
      console.warn('Pre-upload compression skipped, uploading original file:', compressErr);
    }

    const formData = new FormData();
    formData.append('image', uploadFile);

    // High-Speed Unlimited Free Image Cloud CDN (ImgBB API)
    const apiKey = '7d9e84bbaa599699b9053b415d84bd89';
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.url) {
        return data.data.url; // Return fast, unlimited CDN URL
      }
      console.warn('Cloud CDN upload rejected by server, falling back to compressed base64:', data);
    } else {
      console.warn('Cloud CDN upload HTTP error, falling back to compressed base64:', response.status, await response.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('Cloud CDN upload network error, falling back to compressed base64:', err);
  }

  // Fallback if the CDN is unreachable (or its API key is invalid): compress conservatively
  // and always re-encode as JPEG (forceJpeg), since PNG re-encoding is lossless and barely
  // shrinks a photo at all — a "700KB" source PNG could still balloon past 1MiB as base64.
  // This becomes a base64 string stored directly on the Firestore settings document, which
  // shares its 1MiB total size with every other field on that doc.
  return compressImage(file, 1280, 1280, 0.65, true);
};

export const compressImage = (file: File, maxWidth = 3840, maxHeight = 3840, quality = 0.98, forceJpeg = false): Promise<string> => {
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
          
          const isPng = !forceJpeg && (file.type?.includes('png') || file.name?.toLowerCase().endsWith('.png'));
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

export const compressBase64String = (base64Str: string, maxDim = 3840, quality = 0.98): Promise<string> => {
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
