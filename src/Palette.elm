module Palette exposing
    ( Color
    , alizarin
    , amethyst
    , clouds
    , concrete
    , emerald
    , midnightBlue
    , nephritis
    , orange
    , peterRiver
    , pomegranate
    , pumpkin
    , silver
    , sunFlower
    , wetAsphalt
    )

import Element exposing (rgb255)


type alias Color =
    Element.Color


emerald : Color
emerald =
    rgb255 46 204 113


nephritis : Color
nephritis =
    rgb255 39 174 96


peterRiver : Color
peterRiver =
    rgb255 52 152 219


amethyst : Color
amethyst =
    rgb255 155 89 182


wetAsphalt : Color
wetAsphalt =
    rgb255 52 73 94


midnightBlue : Color
midnightBlue =
    rgb255 44 62 80


sunFlower : Color
sunFlower =
    rgb255 241 196 15


orange : Color
orange =
    rgb255 243 156 18


pumpkin : Color
pumpkin =
    rgb255 211 84 0


alizarin : Color
alizarin =
    rgb255 231 76 60


pomegranate : Color
pomegranate =
    rgb255 192 57 43


clouds : Color
clouds =
    rgb255 236 240 241


silver : Color
silver =
    rgb255 189 195 199


concrete : Color
concrete =
    rgb255 149 165 166
