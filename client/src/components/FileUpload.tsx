// client/src/components/FileUpload.tsx
import { useDropzone } from 'react-dropzone';

export const FileUpload = ({ onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {'application/x-tex': ['.tex']},
    onDrop: files => files[0] && onUpload(files[0])
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Drag & drop .tex file here, or click to select</p>
    </div>
  );
};