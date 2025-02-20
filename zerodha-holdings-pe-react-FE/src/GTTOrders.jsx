import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
function GTTOrders({ tokenFile, otherTokenFile, holdings }) {
  const [gttOrders, setGttOrders] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/getGTTOrdersJSON?tokenFile=${tokenFile}`)
      .then(response => response.json())
      .then(data => setGttOrders(data))
      .catch(error => console.error('Error fetching getGTTOrdersJSON:', error));
  }, [tokenFile, reload]);


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
        setReload(!reload);
      } else {
        console.log("reload = " + reload);
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
                    <td>{holding.tradingsymbol}</td>
                    <td>
                        {gttOrders
                            .filter(order => order.orders[0].tradingsymbol === holding.tradingsymbol)
                            .map(order => (
                                <div key={order.id}>
                                    {holding.tradingsymbol} {order.orders[0].price}  {order.orders[0].transaction_type} 
                                    <Button variant="primary" onClick={() => handleCopyToHUF(order, tokenFile, otherTokenFile) }>Copy to {otherTokenFile}</Button>
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
