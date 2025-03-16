import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountDataDisplay from './components/AccountDataDisplay';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mt-4">
        <h1 className="mb-4">Blockchain Explorer</h1>
        <AccountDataDisplay />
      </div>
    </QueryClientProvider>
  );
}

export default App;