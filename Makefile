SHELL = /bin/bash

format:
	npx prettier --write --experimental-cli .

checkformat:
	npx prettier --check --experimental-cli .

.PHONY: format checkformat
