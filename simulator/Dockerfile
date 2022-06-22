#TODO multistage build! This build takes forever but it works for now...
#run with docker-compose build
FROM golang:1.18.3
WORKDIR /go/src/
ENV PATH="go/bin:${PATH}"
COPY . .
RUN ls
RUN go get -d -v ./...
RUN go run main.go

#RUN apt-get update && \
	#apt-get install build-essential librdkafka-dev -y
