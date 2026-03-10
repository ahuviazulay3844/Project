import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// השורות הקריטיות לרידקס:
import { Provider } from 'react-redux'
import { store } from './app/store';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ה-Provider חייב לעטוף את App */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)