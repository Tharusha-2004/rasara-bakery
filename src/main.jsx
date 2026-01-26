import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are present and not default placeholders
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase_project_url') && 
  !supabaseAnonKey.includes('your_supabase_anon_key');

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!isSupabaseConfigured) {
  // Render a user-friendly error message if Supabase is not configured
  root.render(
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center font-sans">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
        <p className="text-gray-600 mb-6">
          Please set up your Supabase credentials in the <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.env</code> file to continue.
        </p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded text-left text-xs font-mono overflow-x-auto mb-6">
          <div className="mb-1">VITE_SUPABASE_URL=your_project_url</div>
          <div>VITE_SUPABASE_ANON_KEY=your_anon_key</div>
        </div>
        <p className="text-sm text-gray-500">
          You need to restart the development server after updating the .env file.
        </p>
      </div>
    </div>
  );
} else {
  root.render(
    <App />
  );
}