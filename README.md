# Teaching Web APIs

TODO: screenshot of auth part
TODO: screenshot of websocket part
TODO: screenshot of debouncing part
TODO: explaination of auth, websocket and debouncing part, so this goes in a details section, each one has a GIF and an explaination
TODO: final cleanup of code
TODO: instructions to run go api

## How to run the [frontend](./jam-packed-webapp/)
- Assuming you have [asdf](https://asdf-vm.com/) installed
- `cp .env.example .env` populate missing fields in [.env](./jam-packed-webapp/.env)
- `npm i`
- `npm run dev`

## How to run the [backend](./jam-packed-webapi/)
- Assumes you have [Go](https://go.dev/doc/install) installed
- `cp .env.example .env` populate missing fields in [.env](./jam-packed-webapi/.env)
- `go mod tidy`
- `go run main.go` or use [`air`](https://github.com/air-verse/air) for hot reload