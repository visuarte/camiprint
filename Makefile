.PHONY: dev check gui-test predictive incidents lint build

dev:
	npm run dev

lint:
	npm run lint

build:
	npm run build

check: lint build
	node scripts/smoke-test.mjs

gui-test:
	npx playwright test --project=desktop-chrome tests/e2e/contact-form-mobile.smoke.spec.ts

predictive:
	@echo "=== Predictive monitoring ==="
	curl -s https://camiprint.vercel.app/api/v1/health | python -m json.tool

incidents:
	@echo "=== Recent incidents ==="
	curl -s https://camiprint.vercel.app/api/incidents 2>/dev/null || echo "No incidents endpoint or empty"
