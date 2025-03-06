import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Alert from "react-bootstrap/Alert";
function GTTOrders({ tokenFile, otherTokenFile, gttOrders, holdings, handleReloadFromGTTOrders, reload }) {
  const [visibleRow, setVisibleRow] = useState(null);
  const [status, setStatus] = useState("success");
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
      setVisibleRow(order.id);
      return true;
    })
    .catch((error) => {
      console.error('Error copying to {otherTokenFile} :', error);
      console.log('Copy to {otherTokenFile}  failed');
      setVisibleRow(null);
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
      setVisibleRow(order.id);
      return true;
    })
    .catch((error) => {
      console.error('Error deleting order:', error);
      setVisibleRow(null);
      return false;
    });

    Promise.all([copyGTT2HUF, deleteGTTOrder]).then(results => {
      const [copySuccessful, deleteSuccessful] = results;
      if (copySuccessful && deleteSuccessful) {
        console.log("going to initiate reload = " + reload);
        setStatus(true);
        // Refresh the zerodha Tabs after 1 second so that we get time to show alert.
        setTimeout(()=>handleReloadFromGTTOrders(!reload),1000);
      } else {
         setVisibleRow(null);
         setStatus(false);
         setTimeout(()=>handleReloadFromGTTOrders(!reload),1000);
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
                    <td align="left" width="150px">{holding.tradingsymbol}</td>
                    <td align="right">
                        {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                    <table><tbody>
                                    <tr>
                                        <td width="300 px" align="right">{holding.tradingsymbol} {order.orders[0].price} </td>
                                        <td style={{
                                            backgroundColor: order.orders[0].transaction_type === 'SELL' ? 'red' : 'green',
                                            color: order.orders[0].transaction_type === 'SELL' ? 'white' : 'black'
                                        }}>{order.orders[0].transaction_type} </td>
                                        <td>
                                          <Button variant="primary" 
                                            onClick={() => handleCopyToHUF(order, tokenFile, otherTokenFile) }>Copy to {otherTokenFile}</Button>
                                        </td>
                                        {visibleRow === order.id && (
                                          <td><Alert variant={status ? "primary" : "danger"}>
                                            Success
                                            </Alert>
                                        </td>
                                    )}
                                    </tr></tbody>
                                    </table>
                               

                                    
                                </div>
                            ))}
                    </td>
                </tr>
            ))}

            {gttOrders
              .filter(order => !holdings.some(holding => holding.tradingsymbol === order.orders[0].tradingsymbol))
              .map(order => (
              
                <tr key={order.id} border="1">
                  <td width="150 px" align="right">No holdings</td>
                  
                  <tr>
                  <td width="350 px" align="right">{order.orders[0].tradingsymbol} {order.orders[0].price}</td>
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
