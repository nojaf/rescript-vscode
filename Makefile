SHELL = /bin/bash

format:
	bunx prettier --write --experimental-cli .

checkformat:
	bunx prettier --check --experimental-cli .

.PHONY: format checkformat
