import { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Holdings from './Holdings';
import GTTOrders from './GTTOrders';
function ZerodhaTabs() {
  const [key, setKey] = useState('Holdings');
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
      <Tab eventKey="Zerodha GTTOrdders" title="Zerodha GTTOrders">
        <GTTOrders tokenFile="zerodha" otherTokenFile="huf"/>
      </Tab>
      <Tab eventKey="HUF GTTOrdders" title="HUF GTTOrders">
        <GTTOrders tokenFile="huf" otherTokenFile="zerodha"/>
      </Tab>
    </Tabs>
  );
}

export default ZerodhaTabs;