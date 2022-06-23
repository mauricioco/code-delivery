package main

import (
	"fmt"
	"log"

	gokafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/joho/godotenv"

	akafka "github.com/mauricioco/imersaofsfc2-simulator/application/kafka"
	. "github.com/mauricioco/imersaofsfc2-simulator/application/route"
	ikafka "github.com/mauricioco/imersaofsfc2-simulator/infra/kafka"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func testRouteLoading() {
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

func main() {
	msgChan := make(chan *gokafka.Message)
	consumer := ikafka.NewKafkaConsumer(msgChan)
	go consumer.Consume()

	// TODO: does this loop eat a lot of cpu usage?
	for msg := range msgChan {
		fmt.Println(string(msg.Value))
		go akafka.Produce(msg)
	}
}
