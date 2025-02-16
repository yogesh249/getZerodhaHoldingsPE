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
        let hufTokenFile = "D://huf_token.txt";
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
app.listen(3000, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log('Server is running on port 3000');
    }
});