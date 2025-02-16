import React, { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
function GTTOrders({ tokenFile }) {
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
//   console.log(JSON.stringify(gttOrders));
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
                                <div>
                                    {holding.tradingsymbol} {order.orders[0].price}  {order.orders[0].transaction_type} 
                                </div>

                            ))}
                    </td>
                    <td>
                      <Button variant="primary">Copy to HUF</Button>
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
