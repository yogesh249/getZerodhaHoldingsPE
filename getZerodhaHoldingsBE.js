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
            res.status(200).send(bookValue);
        
    } catch (error) {
        console.error('Error fetching BV:', error); // Log the error
        res.status(200).send('0')
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
            console.log("Fetching PE for", holding.tradingsymbol);
            const response = await axios.get('http://localhost:3000/BV?symbol=' + holding.tradingsymbol, {
                  "Cache-Control": "no-cache"
            });
            const bv = response.data;
            holding.PE = 123;
            holding.BV = bv;
        }
        console.log(holdings);
        res.status(200).send(holdings);
    } catch (error) {
        console.error('Error fetching holdingsJSON:', error); // Log the error
        res.status(500).send('Error fetching holdingsJSON');
    }
});
app.get("/getGTTOrdersJSON", async (req, res) => {
    console.log("GET /getGTTOrdersJSON route hit"); // Log when the route is accessed
    try {
        let tokenFile = req.query.tokenFile;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");
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
        return res.status(200).send(gttTriggers);
    }
    catch (error) {
        console.error("Error fetching GTT triggers:", error); // Log the error
        return res.status(500).send("Error fetching GTT triggers");
    }
});
app.delete("/deleteGTTOrder", async (req, res) => {
    console.log("DELETE /deleteGTTOrder route hit"); // Log when the route is accessed
    try {
        let tokenFile = req.body.tokenFile;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");
        const orderId = req.body.orderId;
        const response = await axios.delete(
            `https://kite.zerodha.com/oms/gtt/triggers/${orderId}`,
            {
                headers: {
                    Authorization: "enctoken " + token,
                    "Cache-Control": "no-cache"
                },
            }
        );
        console.log("Response from API:", response.data);
        res.status(200).send("GTT order deleted successfully"); // Log the response from
    } catch (error) {
        console.error("Error in /deleteGTTOrder:", error); // Log the error
        res.status(500).send("Error deleting GTT order");
    }
});

app.post("/copyGTT2HUF", async (req, res) => {

    console.log("POST /copyGTT2HUF route hit"); // Log when the route is accessed
    try {
        // Log the received trigger
        // Read the trigger from the POST body
        console.log("req.body=",req.body);
        const safeMessage = JSON.stringify(req.body).replace(/\n/g, ''); // Escape newlines
        console.log("safeMessage = ",safeMessage);
        const trimmedMessage = safeMessage.trim();
        const trigger = JSON.parse(trimmedMessage);
        // Now make a call to the zerodha API to create a GTT trigger
        // Use the token from the ${hufToken} 
        // Use the trigger object to create the GTT trigger
        // Log the response from the API
        console.log('trigger=',trigger);
        let hufTokenFile = "D://"+req.body.tokenFile+"_token.txt";
        const hufToken = fs.readFileSync(hufTokenFile, "utf8");
        let condition=trigger.order.condition;
        console.log("condition = ",condition);

        let orders=trigger.order.orders;
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
        console.error("Error in /copyGTT2HUF:", error); // Log the error
        res.status(500).send("Error processing trigger");
    }
});
app.post("/oms/orders/regular", async (req, res) => {
    console.log("Placing a sell order for "+ req.body); // Log when the route is accessed
    try {
        let tokenFile = req.body.src;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");
        const postData = querystring.stringify(req.body); // Convert JSON data to form-url-encoded type data
        
        console.log(postData);
        const sellResponse = await axios.post(
            `https://kite.zerodha.com/oms/orders/regular`,
            postData, // Send the form-url-encoded data
            {
                headers: {
                    Authorization: "enctoken " + token,
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded" // Set the content type to form-url-encoded
                },
            }
        );
        console.log("Sell order response from API:", sellResponse.status);
    } catch (error) {
        console.error("Error in placing sell order /oms/orders/regular:"); // Log the error
        res.status(500).send("Error placing sell order");
    }

    console.log("Placing a BUY order for " + req.body); // Log when the route is accessed
    try {
        req.body.transaction_type = "BUY";
        let tokenFile = req.body.dest;
        tokenFile = "D://" + tokenFile + "_token.txt";
        const token = fs.readFileSync(tokenFile, "utf8");
        const postData = querystring.stringify(req.body); // Convert JSON data to form-url-encoded type data
        
        console.log(postData);
        const buyResponse = await axios.post(
            `https://kite.zerodha.com/oms/orders/regular`,
            postData, // Send the form-url-encoded data
            {
                headers: {
                    Authorization: "enctoken " + token,
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded" // Set the content type to form-url-encoded
                },
            }
        );
        console.log("Buy order response from API:", buyResponse.status);
        res.status(200).send("Sell and Buy orders placed successfully"); // Send a single response after both orders
    } catch (error) {
        console.error("Error in placing buy order /oms/orders/regular:"); // Log the error
        res.status(500).send("Error placing buy order");
    }
});

app.listen(3000, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on port 3000');
    }
});