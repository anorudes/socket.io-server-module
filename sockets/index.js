import Socket from '../modules/socket';

export function socketEvents(client) {
  let session = null;

  const emit = (event, data, enableQueue) => {
    Socket.emit(session, event, data, enableQueue);
  };

  client.on('register', ({ token }) => {
    session = token;
    Socket.register(session, client);
  });

  client.on('disconnect', () => {
    Socket.disconnect(session, client);
  });
}
