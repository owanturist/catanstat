import { Elm } from './src/Main.elm';

const { ports } = Elm.Main.init()

if (ports.local_storage__get_item && ports.local_storage__get_item_done) {
    ports.local_storage__get_item.subscribe(function(key) {
        ports.local_storage__get_item_done.send([
            key,
            window.localStorage.getItem(key)
        ])
    })
}

if (ports.local_storage__set_item) {
    ports.local_storage__set_item.subscribe(function(payload) {
        window.localStorage.setItem(payload[ 0 ], payload[ 1 ])
    })
}

if (ports.local_storage__remove_item) {
    ports.local_storage__remove_item.subscribe(function(key) {
        window.localStorage.removeItem(key)
    })
}

