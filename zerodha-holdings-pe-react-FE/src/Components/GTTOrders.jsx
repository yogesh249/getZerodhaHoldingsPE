import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Alert from "react-bootstrap/Alert";
function GTTOrders({ src, dest, gttOrders, holdings, handleReloadFromGTTOrders, reload }) {
  const [visibleRow, setVisibleRow] = useState(null);
  const [status, setStatus] = useState("success");
  const handleCopyToHUF = (order, src, dest) => {
    console.log("Going to delete this order " + order.id);

    const copyGTT2HUF = fetch('http://localhost:3000/copyGTT2HUF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order, dest: dest }),
    })
    .then(data => {
      console.log(`Copy to ${dest} successful:`, data);
      console.log(`Copy to ${dest} successful`);
      setVisibleRow(order.id);
      return true;
    })
    .catch((error) => {
      console.error(`Error copying to ${dest} :`, error);
      console.log(`Copy to ${dest}  failed`);
      setVisibleRow(null);
      return false;
    });

    const deleteGTTOrder = fetch('http://localhost:3000/deleteGTTOrder', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenFile: src, orderId: order.id }),
    })
    // .then(response => {
    //   console.log(response);
  
    //   // Check if response is NOT OK (status 500, 400, etc.)
    //   if (!response.ok) {
    //     return response.text().then(errorMessage => { // Read error message
    //       throw new Error(errorMessage); // Throw error to be caught in catch()
    //     });
    //   }
      
    //   return response.json(); // Process valid JSON responses
    // })
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
                    <td width="350 px" >
                      {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                        {holding.tradingsymbol} {order.orders[0].price}
                                </div>
                            ))}
                    
                    </td>
                    <td width="300px">
                      {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                  <span width="300px" style={{
                                            backgroundColor: order.orders[0].transaction_type === 'SELL' ? 'red' : 'green',
                                            color: 'white'
                                          }}>
                                          {order.orders[0].transaction_type} ( { order.orders[0].quantity} )
                                  </span> 
                                </div>
                            ))}
                    </td>
                    <td width="350px" >
                        {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                       
                                          <Button variant="primary" 
                                            onClick={() => handleCopyToHUF(order, src, dest) }>Copy to {dest}</Button>
                                        
                                        {visibleRow === order.id && (
                                          <Alert variant={status ? "success" : "danger"}>
                                            {status ? "Success" : "Error"}
                                          </Alert>
                                        )}
                                      
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
                  <td width="350 px" align="right">{order.orders[0].tradingsymbol} {order.orders[0].price}</td>
                  <td><span width="300 px" style={{
                    backgroundColor: order.orders[0].transaction_type === 'SELL' ? 'red' : 'green',
                    color: 'white'
                  }}>{order.orders[0].transaction_type} ( { order.orders[0].quantity } )</span></td>
                  <td>
                    <Button variant="primary" 
                      onClick={() => handleCopyToHUF(order, src, dest)}>Copy to {dest}</Button>
                      {visibleRow === order.id && (
                          <Alert variant={status ? "success" : "danger"}>
                            {status ? "Success" : "Error"}
                          </Alert>
                       )}
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
