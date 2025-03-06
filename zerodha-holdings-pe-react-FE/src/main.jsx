import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Holdings from './Components/Holdings'
import ZerodhaTabs from './Components/ZerodhaTabs';
import 'bootstrap/dist/css/bootstrap.min.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ZerodhaTabs tokenFile='zerodha' otherTokenFile='huf' />
  </StrictMode>,
)
