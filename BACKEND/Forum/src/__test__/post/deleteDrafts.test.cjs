jest.mock("./../../domains/post/model.cjs")

const { Post} = require("../../domains/post/model.cjs")

const {deleteDrafts } = require("../../domains/post/controller.cjs")


describe("deleteDrafts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should delete and return the draft for given username and postId", async () => {
    const mockDraft = { postId: "draft1", username: "user1", draft: true, media: [] };

    // Mock findOne to return the draft
    Post.findOne.mockResolvedValue(mockDraft);
    // Mock deleteOne to simulate deletion
    Post.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteDrafts({ username: "user1", postId: "draft1" });

    expect(Post.findOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true,
    });

    expect(Post.deleteOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true,
    });

    expect(result).toEqual(mockDraft);
  });

  test("should throw error if draft does not exist", async () => {
    Post.findOne.mockResolvedValue(null);

    await expect(deleteDrafts({ username: "user1", postId: "draft1" })).rejects.toThrow(
      "Draft does not exist"
    );

    expect(Post.findOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true,
    });
  });
});