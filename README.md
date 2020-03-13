# Morphir-Dapr

Currently this project contains a sample which will eventually be the outout of morphir-elm gen 

Files:- 

1. DaprElmMain.elm - The elm model that captures the count business logic 
2. DaprElmMain.js - The output of `elm make DaprElmMain.elm --optimize --output=DaprElmMain.js`
3. app.js - Express app that interacts with Dapr side-car
4. Dockerfile - Dockerfile that containerizes app.js
