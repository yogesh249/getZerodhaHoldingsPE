import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Holdings from './Holdings'
import ZerodhaTabs from './ZerodhaTabs';
import 'bootstrap/dist/css/bootstrap.min.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ZerodhaTabs />
  </StrictMode>,
)
