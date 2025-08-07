jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../config/googleConfig.cjs", () => ({
  gcsClient: {
    url: jest.fn(async (publicId) => `http://example.com/${publicId}.jpg`),
  },
}));

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

const { searchPosts } = require("../../domains/post/controller.cjs");

describe("searchPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock User.findOne to resolve a user with no preferred language
    User.findOne.mockReturnValue({
      lean: () => Promise.resolve({ preferences: { preferredLanguage: null } }),
    });

    // Default mock translate to just return the input text (identity)
    translate.mockImplementation(async (text, lang) => text);
  });

  test("should return matching posts by title (case-insensitive, partial)", async () => {
    const mockPosts = [
      { postId: "1", title: "Hello World" },
      { postId: "2", title: "hello universe" },
    ];

    Post.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockPosts),
    });

    const results = await searchPosts({ search: "hello", username: "testuser" });

    expect(Post.find).toHaveBeenCalledWith({
      title: expect.any(Object),
      draft: false,
    });
    expect(results).toEqual(mockPosts);
  });

  test("should return an empty array for non-matching search", async () => {
    Post.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const results = await searchPosts({ search: "nomatch", username: "testuser" });

    expect(results).toEqual([]);
  });

  test("should return empty array if search is invalid", async () => {
    expect(await searchPosts(null)).toEqual([]);
    expect(await searchPosts(undefined)).toEqual([]);
    expect(await searchPosts({})).toEqual([]);
    expect(await searchPosts(123)).toEqual([]);
  });

  test("should translate post titles and content if preferred language exists", async () => {
    User.findOne.mockReturnValue({
      lean: () => Promise.resolve({ preferences: { preferredLanguage: "es" } }),
    });

    const mockPosts = [
      { postId: "1", title: "Hello World", content: "Content A" },
    ];

    Post.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockPosts),
    });

    translate.mockImplementation(async (text, lang) => `translated: ${text}`);

    const results = await searchPosts({ search: "hello", username: "testuser" });

    expect(translate).toHaveBeenCalledWith("Hello World", "es");
    expect(results).toEqual([
      { postId: "1", title: "translated: Hello World" },
    ]);
  });
});
