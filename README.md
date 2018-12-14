# QKeyboard

A setup for the Das Keyboard 5Q

## Getting Started

1. Install dependencies

```
npm i
```

2. Verify you have the Das Keyboard listener running

```
lsof -i :27301

# This should output an entry resembling...

COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Das\x20Ke 682 nick   17u  IPv4 0x3642e535a510b5a3      0t0  TCP localhost:27301 (LISTEN)
```

3. Set your environment variables

```
cp env/base.env .env

# Then open .env and edit the values to match your own
```

4. Run the script

```
npm start
```
