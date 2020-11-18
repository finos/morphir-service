module Morphir.Elm.Target exposing (..)

import Json.Decode as Decode exposing (Error, Value)
import Morphir.File.FileMap exposing (FileMap)
import Morphir.IR.Distribution exposing (Distribution)
import Morphir.IR.Package as Package
import Morphir.Scala.Backend
-- import Morphir.Scala.Backend.Codec as ScalaCodec
import Morphir.Service.SpringBoot.Backend as SpringBoot
import Morphir.Service.SpringBoot.Backend.Codec
-- import Morphir.Service.Dapr.Backend as Dapr

-- possible language generation options
type BackendOptions
    = SpringBootOptions Morphir.Scala.Backend.Options
    -- | DaprOptions       Scala.Options
    | ScalaOptions      Morphir.Scala.Backend.Options


decodeOptions : Result Error String -> Decode.Decoder BackendOptions
decodeOptions gen =
    case gen of
        Ok "SpringBoot" ->
            Decode.map (\(options) -> SpringBootOptions(options)) Morphir.Service.SpringBoot.Backend.Codec.decodeOptions

        -- Ok "Dapr" -> 
        --     Decode.map (\(options) -> DaprOptions(options)) Dapr.Codec.decodeOptions
        
        _ ->
            Decode.map (\(options) -> SpringBootOptions(options)) Morphir.Service.SpringBoot.Backend.Codec.decodeOptions
            -- Decode.map (\(options) -> ScalaOptions(options)) ScalaCodec.decodeOptions


mapDistribution : BackendOptions -> Distribution -> FileMap
mapDistribution back dist =
    case back of
        SpringBootOptions options -> 
            SpringBoot.mapDistribution options dist

        -- DaprOptions options -> 
        --     Dapr.mapDistribution options dist

        ScalaOptions options -> 
            Morphir.Scala.Backend.mapDistribution options dist
