# yify-react
A simple react app that shows info from the yify api.

Please know that this was a test of using real life apis. Don't pirate movies.

---

## Setup

### Peerflix Daemon
For the peerflix server, I just used pm2 to keep it alive.
```
npm install -g peerflix-server pm2
pm2 startup
pm2 start peerflix-server
pm2 save
```

### Server
There is not a specific way to actually host the server. You can host the `/build` folder with something like nginx.
```
git clone https://github.com/amcolash/yify-react.git
cd yify-react
npm install
npm run build
```


---

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).