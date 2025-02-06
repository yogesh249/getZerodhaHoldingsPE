const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();

console.log('Starting server...'); // Log when starting the server

app.get('/holdings', async (req, res) => {
    console.log('GET /holdings route hit'); // Log when the route is accessed
    try {
        const response = await axios.get('https://kite.zerodha.com/oms/portfolio/holdings', {
            headers: {
                'Authorization': 'enctoken dIXXG3TRpPTq/Z/YDc+hfuKkevjsRT1PzRmyRLOML607xPhyabY3kdUk8vOQxOtrXHZDUFWLc9oRqLt8Ub4CYexJF4TTRhh1I00BqMKmIGJusMD+5bdrcA=='
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
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
            </style>
            <table border="1">
                <tr>
                    <th>Instrument</th>
                    <th>Book Value</th>
                     <th>PB</th>
                     <th>Stock P/E</th>
                     <th>Grahams Number</th>
                    <th>Qty.</th>
                    <th>Avg. cost</th>
                    <th>LTP</th>
                    <th>Cur. val</th>
                    <th>P&L</th>
                    <th>Net chg.</th>
                    <th>Day chg.</th>
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
                    <td>${PB*PE}</td>
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
