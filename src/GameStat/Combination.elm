module GameStat.Combination exposing (Combination, Distributor, fromIdeals, toCombinations)

import Dict exposing (Dict)


type alias Combination value =
    { value : value
    , real : Int
    , ideal : Int
    , idealGap : Int
    }


type Distributor value
    = Distributor (value -> String) (List value) (Dict String Float)


fromIdeals : (value -> String) -> List ( value, Float ) -> Distributor value
fromIdeals toKey pairs =
    let
        values =
            List.map Tuple.first pairs

        distributions =
            pairs
                |> List.map (Tuple.mapFirst toKey)
                |> Dict.fromList
    in
    Distributor toKey values distributions


toCombinations : Distributor value -> List value -> List (Combination value)
toCombinations (Distributor toKey values distributions) turns =
    let
        totalTurnsCount =
            List.length turns

        counts =
            List.foldl
                (\turn acc ->
                    let
                        key =
                            toKey turn

                        count =
                            Maybe.withDefault 0 (Dict.get key acc)
                    in
                    Dict.insert key (count + 1) acc
                )
                Dict.empty
                turns
    in
    List.map
        (\value ->
            let
                key =
                    toKey value

                ideal =
                    toFloat totalTurnsCount * Maybe.withDefault 0 (Dict.get key distributions)

                idealMin =
                    floor ideal
            in
            { value = value
            , real = Maybe.withDefault 0 (Dict.get key counts)
            , ideal = idealMin
            , idealGap = ceiling ideal - idealMin
            }
        )
        values
