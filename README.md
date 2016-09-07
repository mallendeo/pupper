# alarmpi
Home automation with Node and Raspberry Pi.

Tested on ArchLinux ARM with Node 6.5.

## Install

```bash
git clone https://github.com/mallendeo/alarmpi
cd alarmpi
npm i

# Set environment variables
# AUTH_KEY = $3cret
# PORT = 8080
# NODE_ENV = development
sudo AUTH_KEY='$ecret' PORT=8080 NODE_ENV=development node ./
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

Copy files to Raspberry Pi
```bash
rsync -a "$HOME/Desktop/alarmpi" username@host:~/ --exclude node_modules -P

# Specify a ssh key
rsync -a "$HOME/Desktop/alarmpi" username@host:~/ -e "ssh -i $HOME/.ssh/raspberry" --exclude node_modules -P
``` 

SSH into the rPI, then:
```bash
npm i -g nodemon
NODE_ENV=development DEBUG="alarmpi" AUTH_KEY="$3cret" nodemon
```

# Pin Configuration

<table>
	<tr>
        <td></td>
		<td>P1 - 3.3v</td>
		<td>1</td>
		<td>2</td>
		<td>5v</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>I2C SDA</td>
		<td>3</td>
		<td>4</td>
		<td>5v</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>I2C SCL</td>
		<td>5</td>
		<td>6</td>
		<td>Ground</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>7</td>
		<td>8</td>
		<td>TX</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>Ground</td>
		<td>9</td>
		<td>10</td>
		<td>RX</td>
        <td></td>
	</tr>
	<tr>
		<td>Intercom Button</td>
		<td>GPIO</td>
		<td>11</td>
		<td>12</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td>Magnetic Sensor</td>
		<td>GPIO</td>
		<td>13</td>
		<td>14</td>
		<td>Ground</td>
        <td></td>
	</tr>
	<tr>
        <td>Proximity Sensor</td>
		<td>GPIO</td>
		<td>15</td>
		<td>16</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>3.3v</td>
		<td>17</td>
		<td>18</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>SPI MOSI</td>
		<td>19</td>
		<td>20</td>
		<td>Ground</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>SPI MISO</td>
		<td>21</td>
		<td>22</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>SPI SCLK</td>
		<td>23</td>
		<td>24</td>
		<td>SPI CE0</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>Ground</td>
		<td>25</td>
		<td>26</td>
		<td>SPI CE1</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>ID_SD</td>
		<td>27</td>
		<td>28</td>
		<td>ID_SC</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>29</td>
		<td>30</td>
		<td>Ground</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>31</td>
		<td>32</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>33</td>
		<td>34</td>
		<td>Ground</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>35</td>
		<td>36</td>
		<td>GPIO</td>
        <td></td>
	</tr>
	<tr>
        <td></td>
		<td>GPIO</td>
		<td>37</td>
		<td>38</td>
		<td>GPIO</td>
        <td>Gate Relay</td>
	</tr>
	<tr>
        <td></td>
		<td>Ground</td>
		<td>39</td>
		<td>40</td>
		<td>GPIO</td>
        <td>Door Relay</td>
	</tr>
</table>

## Test

*TODO...*

# License

MIT
