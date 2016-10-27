# Pupper 🐶
Control your Pi's GPIO pins through a simple REST API.
It has websockets support for real-time gpio change events (like button presses, or sensors).

## Install

Install cmake (rpio)

```bash
# macOS
brew install cmake

# ArchLinux
sudo pacman -Sy base-devel cmake

# Ubuntu/Debian
sudo apt install build-essential cmake
```

Clone the repository and build
```bash
git clone https://github.com/mallendeo/pupper
cd pupper
npm i && npm run build
```

Set environment variables and run
```bash
JWT_SECRET=secret PORT=8080 NODE_ENV=development npm start
```

## Fix permissions
By default the rpio module will use /dev/gpiomem when using simple GPIO access.
To access this device, your user will need to be a member of the gpio group.

Create the group and add your user:

```bash
sudo groupadd -f -r gpio
sudo usermod -G gpio username
```

Then you need to configure udev with the following rule:

```bash
sudo cat >/etc/udev/rules.d/20-gpiomem.rules <<EOF
SUBSYSTEM=="bcm2835-gpiomem", KERNEL=="gpiomem", GROUP="gpio", MODE="0660"
EOF
```

# Development

Copy files to the Pi
```bash
rsync -a "$HOME/pupper" username@host:~/ --exclude node_modules -P

# With a ssh key
rsync -a "$HOME/pupper" username@host:~/ -e "ssh -i $HOME/.ssh/raspberry" --exclude node_modules -P
``` 

SSH into the Pi, then:

```bash
JWT_SECRET=secret DEBUG="pupper*" npm run watch
```

## Test

npm test

## TODO

Update tests...

# License

MIT
