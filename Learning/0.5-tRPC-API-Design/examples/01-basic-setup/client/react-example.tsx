/**
 * React tRPC Integration Example
 * 
 * This shows how to use tRPC with React using React Query.
 * This is the most common way to use tRPC in React applications.
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../server/index';

// ===== TRPC REACT SETUP =====

/**
 * Create tRPC React hooks
 * 
 * This creates typed React hooks for all your procedures:
 * - trpc.hello.useQuery()
 * - trpc.createUser.useMutation()
 * - etc.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Create React Query client
 * 
 * This manages caching, background updates, etc.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Create tRPC client
 */
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers() {
        return {
          'x-client': 'react-example',
        };
      },
    }),
  ],
});

// ===== REACT COMPONENTS =====

/**
 * Component: Hello Query Example
 */
function HelloExample() {
  const [name, setName] = useState('React User');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  
  // ✅ Type-safe query hook with automatic caching
  const { data, isLoading, error, refetch } = trpc.hello.useQuery({
    name,
    includeTimestamp,
  });
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>📞 Hello Query Example</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          Name: 
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ marginLeft: '5px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={includeTimestamp} 
            onChange={(e) => setIncludeTimestamp(e.target.checked)}
          />
          Include timestamp
        </label>
      </div>
      
      <button onClick={() => refetch()}>Refetch</button>
      
      <div style={{ marginTop: '10px' }}>
        {isLoading && <p>🔄 Loading...</p>}
        {error && <p style={{ color: 'red' }}>❌ Error: {error.message}</p>}
        {data && (
          <div style={{ background: '#f0f0f0', padding: '10px' }}>
            <p><strong>Message:</strong> {data.message}</p>
            {data.timestamp && (
              <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 This query automatically re-runs when inputs change and includes caching!
      </p>
    </div>
  );
}

/**
 * Component: Create User Mutation Example
 */
function CreateUserExample() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // ✅ Type-safe mutation hook
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: (user) => {
      console.log('✅ User created:', user);
      alert(`User created: ${user.name} (${user.email})`);
      setName('');
      setEmail('');
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error);
      alert(`Error: ${error.message}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    createUserMutation.mutate({ name, email });
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>✏️ Create User Mutation Example</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Name: 
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Email: 
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={createUserMutation.isLoading}
        >
          {createUserMutation.isLoading ? '🔄 Creating...' : '✅ Create User'}
        </button>
      </form>
      
      {createUserMutation.error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          ❌ Error: {createUserMutation.error.message}
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 This mutation has loading states, error handling, and success callbacks!
      </p>
    </div>
  );
}

/**
 * Component: Current Time Auto-Refresh Example
 */
function CurrentTimeExample() {
  // ✅ Query with automatic refresh
  const { data, isLoading, error } = trpc.getCurrentTime.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🕐 Current Time (Auto-refresh)</h3>
      
      {isLoading && <p>🔄 Loading...</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error.message}</p>}
      {data && (
        <div style={{ background: '#f0f0f0', padding: '10px' }}>
          <p><strong>ISO:</strong> {data.iso}</p>
          <p><strong>Timestamp:</strong> {data.timestamp}</p>
          <p><strong>Timezone:</strong> {data.timezone}</p>
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 This query automatically refreshes every 5 seconds!
      </p>
    </div>
  );
}

/**
 * Component: Counter Mutations Example
 */
function CounterExample() {
  // ✅ Query for current counter value
  const { data: counter, refetch } = trpc.updateCounter.useQuery({
    action: 'increment',
    amount: 0, // This will just return current value
  });
  
  // ✅ Mutation for updating counter
  const updateCounterMutation = trpc.updateCounter.useMutation({
    onSuccess: () => {
      refetch(); // Refresh counter value after mutation
    },
  });
  
  const handleIncrement = () => {
    updateCounterMutation.mutate({ action: 'increment', amount: 1 });
  };
  
  const handleDecrement = () => {
    updateCounterMutation.mutate({ action: 'decrement', amount: 1 });
  };
  
  const handleReset = () => {
    updateCounterMutation.mutate({ action: 'reset' });
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🔢 Counter Example</h3>
      
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>
        Counter: {counter?.value ?? '?'}
      </div>
      
      <div>
        <button onClick={handleIncrement} disabled={updateCounterMutation.isLoading}>
          +1
        </button>
        <button onClick={handleDecrement} disabled={updateCounterMutation.isLoading} style={{ marginLeft: '5px' }}>
          -1
        </button>
        <button onClick={handleReset} disabled={updateCounterMutation.isLoading} style={{ marginLeft: '5px' }}>
          Reset
        </button>
      </div>
      
      {updateCounterMutation.isLoading && <p>🔄 Updating...</p>}
      {updateCounterMutation.error && (
        <p style={{ color: 'red' }}>❌ Error: {updateCounterMutation.error.message}</p>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 Mutations automatically update the UI when complete!
      </p>
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔗 tRPC React Example</h1>
      <p>This demonstrates tRPC integration with React using React Query.</p>
      
      <HelloExample />
      <CreateUserExample />
      <CurrentTimeExample />
      <CounterExample />
      
      <div style={{ padding: '20px', background: '#f9f9f9', margin: '20px 0' }}>
        <h3>💡 Key Benefits</h3>
        <ul>
          <li><strong>Type Safety:</strong> Full TypeScript support from server to client</li>
          <li><strong>Automatic Caching:</strong> React Query handles caching and background updates</li>
          <li><strong>Loading States:</strong> Built-in loading, error, and success states</li>
          <li><strong>Optimistic Updates:</strong> UI updates before server confirms</li>
          <li><strong>Real-time:</strong> Automatic re-fetching and data synchronization</li>
          <li><strong>Developer Experience:</strong> Autocomplete, refactoring safety, no manual API calls</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * App Wrapper with Providers
 */
function AppWithProviders() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default AppWithProviders;

// ===== LEARNING NOTES =====

/**
 * What you learned about tRPC + React:
 * 
 * 1. **Setup**: createTRPCReact + QueryClient + Provider setup
 * 2. **Hooks**: useQuery for reads, useMutation for writes
 * 3. **Caching**: Automatic caching and background updates
 * 4. **Loading States**: Built-in loading, error, success handling
 * 5. **Type Safety**: Full TypeScript support in React components
 * 
 * Compared to traditional REST in React:
 * - No useEffect + fetch boilerplate
 * - No manual loading state management
 * - No manual error handling
 * - No manual type definitions
 * - Automatic caching and optimization
 * - Real-time data synchronization
 */

// ===== USAGE INSTRUCTIONS =====

/**
 * To use this component:
 * 
 * 1. Install dependencies:
 *    npm install @trpc/react-query @tanstack/react-query
 * 
 * 2. Import and use:
 *    import App from './client/react-example';
 *    ReactDOM.render(<App />, document.getElementById('root'));
 * 
 * 3. Make sure server is running:
 *    npm run server
 */ 