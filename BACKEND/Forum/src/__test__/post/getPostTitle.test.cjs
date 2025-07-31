jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

const { getPostByTitle } = require("../../domains/post/controller.cjs");

describe("getPostByTitle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a post matching the title", async () => {
    const mockPost = {
      postId: "p1",
      title: "Test Post",
      content: "This is a test.",
      draft: false,
    };

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: null } }),
    });

    Post.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockPost),
    });

    const result = await getPostByTitle({ title: "Test Post", username: "user1" });

    expect(Post.findOne).toHaveBeenCalledWith({ title: "Test Post", draft: false });
    expect(result).toEqual(mockPost);
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
