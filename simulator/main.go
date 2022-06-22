package main

import (
	. "github.com/mauricioco/imersaofsfc2-simulator/application/route"
)

func main() {
	r1 := &Route{
		ID:        "1",
		ClientID:  "client1",
		Positions: []Position{},
	}
	r1.LoadPositions()
	r1.PrintPositions()
}
