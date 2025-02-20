import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
function GTTOrders({ tokenFile, otherTokenFile, gttOrders, holdings, handleReloadFromGTTOrders, reload }) {


  const handleCopyToHUF = (order, tokenFile, otherTokenFile) => {
    console.log("Going to delete this order " + order.id);

    const copyGTT2HUF = fetch('http://localhost:3000/copyGTT2HUF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order, tokenFile: otherTokenFile }),
    })
    .then(data => {
      console.log('Copy to {otherTokenFile}  successful:', data);
      console.log('Copy to {otherTokenFile} successful');
      return true;
    })
    .catch((error) => {
      console.error('Error copying to {otherTokenFile} :', error);
      console.log('Copy to {otherTokenFile}  failed');
      return false;
    });

    const deleteGTTOrder = fetch('http://localhost:3000/deleteGTTOrder', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenFile: tokenFile, orderId: order.id }),
    })
    // .then(response => response.json())
    .then(data => {
      console.log('Deleting successful:', data);
      return true;
    })
    .catch((error) => {
      console.error('Error deleting order:', error);
      return false;
    });

    Promise.all([copyGTT2HUF, deleteGTTOrder]).then(results => {
      const [copySuccessful, deleteSuccessful] = results;
      if (copySuccessful && deleteSuccessful) {
        console.log("going to initiate reload = " + reload);
        // Toggle reload in Zerodha tabs
        handleReloadFromGTTOrders(!reload);
      } else {
      }
    });
  };
  return (
    <>
    <div>
        <table border="1">
            <tbody>
            {holdings.map(holding => (
                <tr key={holding.tradingsymbol}>
                    <td align="left">{holding.tradingsymbol}</td>
                    <td align="right">
                        {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                    <tr
                                        
                                    >
                                        <td>{holding.tradingsymbol}</td>
                                        <td>{order.orders[0].price} </td>
                                        <td style={{
                                            backgroundColor: order.orders[0].transaction_type === 'SELL' ? 'red' : 'green',
                                            color: order.orders[0].transaction_type === 'SELL' ? 'white' : 'black'
                                        }}>{order.orders[0].transaction_type} </td>
                                        <td>
                                          <Button variant="primary" 
                                            onClick={() => handleCopyToHUF(order, tokenFile, otherTokenFile) }>Copy to {otherTokenFile}</Button>
                                        </td>
                                    </tr>
                                </div>
                            ))}
                    </td>
                </tr>
            ))}

            {gttOrders
              .filter(order => !holdings.some(holding => holding.tradingsymbol === order.orders[0].tradingsymbol))
              .map(order => (
              
                <tr key={order.id} border="1">
                  <td>No holdings</td>
                  <tr>
                  <td align="left">{order.orders[0].tradingsymbol} {order.orders[0].price}</td>
                  <td style={{
                    backgroundColor: order.orders[0].transaction_type === 'SELL' ? 'red' : 'green',
                    color: order.orders[0].transaction_type === 'SELL' ? 'white' : 'black'
                  }}>{order.orders[0].transaction_type}</td>
                  <td>
                    <Button variant="primary" 
                      onClick={() => handleCopyToHUF(order, tokenFile, otherTokenFile)}>Copy to {otherTokenFile}</Button>
                  </td>
                  </tr>
                </tr>
              ))}
            </tbody>
        </table>
    </div>
    </>
  );
}

export default GTTOrders;
