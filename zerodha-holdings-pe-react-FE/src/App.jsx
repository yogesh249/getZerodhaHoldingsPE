import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [holdings, setHoldings] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/holdingsJSON?tokenFile=zerodha')
      .then(response => response.json())
      .then(data => setHoldings(data))
      .catch(error => console.error('Error fetching holdings:', error))
  }, [])

  return (
    <>
      <h1>Holdings</h1>
      <table>
        <thead>
          <tr>
            <th>Trading Symbol</th>
            <th>Exchange</th>
            <th>Quantity</th>
            <th>Average Price</th>
            <th>Last Price</th>
            <th>P&L</th>
            <th>Day Change</th>
            <th>Day Change %</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, index) => (
            <tr key={index}>
              <td>{holding.tradingsymbol}</td>
              <td>{holding.exchange}</td>
              <td>{holding.quantity}</td>
              <td>{holding.average_price}</td>
              <td>{holding.last_price}</td>
              <td>{holding.pnl}</td>
              <td>{holding.day_change}</td>
              <td>{holding.day_change_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App
