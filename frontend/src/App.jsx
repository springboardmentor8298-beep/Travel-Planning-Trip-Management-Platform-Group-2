import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            borderRadius: '10px'
          }
        }}
      />
      <AppRouter />
    </AuthProvider>
  );
}
