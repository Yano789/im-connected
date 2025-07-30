jest.mock("./../../domains/likes/model.cjs")
jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/user/model.cjs")



const likedPost = require("./../../domains/likes/model.cjs")
const { Post } = require("./../../domains/post/model.cjs")
const User = require("./../../domains/user/model.cjs")

const { getAlllikedPosts } = require("./../../domains/likes/controller.cjs")

describe("getAlllikedPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return all liked posts for a valid user", async () => {
    const likedPostsMock = [
      { likedPostId: "p1" },
      { likedPostId: "p2" },
      { likedPostId: "p3" }
    ];

    const postsMock = [
      { postId: "p1", title: "Post 1" },
      { postId: "p2", title: "Post 2" },
      { postId: "p3", title: "Post 3" }
    ];

    likedPost.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(likedPostsMock)
      })
    });

    Post.find.mockResolvedValue(postsMock);

    const result = await getAlllikedPosts("user1");

    expect(likedPost.find).toHaveBeenCalledWith({ username: "user1" });
    expect(Post.find).toHaveBeenCalledWith({
      postId: { $in: ["p1", "p2", "p3"] }
    });

    expect(result).toEqual(postsMock);
  });

  test("should return empty array if no liked posts found", async () => {
    likedPost.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      })
    });

    const result = await getAlllikedPosts("user1");

    expect(result).toEqual([]);
    expect(Post.find).not.toHaveBeenCalled();
  });
});