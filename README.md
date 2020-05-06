# Morphir-Dapr
The morphir-dapr project is a Morphir sub-project dedicated to enabling the [Microsoft Dapr](http://dapr.io) platform as a target for [Morphir Application Models].  

## What
Morphir Application Modeling imagines development as:
* You code just pure business logic.
* That code is guaranteed to be free of exceptions.
* Merging your code triggers full SDLC automation through to deployment.
* Your application automatically conforms to firm standards now and in the future.
* Your users have transparency into how your application behaves and why.
* You retain full control to modify any of the above.

## How
In general, the flow for application modeling is:
1. Model your application with one of the languages supported by morphir (we've provided a few samples [here](https://github.com/Morgan-Stanley/morphir-elm/blob/master/examples/Morphir/Dapr/Input/Example.elm) and [here](https://github.com/Morgan-Stanley/morphir-examples/tree/master/src/Morphir/Sample/Apps).
2. Invoke the morphir-dapr build to generate the Dapr application.  This generates the following:
   * DaprElmMain.elm - The elm model that captures the count business logic 
   * DaprElmMain.js - The output of `elm make DaprElmMain.elm --optimize --output=DaprElmMain.js`
   * app.js - Express app that interacts with Dapr side-car
   * Dockerfile - Dockerfile that containerizes app.js
   * [Note] - Usually we'd transpile from the Morphir IR to a Dapr-supported language like JavaScript.  We took a shortcut since Elm already has a top-notch Elm-to-JavaScript compiler.
3. Setup your SDLC pipeline to deploy.

## Notes
A few important notes:
1. This is a work-in-project. Community participation will be key to making it production grade.
2. While we used Elm in our examples, Bosque is another powerful application modeling language that we're excited about. Keep an eye out for more on this.
