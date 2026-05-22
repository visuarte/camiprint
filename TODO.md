- [ ] Understand failures in e2e test environment (BASE_URL malformed / wrong fetch URLs)
- [ ] Patch __tests__/e2e.test.ts to consistently use baseUrlWithProtocol for all fetch calls
- [ ] Ensure no leftover references to BASE_URL without protocol
- [ ] Run `npm test -- __tests__/e2e.test.ts` and verify improvements

