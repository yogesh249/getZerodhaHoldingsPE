import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';

function GTTOrders({ tokenFile, otherTokenFile }) {
  const [gttOrders, setGttOrders] = useState([]);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/getGTTOrdersJSON?tokenFile=${tokenFile}`)
      .then(response => response.json())
      .then(data => setGttOrders(data))
      .catch(error => console.error('Error fetching getGTTOrdersJSON:', error));
  }, [tokenFile]);

  useEffect(() => {
    fetch(`http://localhost:3000/holdingsJSON?tokenFile=${tokenFile}`)
      .then(response => response.json())
      .then(data => setHoldings(data))
      .catch(error => console.error('Error fetching holdings:', error));
  }, [tokenFile]);

  const handleCopyToHUF = (order) => {
    fetch('http://localhost:3000/copyGTT2HUF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    })
    //.then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Copy to HUF successful');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Copy to HUF failed');
    });
  };

  return (
    <>
    <div>
        <table border="1">
            <tbody>
            {holdings.map(holding => (
                <tr key={holding.tradingsymbol}>
                    <td>{holding.tradingsymbol}</td>
                    <td>
                        {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                    {holding.tradingsymbol} {order.orders[0].price}  {order.orders[0].transaction_type} 
                                    <Button variant="primary" onClick={() => handleCopyToHUF(order)}>Copy to HUF</Button>
                                </div>
                            ))}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    </>
  );
}

export default GTTOrders;
