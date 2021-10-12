module ReviewConfig exposing (config)

import NoUnused.CustomTypeConstructorArgs
import NoUnused.CustomTypeConstructors
import NoUnused.Dependencies
import NoUnused.Exports
import NoUnused.Modules
import NoUnused.Parameters
import NoUnused.Patterns
import NoUnused.Variables
import NoUnoptimizedRecursion
import Simplify
import NoExposingEverything
import NoImportingEverything
import NoMissingTypeAnnotation
import NoMissingTypeExpose
import NoPrematureLetComputation
import NoMissingSubscriptionsCall
import NoUselessSubscriptions
import NoDebug.Log
import NoDebug.TodoOrToString
import Review.Rule exposing (Rule)


config : List Rule
config =
    -- github.com/jfmengels/elm-review-unused
    [ NoUnused.CustomTypeConstructors.rule []
    , NoUnused.CustomTypeConstructorArgs.rule
    , NoUnused.Dependencies.rule
    , NoUnused.Exports.rule
    , NoUnused.Modules.rule
    , NoUnused.Parameters.rule
    , NoUnused.Patterns.rule
    , NoUnused.Variables.rule

    -- github.com/jfmengels/elm-review-performance
    , NoUnoptimizedRecursion.rule (NoUnoptimizedRecursion.optOutWithComment "IGNORE TCO")

    -- github.com/jfmengels/elm-review-simplify
    , Simplify.rule Simplify.defaults

    -- github.com/jfmengels/elm-review-common
    , NoExposingEverything.rule
    , NoImportingEverything.rule []
    , NoMissingTypeAnnotation.rule
    , NoMissingTypeExpose.rule
    , NoPrematureLetComputation.rule

    -- github.com/jfmengels/elm-review-the-elm-architecture
    , NoMissingSubscriptionsCall.rule
    -- , NoRecursiveUpdate.rule
    , NoUselessSubscriptions.rule

    -- github.com/jfmengels/elm-review-debug
    , NoDebug.Log.rule
    , NoDebug.TodoOrToString.rule
    ]
