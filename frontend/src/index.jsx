// index.js (CLEANED UP VERSION)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Styles
import './styles/globals.css';
import './index.css';

// Components
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

const EBikesAfricaApp = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚴‍♂️ E-Bikes Africa - Development Mode');
      console.log('🌱 Building a sustainable future for Africa');
    }
  }, []);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Initialize the application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<EBikesAfricaApp />);

export default EBikesAfricaApp;