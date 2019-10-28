import { Elm } from './src/Main.elm';

const { ports } = Elm.Main.init()

// ports.local_storage__set_item.subscribe(function(payload) {
//     window.localStorage.setItem(payload.key, payload.value)
// })

// ports.local_storage__remove_item.subscribe(function(key) {
//     window.localStorage.removeItem(key)
// })
