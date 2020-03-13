// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const elmApp = require('./DaprElmMain');
require ('isomorphic-fetch');

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const stateUrl = `http://localhost:${daprPort}/v1.0/state`;

const app = express();

// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

//elm app is initialized when express app tries to load state on bounce
var daprElmApp = undefined;

//When dapr pub-sub sidecar comes up it makes a get request to the app 
//to know which topics to subscribe to, now dapr knows to send a post request 
//to this /topic when it receives a message that the app has subscribed to
app.get('/dapr/subscribe', (_req, res) => {
    res.json(['A']);
});

//dapr side receives a message and makes a post request to the app
app.post('/A', (req, res) => {
    console.log("A: ", req.body);
    var intVal = req.body.data.intVal;
    daprElmApp.ports.eventReader.send(intVal);
    res.sendStatus(200);
});

//Dapr will use the below port to communicate with the app
const port = 3000;
app.listen(port, () => {
    console.log(`Node App listening on port ${port}!`);
    loadStateWithRetry();
});

//The app will try to load state using stateURL and port 3500
//where dapr is listening for incoming requests
function loadStateWithRetry () {
    fetch(`${stateUrl}/count`)
        .then ((response) => {
            if (!response.ok) {
                //throw "Unable to fetch initial state";
                return 0;
            }
            
            //process the response in the next "then"
            return response.text();
        }).then((intStr) => {
            
            //Print the state that was fetched from the redis state store
            console.log ("Remote State: " + intStr);
            
            //Initialize the elm "brain" with the state received from redis
            daprElmApp = elmApp.Elm.DaprElmMain.init({ flags: parseInt (intStr) });

            //print all communication channels with the brain
            console.log (daprElmApp.ports);
            
            //Persist the state received from the brain back into redis state store
            daprElmApp.ports.modelViewer.subscribe (function (data) {
                console.log ("Printing data received from Elm");
                console.log (data);
            
                //create state key-value pair to be persisted in redis state store
                const state = [{ key: "count", value: data}]
                
                //persist by making a post request to state url
                fetch (stateUrl, {
                    method: "POST",
                    body: JSON.stringify (state),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then ((response) => {
                    if (!response.ok) {
                        throw "Failed to persist count!";
                    }
                    console.log ("Persisted count:" + data);
                }).catch ((error) => {
                    console.log (error);
                });
            
            });

        }).catch((error) => {
            console.log(error);
            setTimeout (function(){
                loadStateWithRetry();
            }, 1000);
        })
        
}