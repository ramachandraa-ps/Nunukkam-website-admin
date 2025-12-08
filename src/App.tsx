import React from 'react';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import Router from './routes';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Router />
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
