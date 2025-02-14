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
app.get('/holdingsJSON', async (req, res) => {
    console.log('GET /holdingsJSON route hit'); // Log when the route is accessed
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
        const holdings = response.data.data;
        for (const holding of holdings) {
            holding.PE = 123;
            holding.BV = 456;
        }
        console.log(holdings);
        res.status(200).send(holdings);
    } catch (error) {
        console.error('Error fetching holdingsJSON:', error); // Log the error
        res.status(500).send('Error fetching holdingsJSON');
    }
});

app.listen(3000, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on port 3000');
    }
});