# yify-react
A simple react app that shows info from the yify api.

Please know that this was a test of using real life apis. Don't pirate movies.

---

## Setup

### Server
There is not a specific way to actually host the server. You can host the `/build` folder with something like nginx. Since the project is static (only does CRUD), any http server will do.
```
git clone https://github.com/amcolash/yify-react.git
cd yify-react
npm install
npm run build
```

### Peerflix Daemon (Or Docker, read below)
For the peerflix server, I just used pm2 to keep it alive.
```
npm install -g peerflix-server pm2
pm2 startup
pm2 start peerflix-server
pm2 save
```

### Docker + VPN
The below setup will get you going with some prebuilt docker images:
- [openvpn-client](https://github.com/dperson/openvpn-client)
- [peerflix-server](https://github.com/asapach/peerflix-server)

Note: the copy of the "config" folder is the ovpn + crt config files for openvpn into the vpn instance.
```
docker run -it --cap-add=NET_ADMIN --device /dev/net/tun --name vpn --restart unless-stopped -d dperson/openvpn-client
docker cp config vpn:/vpn/
docker restart vpn
docker run -p 9000:9000 -p 6881:6881 -p 6881:6881/udp --link=vpn --name=peerflix --restart unless-stopped -d -v /tmp/torrent-stream:/tmp/torrent-stream asapach/peerflix-server
```

---

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).