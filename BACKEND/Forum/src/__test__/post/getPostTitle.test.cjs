jest.mock("./../../domains/post/model.cjs")

const { Post} = require("../../domains/post/model.cjs")

const {getPostByTitle} = require("../../domains/post/controller.cjs")

describe("getPostByTitle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a post matching the title", async () => {
    const mockPost = {
      postId: "p1",
      title: "Test Post",
      content: "This is a test.",
    };

    Post.findOne.mockResolvedValue(mockPost);

    const result = await getPostByTitle("Test Post");

    expect(Post.findOne).toHaveBeenCalledWith({
      title: "Test Post",
      draft: false,
    });

    expect(result).toEqual(mockPost);
  });

  test("should return null if post not found", async () => {
    Post.findOne.mockResolvedValue(null);

    const result = await getPostByTitle("Nonexistent Title");

    expect(Post.findOne).toHaveBeenCalledWith({
      title: "Nonexistent Title",
      draft: false,
    });

    expect(result).toBeNull();
  });
});