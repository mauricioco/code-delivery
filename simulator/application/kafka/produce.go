package kafka // TODO: refactor these package names... they are bound to cause confusion.

import (
	"encoding/json"
	"log"
	"os"
	"time"

	gokafka "github.com/confluentinc/confluent-kafka-go/kafka"
	. "github.com/mauricioco/imersaofsfc2-simulator/application/constants"
	. "github.com/mauricioco/imersaofsfc2-simulator/application/route"
	"github.com/mauricioco/imersaofsfc2-simulator/infra/kafka"
)

func Produce(msg *gokafka.Message) {
	producer := kafka.NewKafkaProducer()
	route := NewRoute()
	json.Unmarshal(msg.Value, &route)
	err := route.LoadPositions()
	if err != nil {
		log.Println((err.Error()))
	}
	positions, err := route.ExportJsonPositions()
	if err != nil {
		log.Println((err.Error()))
	}
	produceTopic := os.Getenv("KAFKA_PRODUCE_TOPIC")
	for _, v := range positions {
		kafka.Publish(v, produceTopic, producer)
		time.Sleep(time.Millisecond * TIME_TO_SEND_POSITIONS)
	}
}
