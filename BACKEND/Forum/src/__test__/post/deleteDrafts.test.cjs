jest.mock("./../../domains/post/model.cjs")

const { Post} = require("../../domains/post/model.cjs")

const {deleteDrafts } = require("../../domains/post/controller.cjs")


describe("deleteDrafts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should delete and return the draft for given username and postId", async () => {
    const mockDeletedDraft = { postId: "draft1", username: "user1", draft: true };

    Post.findOneAndDelete.mockResolvedValue(mockDeletedDraft);

    const result = await deleteDrafts({ username: "user1", postId: "draft1" });

    expect(Post.findOneAndDelete).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true,
    });
    expect(result).toEqual(mockDeletedDraft);
  });

  test("should throw error if findOneAndDelete throws", async () => {
    Post.findOneAndDelete.mockRejectedValue(new Error("DB error"));

    await expect(
      deleteDrafts({ username: "user1", postId: "draft1" })
    ).rejects.toThrow("DB error");
  });
});