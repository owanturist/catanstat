module Table exposing (Table, empty, render, withColumn, withKey)

import Html exposing (Html)
import Html.Attributes
import Html.Keyed
import Html.Lazy


type alias Column data msg =
    { label : List (Html msg)
    , cell : data -> List (Html msg)
    }


type Table data msg
    = Table
        { toKey : Maybe (data -> String)
        , columns : List (Column data msg)
        }


empty : Table data msg
empty =
    Table
        { toKey = Nothing
        , columns = []
        }


withColumn : List (Html msg) -> (data -> List (Html msg)) -> Table data msg -> Table data msg
withColumn label cell (Table table) =
    Table
        { table | columns = Column label cell :: table.columns }


withKey : (data -> String) -> Table data msg -> Table data msg
withKey toKey (Table table) =
    Table
        { table | toKey = Just toKey }


render : List data -> Table data msg -> Html msg
render items (Table table) =
    Html.Lazy.lazy3 viewTable items table.toKey table.columns



-- L A Y O U T


viewRow : List (Column data msg) -> data -> Html msg
viewRow columns item =
    Html.tr
        [ Html.Attributes.class "border-b border-gray-200"
        ]
        (List.map
            (\column ->
                Html.td
                    [ Html.Attributes.class "py-3 px-6" ]
                    (column.cell item)
            )
            (List.reverse columns)
        )


viewHeader : List (Column data msg) -> Html msg
viewHeader columns =
    Html.tr
        [ Html.Attributes.class "bg-gray-200 text-gray-600 uppercase text-sm leading-normal"
        ]
        (List.map
            (\column ->
                Html.th
                    [ Html.Attributes.class "py-3 px-6 text-left" ]
                    column.label
            )
            (List.reverse columns)
        )


viewTable : List data -> Maybe (data -> String) -> List (Column data msg) -> Html msg
viewTable items maybeToKey columns =
    let
        bodyAttributes =
            [ Html.Attributes.class "text-gray-600 text-sm font-light"
            ]

        rows =
            List.map (Html.Lazy.lazy2 viewRow columns) items
    in
    Html.table
        [ Html.Attributes.class "font-sans min-w-max w-full table-auto"
        ]
        [ Html.thead [] [ Html.Lazy.lazy viewHeader columns ]
        , case maybeToKey of
            Nothing ->
                Html.tbody bodyAttributes rows

            Just toKey ->
                List.map2 Tuple.pair
                    (List.map toKey items)
                    rows
                    |> Html.Keyed.node "tbody" bodyAttributes
        ]
