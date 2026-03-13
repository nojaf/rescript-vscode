SHELL = /bin/bash

fmt:
	bunx oxfmt --write .

format:
	bunx oxfmt --write .

checkformat:
	bunx oxfmt --check .

.PHONY: format checkformat
