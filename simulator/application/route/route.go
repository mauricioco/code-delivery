package route

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	. "github.com/mauricioco/imersaofsfc2-simulator/application/constants"
)

type Route struct {
	ID        string
	ClientID  string
	Positions []Position
}

type Position struct {
	Lat float64
	Lon float64
}

func (r *Route) LoadPositions() error {
	if r.ID == EMPTY_STRING {
		return errors.New("route id not informed")
	}
	f, err := os.Open("./destinations/" + r.ID + ".txt")
	// Remember that plus operator has bad performance. It's fine here though.
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		data := strings.Split(scanner.Text(), ",")
		lat, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			return err
		}
		lon, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			return err
		}
		r.Positions = append(r.Positions, Position{
			Lat: lat,
			Lon: lon,
		})
	}
	return nil
}

func (r *Route) PrintPositions() error {
	if r == nil || r.ID == EMPTY_STRING || r.Positions == nil {
		return errors.New("route not properly initialized")
	}
	fmt.Println("Route + r.ID")
	for _, v := range r.Positions {
		fmt.Printf("{ lat: %f, lon: %f }\n", v.Lat, v.Lon)
	}
	return nil
}
