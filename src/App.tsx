// =====================================================
// App.tsx
// Main application component with routing
// =====================================================

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { StorageService } from './services/storage.service';
import { HomePage } from './pages/HomePage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { RoomViewPage } from './pages/RoomViewPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  useEffect(() => {
    // Initialize storage on app load
    StorageService.init().catch(console.error);
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/room/:token" element={<RoomViewPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;