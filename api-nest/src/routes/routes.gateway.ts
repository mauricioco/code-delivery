import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RoutesGateway implements OnModuleInit {
  private kafkaProducer: Producer;

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('KAFKA_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  async connectKafkaProducer() {
    this.kafkaProducer = await this.kafkaClient.connect();
  }

  async onModuleInit() {
    // For some reason this was not working... .connect was returning null.
    //this.kafkaProducer = await this.kafkaClient.connect();
  }

  @SubscribeMessage('new-direction')
  handleMessage(client: Socket, payload: { routeId: string }) {
    this.kafkaProducer.send({
      topic: 'route.new-direction',
      messages: [
        {
          key: 'route.new-direction',
          value: JSON.stringify({
            routeId: payload.routeId,
            clientId: client.id,
          }),
        },
      ],
    });
    console.log(payload);
  }

  async sendPosition(data: {
    clientId: string;
    routeId: string;
    position: [number, number];
    finished: boolean;
  }) {
    // TODO: Had to change the way to emit event because of different lib version.
    // .allSockets and .to() were found researching on google.
    // Not sure if this is the best way but it works for now.
    const { clientId, ...rest } = data;
    const clients = await this.server.sockets.allSockets();
    if (!clients.has(clientId)) {
      console.error(
        'Client not found. Refresh React Application and try again.',
      );
      return;
    }
    this.server.sockets.to(clientId).emit('new-position', rest);
  }
}
