port module DaprElmMain exposing (..)

import Json.Encode as E
import Json.Decode as D

main = 
    Platform.worker { init = init, update = update, subscriptions = subscriptions }

type alias Model = Int 
type alias Msg = Int

init : Int -> (Model, Cmd Msg)
init initialState = (initialState, modelViewer (E.int initialState))

update : Msg -> Model -> (Model, Cmd Msg)
update n model = 
   (model + n, modelViewer (E.int (model + n)))

subscriptions : Model -> Sub Msg
subscriptions model = eventReader decode 

decode : E.Value -> Msg
decode encodedMsg = 
    case D.decodeValue D.int encodedMsg of 
        Ok n -> n 
        Err err -> 0

port eventReader : (E.Value -> msg) -> Sub msg
port modelViewer : E.Value -> Cmd msg