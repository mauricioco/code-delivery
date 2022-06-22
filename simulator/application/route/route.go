package route

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	. "github.com/mauricioco/imersaofsfc2-simulator/application/constants"
)

type Route struct {
	ID        string     `json:"routeId"`
	ClientID  string     `json:"clientId"`
	Positions []Position `json:"position"`
}

type Position struct {
	Lat  float64 `json:"lat"`
	Long float64 `json:"long"`
}

type PartialRoutePosition struct {
	ID       string    `json:"routeId"`
	ClientID string    `json:"clientId"`
	Position []float64 `json:"position"`
	Finished bool      `json:"finished"`
}

func NewRoute() *Route {
	return &Route{}
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
		lon, err := strconv.ParseFloat(data[1], 64)
		if err != nil {
			return err
		}
		r.Positions = append(r.Positions, Position{
			Lat:  lat,
			Long: lon,
		})
	}
	return nil
}

func (r *Route) ExportJsonPositions() ([]string, error) {
	var (
		route  PartialRoutePosition // saves memory by storing the values in the same var every time.
		result []string
	)
	total := len(r.Positions)
	for i, v := range r.Positions {
		route.ID = r.ID
		route.ClientID = r.ClientID
		route.Position = []float64{v.Lat, v.Long}
		route.Finished = false
		if total-1 == i {
			route.Finished = true
		}
		jsonRoute, err := json.Marshal(route)
		if err != nil { // if inside a loop is not good performance-wise. But performance is not required right now.
			return nil, err
		}
		result = append(result, string(jsonRoute))
	}
	return result, nil
}

func (r *Route) PrintPositions() error {
	if r == nil || r.ID == EMPTY_STRING || r.Positions == nil {
		return errors.New("route not properly initialized")
	}
	fmt.Println("Route + r.ID")
	for _, v := range r.Positions {
		fmt.Printf("{ lat: %f, lon: %f }\n", v.Lat, v.Long)
	}
	return nil
}
