import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return <Toaster position="bottom-right" reverseOrder={false} />;
};

export const showError = (message: string) => toast.error(message);
export const showSuccess = (message: string) => toast.success(message);