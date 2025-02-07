const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const cors = require('cors');
const PORT = 5000;

// Middleware
app.use(cors()); // Allows React to call this API
app.use(express.json());


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
        const cmpResponse = await axios.get(`http://localhost:3000/CMP?symbol=${req.query.symbol}`);
        const bvResponse = await axios.get(`http://localhost:3000/BV?symbol=${req.query.symbol}`);
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
        const response = await axios.get('https://kite.zerodha.com/oms/portfolio/holdings', {
            // headers: {
            //     'Authorization': 'enctoken 2scp3+IfaaHaYHh1tI7lpJY1q3bojfnGgiNBjwrfxyqMnfBoT2BIgREcE7bV6d17H3DdOZxaZOq1mST+YQ6G8Zirw7L6jAzl4qqsjPjAxlIwYd3NUqeU7g==',
            // "Cache-Control": "no-cache"
            // }
            headers:
            {
                'Authorization': 'enctoken L9/jM121dfZKcepcJiD5tcyzN0hwXD/BJvfJ51EaYbYH42yK4rKWHozkgVY8OolFA/oN8QkgIr7JEuGxA/UltJgAMus2sT8CJcfkYbwDkpQsf6HZlYMeNQ==',
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
                            switchcount ++;
                        } else {
                            if (switchcount == 0 && dir == "asc") {
                                dir = "desc";
                                switching = true;
                            }
                        }
                    }
                }
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
app.listen(3000, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on port 3000');
    }
});
