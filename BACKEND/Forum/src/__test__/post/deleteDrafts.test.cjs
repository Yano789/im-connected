jest.mock("./../../domains/post/model.cjs");


const mockDelete = jest.fn().mockResolvedValue();

jest.mock("../../config/googleConfig.cjs", () => ({
  gcsClient: {
    bucket: {
      file: jest.fn(() => ({
        delete: mockDelete,
      })),
    },
  },
  url: jest.fn().mockImplementation(async (publicId) => {
    return `http://example.com/${publicId}.jpg`;
  }),
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

 expect(mockDelete).toHaveBeenCalledTimes(2);
const { gcsClient } = require("../../config/googleConfig.cjs");
expect(gcsClient.bucket.file).toHaveBeenCalledWith("media1");
expect(gcsClient.bucket.file).toHaveBeenCalledWith("media2");

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
