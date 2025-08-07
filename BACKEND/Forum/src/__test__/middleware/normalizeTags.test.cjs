const normalizeTagsMiddleware = require("./../../middleware/normalizeTags.cjs")

describe("normalizeTagsMiddleware", () => {
  let req;
  let res;
  const next = jest.fn();

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next.mockClear();
  });

  test("should convert comma-separated string to array", () => {
    req.body.tags = "tag1, tag2,tag3 ,, tag4";

    normalizeTagsMiddleware(req, res, next);

    expect(req.body.tags).toEqual(["tag1", "tag2", "tag3", "tag4"]);
    expect(next).toHaveBeenCalled();
  });

  test("should keep tags as array if already an array", () => {
    req.body.tags = ["tag1", "tag2"];

    normalizeTagsMiddleware(req, res, next);

    expect(req.body.tags).toEqual(["tag1", "tag2"]);
    expect(next).toHaveBeenCalled();
  });

  test("should set tags to empty array if type is invalid (number)", () => {
    req.body.tags = 123;

    normalizeTagsMiddleware(req, res, next);

    expect(req.body.tags).toEqual([]);
    expect(next).toHaveBeenCalled();
  });

  test("should set tags to empty array if tags is undefined", () => {
    // req.body.tags is not set
    normalizeTagsMiddleware(req, res, next);

    expect(req.body.tags).toEqual([]);
    expect(next).toHaveBeenCalled();
  });

  test("should filter out empty strings", () => {
    req.body.tags = "tag1, , , tag2";

    normalizeTagsMiddleware(req, res, next);

    expect(req.body.tags).toEqual(["tag1", "tag2"]);
    expect(next).toHaveBeenCalled();
  });
});