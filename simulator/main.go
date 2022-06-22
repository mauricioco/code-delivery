package main

import (
	"fmt"

	. "github.com/mauricioco/imersaofsfc2-simulator/application/route"
)

func main() {
	r1 := Route{
		ID:       "1",
		ClientID: "client1",
		//Positions: []Position{}, // not required apparently
	}
	r1.LoadPositions()
	r1.PrintPositions()

	stringJson, _ := r1.ExportJsonPositions()
	fmt.Println(stringJson)
}
