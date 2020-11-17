module Morphir.Elm.Target exposing (..)

import Json.Decode as Decode exposing (Error, Value)
import Morphir.File.FileMap exposing (FileMap)
import Morphir.IR.Distribution exposing (Distribution)
import Morphir.IR.Package as Package
import Morphir.Scala.Backend
import Morphir.SpringBoot.Backend as SpringBoot
import Morphir.SpringBoot.Backend.Codec
import Morphir.Dapr.Backend as Dapr
import Morphir.Dapr.Backend.Codec
import Morphir.Scala.Backend.Codec

-- possible language generation options
type BackendOptions
    = ScalaOptions Morphir.Scala.Backend.Options
    | SpringBootOptions Morphir.Scala.Backend.Options
    | DaprOptions Morphir.Scala.Backend.Options

decodeOptions : Result Error String -> Decode.Decoder BackendOptions
decodeOptions gen =
    case gen of
        Ok "SpringBoot" -> Decode.map (\(options) -> SpringBootOptions(options)) Morphir.SpringBoot.Backend.Codec.decodeOptions
        Ok "Dapr" -> Decode.map (\(options) -> DaprOptions(options)) Morphir.Dapr.Backend.Codec.decodeOptions
        _ -> Decode.map (\(options) -> ScalaOptions(options)) Morphir.Scala.Backend.Codec.decodeOptions

mapDistribution : BackendOptions -> Distribution -> FileMap
mapDistribution back dist =
    case back of
            SpringBootOptions options -> SpringBoot.mapDistribution options dist
            DaprOptions options -> Dapr.mapDistribution options dist
            ScalaOptions options -> Morphir.Scala.Backend.mapDistribution options dist
