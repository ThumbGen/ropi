import uuid

import redis

from socketio.base_manager import BaseManager
from socketio import packet


class RedisManager(BaseManager):
    def __init__(self, server, **kwargs):
        super(RedisManager, self).__init__(server)
        url = kwargs.get('url', 'redis://localhost:6379/0')
        self.channel = kwargs.get('channel', 'python-socketio')
        self.exit_message = uuid.uuid4().hex()
        self.redis = redis.StrictRedis.from_url(url)
        self.listener = server._start_background_task(self._redis_listener)
        self.listener.start()

    def close_room(self, namespace, room):
        """Remove all participants from a room."""
        super(RedisManager, self).close_room(namespace, room)
        self.redis.publish(self.channel, packet.Packet(
            packet.EVENT, data=['close_room', room],
            namespace=namespace).encode())

    def emit(self, event, data, namespace, room=None, skip_sid=None,
             callback=None):
        """Emit a message to a single client, a room, or all the clients
        connected to the namespace."""
        super(RedisManager, self).emit(event, data, namespace, room=room,
                                       skip_sid=skip_sid, callback=callback)
        # TODO: support callbacks
        self.redis.publish(self.channel, packet.Packet(
            packet.EVENT, data=['emit', event, data, room, skip_sid],
            namespace=namespace).encode())

    def exit(self):
        """Stop the background thread."""
        self.redis.publish(self.exit_message)
        self.listener.join()

    def _redis_listener(self):
        self.redis.subscribe(self.channel)
        for item in self.redis.listen():
            if item == self.exit_message:
                break
            pkt = packet.Packet(encoded_packet=item)

        self.redis.unsubscribe()
