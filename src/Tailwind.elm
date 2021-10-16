module Tailwind exposing (class, either, when)

import Html
import Html.Attributes


class : List String -> Html.Attribute msg
class classNames =
    classNames
        |> List.filter (not << String.isEmpty)
        |> String.join " "
        |> Html.Attributes.class


when : Bool -> String -> String
when bool className =
    if bool then
        className

    else
        ""


either : Bool -> String -> String -> String
either bool classNameOnTrue classNameOnFalse =
    if bool then
        classNameOnTrue

    else
        classNameOnFalse
