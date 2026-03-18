import { useState, useCallback, useRef } from 'react';
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from '../../utils/constants';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function AudioUploader({ onFileSelect }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('不支持的文件格式。请上传 MP3 或 WAV 文件。');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('文件过大。最大支持 50MB。');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      className={`uploader ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border: isDragging ? '2px dashed #00ffcc' : '2px dashed #666',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isDragging ? 'rgba(0, 255, 204, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        marginBottom: '20px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
      <div style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>
        拖拽音频文件到这里，或点击选择
      </div>
      <div style={{ color: '#888', fontSize: '14px' }}>
        支持 MP3、WAV 格式，最大 50MB
      </div>
      {error && (
        <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
