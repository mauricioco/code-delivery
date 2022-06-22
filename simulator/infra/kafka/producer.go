package kafka

import (
	"log"
	"os"

	gokafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

func NewKafkaProducer() *gokafka.Producer {
	configMap := &gokafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_BOOTSTRAP_SERVERS"),
	}
	p, err := gokafka.NewProducer(configMap)
	if err != nil {
		log.Println(err.Error())
	}
	return p
}

func NewKafkaConsumer(msgChan chan *gokafka.Message) *KafkaConsumer {
	return &KafkaConsumer{
		MsgChan: msgChan,
	}
}

func Publish(msg string, topic string, producer *gokafka.Producer) error {
	message := &gokafka.Message{
		TopicPartition: gokafka.TopicPartition{Topic: &topic, Partition: int32(gokafka.PartitionAny)},
		Value:          []byte(msg),
	}
	err := producer.Produce(message, nil)
	if err != nil {
		return err
	}
	return nil
}
