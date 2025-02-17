import { useState, useEffect } from 'react';
import './Holdings.css';

function Holdings({ tokenFile }) {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/holdingsJSON?tokenFile=${tokenFile}`)
      .then(response => response.json())
      .then(data => {
        setHoldings(data);
        localStorage.setItem(tokenFile + "Holdings", JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching holdings:', error));
  }, [tokenFile]);

  return (
    <>
      <h1>{tokenFile + " Holdings"}</h1>
      <table>
        <thead>
          <tr>
            <th>Trading Symbol</th>
            <th>Quantity</th>
            <th>Average Price</th>
            <th>Last Price</th>
            <th>P&L</th>
            <th>Day Change</th>
            <th>Day Change %</th>
            <th>PE</th>
            <th>BV</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, index) => (
            <tr key={index}>
              <td>{holding.tradingsymbol}</td>
              <td>{holding.quantity}</td>
              <td>{holding.average_price.toFixed(2)}</td>
              <td>{holding.last_price.toFixed(2)}</td>
              <td>{holding.pnl.toFixed(2)}</td>
              <td>{holding.day_change.toFixed(2)}</td>
              <td>{holding.day_change_percentage.toFixed(2)}%</td>
              <td>{holding.PE}</td>
              <td>{holding.BV}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Holdings;
