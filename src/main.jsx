import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppProvider } from './context/AppContext';
import { BillingProvider } from './context/BillingContext';

async function enableMocking() {
  if (parseInt(import.meta.env.VITE_ENABLE_MOCKING)) {
    console.log('Enabling mocking.');
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  
  console.log('Not enabling mocking.');
  return Promise.resolve();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ToastProvider>
        <AuthProvider>
          <BillingProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </BillingProvider>
        </AuthProvider>
      </ToastProvider>
    </StrictMode>
  );
});
