module Effect.History exposing (Action(..), middleware)

import Browser.Navigation


type Action
    = Push String
    | Replace String


middleware : Browser.Navigation.Key -> Action -> Cmd msg
middleware navigationKey action =
    case action of
        Push url ->
            Browser.Navigation.pushUrl navigationKey url

        Replace url ->
            Browser.Navigation.replaceUrl navigationKey url
