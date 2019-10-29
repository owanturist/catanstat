module Extra exposing (formatMilliseconds)


formatMilliseconds : Int -> String
formatMilliseconds milliseconds =
    let
        seconds =
            milliseconds // 1000

        minutes =
            seconds // 60

        hours =
            minutes // 60
    in
    if hours > 0 then
        String.fromInt hours ++ "h " ++ String.fromInt (minutes - hours * 60) ++ "m"

    else if minutes > 0 then
        String.fromInt minutes ++ "m " ++ String.fromInt (seconds - minutes * 60) ++ "s"

    else
        String.fromInt seconds ++ "s"
