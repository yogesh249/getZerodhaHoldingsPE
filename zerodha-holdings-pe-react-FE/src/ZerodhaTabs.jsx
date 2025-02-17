import { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Holdings from './Holdings';
import GTTOrders from './GTTOrders';

function ZerodhaTabs() {
  const [key, setKey] = useState('Holdings');
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (key === 'HUF GTTOrders' || key === 'Zerodha GTTOrders') {
      setReload(true);
    } else {
      setReload(false);
    }
  }, [key]);

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
        <Holdings tokenFile="zerodha" />
      </Tab>
      <Tab eventKey="HUF Holdings" title="HUF Holdings">
        <Holdings tokenFile="huf" />
      </Tab>
      <Tab eventKey="Zerodha GTTOrders" title="Zerodha GTTOrders">
        <GTTOrders tokenFile="zerodha" otherTokenFile="huf" reload={reload} />
      </Tab>
      <Tab eventKey="HUF GTTOrders" title="HUF GTTOrders">
        <GTTOrders tokenFile="huf" otherTokenFile="zerodha" reload={reload} />
      </Tab>
    </Tabs>
  );
}

export default ZerodhaTabs;