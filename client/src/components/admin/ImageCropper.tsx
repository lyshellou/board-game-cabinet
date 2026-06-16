import { useState, useRef, useCallback, useEffect } from 'react';
import OriginalReactCrop, {
  type Crop,
  type PixelCrop,
  type PercentCrop,
  makeAspectCrop,
  centerCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// react-image-crop v11 has a type incompatibility with React 18's @types/react.
const ReactCrop = OriginalReactCrop as unknown as React.ComponentType<any>;

interface ImageCropperProps {
  file: File;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    Math.round(crop.x * scaleX),
    Math.round(crop.y * scaleY),
    Math.round(crop.width * scaleX),
    Math.round(crop.height * scaleY),
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.92,
    );
  });
}

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [generating, setGenerating] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load file as object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw preview canvas whenever crop or image changes
  useEffect(() => {
    const img = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!img || !canvas || !completedCrop) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Size canvas to match container (4:3 aspect, responsive)
    const containerWidth = canvas.parentElement?.clientWidth || 192;
    canvas.width = containerWidth;
    canvas.height = containerWidth * 0.75; // 3/4

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion scaled to fit canvas
    ctx.drawImage(
      img,
      Math.round(completedCrop.x * scaleX),
      Math.round(completedCrop.y * scaleY),
      Math.round(completedCrop.width * scaleX),
      Math.round(completedCrop.height * scaleY),
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }, [completedCrop, imgSrc]);

  // v11: onChange(pxCrop, pctCrop), onComplete(pxCrop, pctCrop)
  const handleChange = useCallback((_: PixelCrop, pctCrop: PercentCrop) => {
    setCrop(pctCrop);
  }, []);

  const handleComplete = useCallback((pxCrop: PixelCrop) => {
    setCompletedCrop(pxCrop);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imgRef.current = img;
    const { width, height } = img;

    // Start with a centered 4:3 crop using 80% of the smaller dimension
    const cropWidth = Math.min(width, (height * 4) / 3, width * 0.8);
    const cropHeight = (cropWidth * 3) / 4;
    const cropInit = centerCrop(
      makeAspectCrop(
        { unit: 'px', width: cropWidth, height: cropHeight },
        4 / 3,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(cropInit);
    setCompletedCrop(cropInit);
  }, []);

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    setGenerating(true);
    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      onCrop(blob);
    } catch {
      // If crop fails, pass original file
      onCrop(file);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-surface border border-border rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-heading text-lg text-white">裁剪图片（4:3 封面）</h3>
            <p className="text-xs text-muted mt-0.5">
              选区用于首页和画廊展示，原图保留在详情页
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 flex flex-col lg:flex-row gap-5">
          {/* Cropper */}
          <div className="flex-1 min-h-[300px] flex items-center justify-center bg-bg/50 rounded-lg p-2">
            {imgSrc ? (
              <ReactCrop
                crop={crop}
                onChange={handleChange}
                onComplete={handleComplete}
                aspect={4 / 3}
                minWidth={100}
                minHeight={75}
                className="max-h-[50vh]"
              >
                <img
                  src={imgSrc}
                  onLoad={onImageLoad}
                  alt="裁剪预览"
                  className="max-h-[50vh] object-contain"
                />
              </ReactCrop>
            ) : (
              <div className="text-muted text-sm">加载中...</div>
            )}
          </div>

          {/* Preview — canvas based */}
          <div className="lg:w-48 shrink-0 flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-muted">封面预览</p>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-bg">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full object-cover"
              />
            </div>
            {completedCrop && (
              <p className="text-[10px] text-muted text-center">
                {Math.round(completedCrop.width)}×{Math.round(completedCrop.height)} px
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-muted hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={generating || !completedCrop}
            className="px-6 py-2.5 bg-accent text-bg font-medium rounded-lg hover:bg-accent/90 transition-colors text-sm disabled:opacity-50"
          >
            {generating ? '处理中...' : '确认裁剪'}
          </button>
        </div>
      </div>
    </div>
  );
}
