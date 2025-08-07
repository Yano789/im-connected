jest.mock("./../../domains/post/model.cjs");


const mockDestroy = jest.fn().mockResolvedValue({ result: "ok" });

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      destroy: mockDestroy
    }
  }
}));

const { Post } = require("../../domains/post/model.cjs");
const { deleteDrafts } = require("../../domains/post/controller.cjs");

describe("deleteDrafts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should delete and return the draft for given username and postId", async () => {
    const mockDraft = {
      postId: "draft1",
      username: "user1",
      draft: true,
      media: [
        { public_id: "media1", type: "image" },
        { public_id: "media2", type: "video" }
      ]
    };

    Post.findOne.mockResolvedValue(mockDraft);
    Post.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteDrafts({ username: "user1", postId: "draft1" });

    expect(Post.findOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true
    });

    expect(mockDestroy).toHaveBeenCalledTimes(2);
    expect(mockDestroy).toHaveBeenCalledWith("media1", { resource_type: "image" });
    expect(mockDestroy).toHaveBeenCalledWith("media2", { resource_type: "video" });

    expect(Post.deleteOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "draft1",
      draft: true
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
      draft: true
    });
  });
});
