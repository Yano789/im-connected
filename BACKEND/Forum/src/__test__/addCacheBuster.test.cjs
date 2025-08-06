const addCacheBuster = require("./../utils/cacheBuster.cjs")

describe("addCacheBuster", () => {
  const fixedTimestamp = 1752934590239;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedTimestamp);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should return original value if URL is falsy", () => {
    expect(addCacheBuster(null)).toBe(null);
    expect(addCacheBuster(undefined)).toBe(undefined);
    expect(addCacheBuster("")).toBe("");
  });

  test("should append cache buster if URL has no query params", () => {
    const url = "http://example.com/image.jpg";
    const result = addCacheBuster(url);
    expect(result).toBe(`${url}?cb=${fixedTimestamp}`);
  });

  test("should append cache buster with '&' if URL already has query params", () => {
    const url = "http://example.com/image.jpg?size=large";
    const result = addCacheBuster(url);
    expect(result).toBe(`${url}&cb=${fixedTimestamp}`);
  });
});