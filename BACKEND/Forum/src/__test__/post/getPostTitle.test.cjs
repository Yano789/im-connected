jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../config/gcsStorage.cjs", () => ({
  gcsClient: {
    url: jest.fn(async (publicId) => `http://example.com/${publicId}.jpg`),
  },
}));

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

const { getPostByTitle } = require("../../domains/post/controller.cjs");

describe("getPostByTitle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    translate.mockImplementation(async (text, lang) => `${text} [${lang}]`);
  });

  test("should return a post matching the title", async () => {
    const mockPost = {
      postId: "p1",
      title: "Test Post",
      content: "This is a test.",
      draft: false,
    };

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: "es" } }),
    });

    Post.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockPost),
    });

    const result = await getPostByTitle({ title: "Test Post", username: "user1" });

    expect(Post.findOne).toHaveBeenCalledWith({ title: "Test Post", draft: false });
    expect(result.title).toBe("Test Post [es]");
    expect(result.content).toBe("This is a test. [es]");
  });

  test("should return null if post not found", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: null } }),
    });

    Post.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const result = await getPostByTitle({ title: "Nonexistent Title", username: "user1" });

    expect(Post.findOne).toHaveBeenCalledWith({ title: "Nonexistent Title", draft: false });
    expect(result).toBeNull();
  });
});
