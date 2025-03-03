import { useState, useEffect, useRef } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Holdings from './Holdings';
import GTTOrders from './GTTOrders';

function ZerodhaTabs({ tokenFile, otherTokenFile }) {
  const [key, setKey] = useState('Holdings');
  const [zerodhaHoldings, setZerodhaHoldings] = useState([]);
  const [hufHoldings, setHufHoldings] = useState([]);

  const [zerodhaGttOrders, setZerodhaGttOrders] = useState([]);
  const [hufGttOrders, setHufGttOrders] = useState([]);
  const [reload, setReload] = useState(false);


  // Function to receive data from child
  const handleReloadFromGTTOrders = (reloadFromGtt) => {
    setReload(reloadFromGtt);
  };
  useEffect(() => {
    fetch(`http://localhost:3000/getGTTOrdersJSON?tokenFile=${tokenFile}`)
      .then(response => response.json())
      .then(data => setZerodhaGttOrders(data))
      .catch(error => console.error('Error fetching getGTTOrdersJSON:', error));

  }, [tokenFile, reload]);

  useEffect(() => {
    fetch(`http://localhost:3000/getGTTOrdersJSON?tokenFile=${otherTokenFile}`)
      .then(response => response.json())
      .then(data => setHufGttOrders(data))
      .catch(error => console.error('Error fetching getGTTOrdersJSON:', error));
  }, [tokenFile, reload]);

  useEffect(() => {
      console.log('ZerodhaTabs component mounted or tokenFile changed');
      fetch(`http://localhost:3000/holdingsJSON?tokenFile=${tokenFile}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched Zerodha Holdings:', data);
          setZerodhaHoldings(data);
        })
        .catch(error => console.error('Error fetching zerodha holdings:', error));
  }, [tokenFile]); // useEffect will be called when tokenFile changes

  useEffect(() => {
    fetch(`http://localhost:3000/holdingsJSON?tokenFile=${otherTokenFile}`)
      .then(response => response.json())
      .then(data => setHufHoldings(data))
      .catch(error => console.error('Error fetching huf holdings:', error));
  }, [otherTokenFile]); // useEffect will be called when otherTokenFile changes

  return (
    <Tabs
      defaultActiveKey="Holdings"
      activeKey={key}
      transition={false}
      onSelect={(k) => setKey(k)}
      className="mb-3"
      id="uncontrolled-tab-example"
      style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}
    >
      <Tab eventKey="Holdings" title="Holdings">
        <Holdings holdings={zerodhaHoldings} src="zerodha" dest="huf"  />
      </Tab>
      <Tab eventKey="HUF Holdings" title="HUF Holdings">
        <Holdings  holdings={hufHoldings}  src="huf" dest="zerodha"/>
      </Tab>
     <Tab eventKey="Zerodha GTTOrders" title="Zerodha GTTOrders">
        <GTTOrders tokenFile="zerodha" otherTokenFile="huf" gttOrders={zerodhaGttOrders} holdings={zerodhaHoldings} handleReloadFromGTTOrders={handleReloadFromGTTOrders} reload={reload}/>
      </Tab>
      <Tab eventKey="HUF GTTOrders" title="HUF GTTOrders">
        <GTTOrders tokenFile="huf" otherTokenFile="zerodha" gttOrders={hufGttOrders} holdings={hufHoldings} handleReloadFromGTTOrders={handleReloadFromGTTOrders} reload={reload}/>
      </Tab>
    </Tabs>
  );
}

export default ZerodhaTabs;