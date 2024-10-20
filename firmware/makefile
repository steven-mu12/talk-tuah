# Makefile

# dependencies + toolchain
CC = gcc
CFLAGS = -Wall
LDFLAGS = -lportaudio -lmp3lame -lpthread

# sources
SRC = drivers/audio/capture.c

# outputs
OUT = build/capture
# target
all: $(OUT)

# actual rule
$(OUT): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(OUT) $(LDFLAGS)

# make clean
clean:
	rm -f $(OUT)

