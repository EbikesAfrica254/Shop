// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚴‍♂️ E-Bikes Africa - Development Mode');
console.log('🌱 Building a sustainable future for Africa');

const rootElement = document.getElementById('root');
console.log('🚨 Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
  }
}