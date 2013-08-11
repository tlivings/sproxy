tests : test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(TESTS)

.PHONY: test

TESTS = ./test/*.js

REPORTER = dot