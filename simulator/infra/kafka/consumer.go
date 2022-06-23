package kafka

import (
	"log"
	"os"

	gokafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

type KafkaConsumer struct {
	MsgChan chan *gokafka.Message
}

func (kc *KafkaConsumer) Consume() {
	configMap := &gokafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BOOTSTRAP_SERVERS"),
		"group.id":          os.Getenv("KAFKA_CONSUMER_GROUP_ID"),
	}
	c, err := gokafka.NewConsumer(configMap)
	if err != nil {
		log.Fatalf("error consuming kafka message:" + err.Error())
	}
	topics := []string{os.Getenv("KAFKA_READ_TOPIC")}
	c.SubscribeTopics(topics, nil)
	log.Println("Kafka consumer has been started. Hooray!")
	for {
		msg, err := c.ReadMessage(-1)
		if err == nil {
			kc.MsgChan <- msg
		}
	}
}
