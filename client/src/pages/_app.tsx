import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { Toast } from '../components/Toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Toast />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}