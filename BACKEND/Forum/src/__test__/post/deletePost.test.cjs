jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../domains/savedPosts/model.cjs");


const mockDelete = jest.fn().mockResolvedValue();

jest.mock("../../config/gcsStorage.cjs", () => ({
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
const Comment = require("../../domains/comment/model.cjs");
const savedPost = require("../../domains/savedPosts/model.cjs");

const { deletePost } = require("../../domains/post/controller.cjs");

describe("deleting post", () => {
  const mockData = {
    postId: "123",
    username: "username"
  };
  const fixedTime = 1752934590239;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("successfully delete post without media", async () => {
    const mockPost = {
      postId: "123",
      title: "title",
      content: "content",
      tags: ["Mental Disability"],
      username: "username",
      createdAt: fixedTime,
      edited: false,
      draft: false,
      comments: 0,
      likes: 0,
      media: []
    };

    Post.findOne.mockResolvedValueOnce(mockPost);
    Post.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    Comment.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });
    savedPost.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const result = await deletePost(mockData);

    expect(Post.findOne).toHaveBeenCalledWith({ postId: "123" });
    expect(Post.deleteOne).toHaveBeenCalledWith({ postId: "123", draft: false });
    expect(Comment.deleteMany).toHaveBeenCalledWith({ postId: "123" });
    expect(savedPost.deleteMany).toHaveBeenCalledWith({ savedPostId: "123" });

    expect(mockDelete).not.toHaveBeenCalled(); // no media, so no destroy calls

    expect(result).toEqual(mockPost);
  });

  test("successfully delete post with media and calls Google Cloud Storage destroy", async () => {
    const mockPostWithMedia = {
      postId: "123",
      username: "username",
      draft: false,
      media: [
        { public_id: "media1", type: "image" },
        { public_id: "media2", type: "video" }
      ]
    };

    Post.findOne.mockResolvedValueOnce(mockPostWithMedia);
    Post.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    Comment.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });
    savedPost.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const result = await deletePost(mockData);

    expect(Post.findOne).toHaveBeenCalledWith({ postId: "123" });
    expect(mockDelete).toHaveBeenCalledTimes(2);
    const { gcsClient } = require("../../config/gcsStorage.cjs");
    expect(gcsClient.bucket.file).toHaveBeenCalledWith("media1");
    expect(gcsClient.bucket.file).toHaveBeenCalledWith("media2");

    expect(Post.deleteOne).toHaveBeenCalledWith({ postId: "123", draft: false });
    expect(Comment.deleteMany).toHaveBeenCalledWith({ postId: "123" });
    expect(savedPost.deleteMany).toHaveBeenCalledWith({ savedPostId: "123" });

    expect(result).toEqual(mockPostWithMedia);
  });

  test("throws error if post not found", async () => {
    Post.findOne.mockResolvedValueOnce(null);

    await expect(deletePost(mockData)).rejects.toThrow("Post does not exist");

    expect(Post.findOne).toHaveBeenCalledWith({ postId: "123" });
  });

  test("throws error if user is unauthorized", async () => {
    const mockPost = {
      postId: "post123",
      username: "otherUser",
      draft: false
    };

    Post.findOne.mockResolvedValueOnce(mockPost);

    await expect(deletePost(mockData)).rejects.toThrow("Unauthorized");
  });
});
