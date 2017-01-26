import { findSessions } from '../sequelize/requests';
import winston from 'winston';

const Socket = {
  clients: {},

  // Register client
  register(session, client, userId) {
    if (!this.clients[session]) {
      this.clients[session] = {
        list: {},
        userId,
      };
    }

    this.clients[session].list[client.id] = client;
  },

  // Client disconnected
  disconnect(session, client) {
    let clientsCount;

    if (this.clients[session] && this.clients[session].list) {
      delete this.clients[session].list[client.id];
      clientsCount = Object.keys(this.clients[session].list).length;
    }

    if (!clientsCount) {
      delete this.clients[session];
    }
  },

  // Emit event
  emit(session, event, data) {
    if (this.clients[session] && this.clients[session].list) {
      Object.keys(this.clients[session].list).map(client => {
        winston.info(`Emit to client with token ${session}`);
        this.clients[session].list[client].emit(event, data);
      });
    }
  },

  emitByUserId(userId, event, data) {
    findSessions('userId', userId).then(sessions => {
      if (sessions) {
        sessions.map(session => {
          if (this.clients[session.token] && this.clients[session.token].list) {
            Object.keys(this.clients[session.token].list).map(client => {
              winston.info(`Emit to client with token ${session.token}`);
              this.clients[session.token].list[client].emit(event, data);
            });
          }
        });
      }
    });
  },
};

export default Socket;
