const express = require('express');
const axios = require('axios');
const fs = require('fs');
// const qs=require('qs');
const app = express();
const cors = require('cors');
const querystring = require('querystring');
const e = require('express');
const PORT = 5000;

// Middleware
app.use(cors()); // Allows React to call this API
app.use(express.json());
// THis is essential in order to get hiddent fields on the server side.
app.use(express.urlencoded({ extended: true }));  // Parses form data

console.log('Starting server...'); // Log when starting the server

app.get("/PE", async (req, res) => {
    console.log('GET /PE route hit'); // Log when the route is accessed
    try {
            let PE = 0;
            try {
                const screenerResponse = await axios.get(`https://www.screener.in/company/${req.query.symbol}/consolidated/`);
                const PEValue = screenerResponse.data.match(/<span class="name">\s*Stock P\/E\s*<\/span>\s*<span class="nowrap value">[^<]*<span class="number">([^<]+)<\/span>/);
                if (PEValue) {
                    PE = PEValue[1];
                    // Remove comma from bookValue String
                    PE = PE.replace(/,/g, '');
                    console.log(`PE for ${req.query.symbol}: ${PE}`); // Log the PE value  
                }
                else{
                    console.log(`PE for ${req.query.symbol}: N/A`); // Log the PE value
                    PE=0;
                }


            } catch (screenerError) {
                console.error(`Error fetching PE for ${req.query.symbol}:`, screenerError);
            }
            if(PE!=0)
              res.send(PE);
        
    } catch (error) {
        console.error('Error fetching PE:', error); // Log the error
        res.status(500).send('Error fetching PE');
    }
});

app.get("/BV", async (req, res) => {
    console.log('GET /BV route hit'); // Log when the route is accessed
    try {
            let bookValue = 0;
            try {
                const screenerResponse = await axios.get(`https://www.screener.in/company/${req.query.symbol}/consolidated/`);
                const bookValueMatch = screenerResponse.data.match(/<span class="name">\s*Book Value\s*<\/span>\s*<span class="nowrap value">[^<]*<span class="number">([^<]+)<\/span>/);
                if (bookValueMatch) {
                    bookValue = bookValueMatch[1];
                    // Remove comma from bookValue String
                    bookValue = bookValue.replace(/,/g, '');
                    console.log(`bookValue for ${req.query.symbol}: ${bookValue}`); // Log the BV value  
                }
                else{
                    console.log(`bookValue for ${req.query.symbol}: N/A`); // Log the BV value
                    bookValue=0;
                }


            } catch (screenerError) {
                console.error(`Error fetching PE for ${req.query.symbol}:`, screenerError);
            }
            res.send(bookValue);
        
    } catch (error) {
        console.error('Error fetching BV:', error); // Log the error
        res.status(500).send('Error fetching BV');
    }
});
app.get("/CMP", async (req, res) => {
    console.log('GET /BV route hit'); // Log when the route is accessed
    try {
            let cmp = 0;
            try {
                const screenerResponse = await axios.get(`https://www.screener.in/company/${req.query.symbol}/consolidated/`);
                const cmpMatch = screenerResponse.data.match(/<span class="name">\s*Current Price\s*<\/span>\s*<span class="nowrap value">[^<]*<span class="number">([^<]+)<\/span>/);
                if (cmpMatch) {
                    cmp = cmpMatch[1];
                    // Remove comma from bookValue String
                    cmp = cmp.replace(/,/g, '');
                    console.log(`cmp for ${req.query.symbol}: ${cmp}`); // Log the BV value  
                }
                else{
                    console.log(`cmp for ${req.query.symbol}: N/A`); // Log the BV value
                    cmp=0;
                }


            } catch (screenerError) {
                console.error(`Error fetching PE for ${req.query.symbol}:`, screenerError);
            }
            res.send(cmp);
        
    } catch (error) {
        console.error('Error fetching BV:', error); // Log the error
        res.status(500).send('Error fetching cmp');
    }
});

app.get("/PB", async (req, res) => {
    console.log('GET /combined route hit'); // Log when the route is accessed
    try {
        const cmpResponse = await axios.get(`http://localhost:3000/CMP?symbol=${req.query.symbol}&tokenFile=${req.query.tokenFile}`);
        const bvResponse = await axios.get(`http://localhost:3000/BV?symbol=${req.query.symbol}&tokenFile=${req.query.tokenFile}`);
        if (bvResponse.data != 0) {
          res.send("" + (cmpResponse.data / bvResponse.data).toFixed(2));
        } else {
          res.send(0);
        }        

    } catch (error) {
        console.error('Error fetching combined data:', error); // Log the error
        res.status(500).send('Error fetching combined data');
    }
});


app.get('/holdings', async (req, res) => {
    console.log('GET /holdings route hit'); // Log when the route is accessed
    try {
        let tokenFile = req.query.tokenFile;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");

        const response = await axios.get('https://kite.zerodha.com/oms/portfolio/holdings', {
            headers: {
                'Authorization': 'enctoken ' + token,
                "Cache-Control": "no-cache"
            }
        });

        console.log('Received response from API'); // Log when a response is received

        const holdings = response.data.data;
        let table = `
         <style>
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 18px;
                    text-align: left;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                    cursor: pointer;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
            </style>
            <script>
                function sortTable(n) {
                    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
                    table = document.getElementById("holdingsTable");
                    switching = true;
                    dir = "asc"; 
                    while (switching) {
                        switching = false;
                        rows = table.rows;
                        for (i = 1; i < (rows.length - 1); i++) {
                            shouldSwitch = false;
                            x = rows[i].getElementsByTagName("TD")[n];
                            y = rows[i + 1].getElementsByTagName("TD")[n];
                            if (dir == "asc") {
                                if (!isNaN(parseFloat(x.innerHTML)) && !isNaN(parseFloat(y.innerHTML))) {
                                    if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
                                        shouldSwitch = true;
                                        break;
                                    }
                                } else {
                                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                                        shouldSwitch = true;
                                        break;
                                    }
                                }
                            } else if (dir == "desc") {
                                if (!isNaN(parseFloat(x.innerHTML)) && !isNaN(parseFloat(y.innerHTML))) {
                                    if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
                                        shouldSwitch = true;
                                        break;
                                    }
                                } else {
                                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                                        shouldSwitch = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (shouldSwitch) {
                            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                            switching = true;
                            switchcount++;
                        } else {
                            if (switchcount == 0 && dir == "asc") {
                                dir = "desc";
                                switching = true;
                            }
                        }
                    }
                }

                function refreshTable() {
                    location.reload();
                }

                // setInterval(refreshTable, 5000); // Refresh every 5 seconds
            </script>
            <table id="holdingsTable" border="1">
                <tr>
                    <th onclick="sortTable(0)">Instrument</th>
                    <th onclick="sortTable(1)">Book Value</th>
                    <th onclick="sortTable(2)">PB</th>
                    <th onclick="sortTable(3)">Stock P/E</th>
                    <th onclick="sortTable(4)">Grahams Number</th>
                    <th onclick="sortTable(5)">Qty.</th>
                    <th onclick="sortTable(6)">Avg. cost</th>
                    <th onclick="sortTable(7)">LTP</th>
                    <th onclick="sortTable(8)">Cur. val</th>
                    <th onclick="sortTable(9)">P&L</th>
                    <th onclick="sortTable(10)">Net chg.</th>
                    <th onclick="sortTable(11)">Day chg.</th>
                </tr>
        `;

        for (const holding of holdings) {
            const currentValue = holding.quantity * holding.last_price;
            let bookValue = '0'; // Default value
            let PB = 0; // Default value if PB is not found
            let PE = 0;
            try {
                const screenerResponse = await axios.get(`https://www.screener.in/company/${holding.tradingsymbol}/consolidated/`);
                const bookValueMatch = screenerResponse.data.match(/<span class="name">\s*Book Value\s*<\/span>\s*<span class="nowrap value">[^<]*<span class="number">([^<]+)<\/span>/);
                if (bookValueMatch) {
                    bookValue = bookValueMatch[1];
                    // Remove comma from bookValue String
                    bookValue = bookValue.replace(/,/g, '');
                    PB = holding.last_price / bookValue * 1; // Calculate the PE value
                    PB = PB.toFixed(2); // Round off the PE value to 2 decimal places
                    console.log(`PB for ${holding.tradingsymbol}: ${PB}`); // Log the PE value  
                }
                else{
                    console.log(`PB for ${holding.tradingsymbol}: N/A`); // Log the PE value
                }


                const PEValue = screenerResponse.data.match(/<span class="name">\s*Stock P\/E\s*<\/span>\s*<span class="nowrap value">[^<]*<span class="number">([^<]+)<\/span>/);
                if (PEValue) {
                    PE = PEValue[1];
                    // Remove comma from bookValue String
                    PE = PE.replace(/,/g, '');
                    PE = PE.toFixed(2); // Round off the PE value to 2 decimal places
                    console.log(`PE for ${holding.tradingsymbol}: ${PE}`); // Log the PE value  
                }
                else{
                    console.log(`PE for ${holding.tradingsymbol}: N/A`); // Log the PE value
                    PE=0;
                }


            } catch (screenerError) {
                console.error(`Error fetching PE for ${holding.tradingsymbol}:`, screenerError);
            }

            table += `
                <tr>
                    <td>${holding.tradingsymbol}</td>
                    <td>${bookValue}</td>
                    <td>${PB}</td>
                    <td>${PE}</td>
                    <td>${(PB*PE).toFixed(2)}</td>
                    <td>${holding.quantity}</td>
                    <td>${holding.average_price.toFixed(2)}</td>
                    <td>${holding.last_price.toFixed(2)}</td>
                    <td>${currentValue.toFixed(2)}</td>
                    <td>${holding.pnl.toFixed(2)}</td>
                    <td>${holding.day_change.toFixed(2)}</td>
                    <td>${holding.day_change_percentage.toFixed(2)}%</td>
                </tr>
            `;
        }

        table += '</table>';
        res.send(table);
    } catch (error) {
        console.error('Error fetching holdings:', error); // Log the error
        res.status(500).send('Error fetching holdings');
    }
});
app.post("/copyGTT2HUF", async (req, res) => {

    console.log("POST /copyGTT2HUF route hit"); // Log when the route is accessed
    try {
        // Log the received trigger
        // Read the trigger from the POST body
        const safeMessage = req.body.trigger.replace(/\n/g, ''); // Escape newlines
        const trimmedMessage = safeMessage.trim();
        const trigger = JSON.parse(trimmedMessage);
        // Now make a call to the zerodha API to create a GTT trigger
        // Use the token from the ${hufToken} 
        // Use the trigger object to create the GTT trigger
        // Log the response from the API

        let hufTokenFile = "D://huf_token.txt";
        const hufToken = fs.readFileSync(hufTokenFile, "utf8");
        let condition=trigger.condition;
        console.log("condition = ",condition);

        let orders=trigger.orders;
        console.log("orders = ",orders);
        let payload = "condition=" + encodeURIComponent(JSON.stringify(condition))
         + "&orders=" + encodeURIComponent(JSON.stringify(orders)) +"&type=single";
        // console.log("payload = ",payload);
        // Now replace the string cond= in conditionEncoded with empty string
        // conditionEncoded=conditionEncoded.replace("cond%5B","");
        // ordersEncoded=ordersEncoded.replace("ord%5B","");

        //let finalPayLoad = qs.stringify(payload, {encode: true});
        // console.log("finalPayLoad = ",finalPayLoad);
        let finalPayLoad = payload;

        console.log("finalPayLoad = ",finalPayLoad);
        const response = await axios.post(
            "https://kite.zerodha.com/oms/gtt/triggers",
            finalPayLoad,
            {
            headers: {
                Authorization: "enctoken " + hufToken, 
                "Content-Type": "application/x-www-form-urlencoded"
            },
            }
        );
        console.log("Response from API:", response.data);
        res.status(200).send("GTT order placed successfully"); // Log the response from
    } catch (error) {
        console.error("Error in /copyGTT2HUF:"); // Log the error
        res.status(500).send("Error processing trigger");
    }
});

app.get("/checkGTT", async (req, res) => {
    console.log("GET /checkGTT route hit"); // Log when the route is accessed
    try {
        let tokenFile = req.query.tokenFile;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");

        
        let hufTokenFile = "D://huf_token.txt";
        const hufToken = fs.readFileSync(hufTokenFile, "utf8");

        // Fetch the list of stocks from the /holdings endpoints


        const holdingsResponse = await axios.get('https://kite.zerodha.com/oms/portfolio/holdings', {
          headers: {
              'Authorization': 'enctoken ' + token,
              "Cache-Control": "no-cache"
          }
      });

        const holdings = holdingsResponse.data.data;
        // print the type of holdings
        // console.log('holdings = ' +holdings);
       
        // Fetch the GTT triggers
        const gttResponse = await axios.get(
            "https://kite.zerodha.com/oms/gtt/triggers",
            {
                headers: {
                    Authorization: "enctoken " + token,
                },
            }
        );

        const gttTriggers = gttResponse.data.data;
        // console.log("GTT Triggers:", gttTriggers); // Log the GTT triggers

        // For items in holdings, create a table with the GTT triggers, first column should have holdings and second column should have GTT triggers corresponding to that stock in holdings.
        // The first rowspan should be equal to the number of holdings for that stock.
        // The second column should have the GTT triggers for that stock.
        // If there are no GTT triggers for that stock, then the second column should have a message saying "No GTT triggers for this stock".
        // If there are GTT triggers for that stock, then the second column should have a table with the GTT triggers for that stock.
        let table2 = `
            <table border="1">
            <tr>
                <th>Holdings</th>
                <th>GTT Triggers</th>
            </tr>
        `;
        for (const holding of holdings) {
            const gttTriggersForHolding = gttTriggers.filter(trigger => trigger.condition.tradingsymbol === holding.tradingsymbol && trigger.status=='active');
            table2 += `
                <tr>
                    <td>${holding.tradingsymbol}</td>
                    <td>
                        <table style="width: 100%">
                            ${gttTriggersForHolding.length === 0 ? '<tr><td colspan="3" style="background-color:yellow">No GTT triggers for this stock</td></tr>' : gttTriggersForHolding.map(trigger => `
                                <tr border="1">
                                    <td>${trigger.condition.tradingsymbol}</td>
                                    <td style="background-color: ${trigger.orders[0].transaction_type === 'SELL' ? 'red' : 'green'}; color: white;">
                                        ${trigger.orders[0].transaction_type}
                                    </td>
                                    <td>
                                        ${trigger.orders[0].price}
                                    </td>
                                    <td>
                                        <form action="/copyGTT2HUF" method="POST">
                                            <input type="hidden" name="trigger" value='${JSON.stringify(trigger)}'>
                                            <input type="submit" value="Copy to HUF2">Copy to HUF</input>
                                        </form>
                                    </td>
                                </tr>
                            `).join('')}  
                        </table>               
                    </td>
                </tr>
            `;
        }


        // Find the gtt triggers which are not present in the holdings
        // Add more rows to the table2 variable and those values should be shown in the second column
        // In the first column, just write 'No holdings for this stock'

        const gttTriggersNotInHoldings = gttTriggers.filter(trigger => !holdings.some(holding => holding.tradingsymbol === trigger.condition.tradingsymbol));

        table2 += `
            <tr>
                <td>No holdings for these stocks</td>
                <td>
                    <table style="width: 100%">
                        ${gttTriggersNotInHoldings.length === 0 ? '<tr><td colspan="3">No GTT triggers for this stock</td></tr>' : gttTriggersNotInHoldings.map(trigger => `
                            <tr>
                                <td>${trigger.condition.tradingsymbol}</td>
                                <td style="background-color: ${trigger.orders[0].transaction_type === 'SELL' ? 'red' : 'green'}; color: white;">
                                    ${trigger.orders[0].transaction_type}
                                </td>
                                <td>
                                    ${trigger.orders[0].price}
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                </td>
            </tr>
        `;
        res.send(table2);
    } catch (error) {
        console.error("Error checking GTT:", error); // Log the error
        res.status(500).send("Error checking GTT");
    }
});

app.listen(3000, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on port 3000');
    }
});
