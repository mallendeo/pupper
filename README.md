# Pupper
Raspberry Pi's GPIO control made easy.

Pupper allows you to create simple REST APIs for control your Raspberry Pi pins.
It has websockets support for real-time gpio change events (like button presses, or sensors).

Currently only tested on ArchLinux ARM with Node 6.5.

## Install

```bash
git clone https://github.com/mallendeo/pupper
cd pupper
npm i

# Set environment variables
# AUTH_KEY = $3cret
# PORT = 8080
# NODE_ENV = development
AUTH_KEY='$ecret' PORT=8080 NODE_ENV=development node ./
```

## Fix permissions
By default the rpio module will use /dev/gpiomem when using simple GPIO access.
To access this device, your user will need to be a member of the gpio group.

Create the group and add your user:

```bash
groupadd -f -r gpio
usermod -G gpio username
```

Then you need to configure udev with the following rule:

```bash
cat >/etc/udev/rules.d/20-gpiomem.rules <<EOF
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
npm i -g nodemon
NODE_ENV=development DEBUG="pupper" AUTH_KEY="$3cret" nodemon
```

## Test

*TODO...*

# License

MIT
