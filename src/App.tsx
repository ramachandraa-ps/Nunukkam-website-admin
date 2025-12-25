import React from 'react';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import { AuthProvider } from './context/AuthContext';
import Router from './routes';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <StoreProvider>
          <Router />
        </StoreProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
