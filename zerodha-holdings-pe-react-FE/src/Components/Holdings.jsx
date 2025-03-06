import { useState, useEffect } from 'react';
import '../css/Holdings.css';
import Button from 'react-bootstrap/Button';

function Holdings({ holdings, src, dest, handleReloadFromHoldings, reload }) {

  const handleMoveToOtherAccount = (holding) => {
    const data = {
      variety: 'regular',
      exchange:  holding.exchange,
      tradingsymbol: holding.tradingsymbol,
      transaction_type: 'SELL',
      order_type: 'MARKET',
      quantity: holding.quantity,
      price: 0,
      product: holding.product,
      validity: 'DAY',
      disclosed_quantity: 0,
      trigger_price: 0,
      squareoff: 0,
      stoploss: 0,
      trailing_stoploss: 0,
      tag: 'quick',
      src: src,
      dest: dest
    };

    fetch('http://localhost:3000/oms/orders/regular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data).toString(),
    })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok ' + response.statusText);
    //   }
    //   console.log(response);
    //   return response.json();
    // })
    .then(data => {
      console.log('Success:', data);
      alert('Move to Other Account successful');
      setTimeout(()=>handleReloadFromHoldings(!reload),1000);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Move to Other Account failed');
    });


  };

  return (
    <>
      <h1>Holdings</h1>
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
            <th>Button</th>
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
              <td><Button type="primary" onClick={() => handleMoveToOtherAccount(holding)}>Move to Other account</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Holdings;
