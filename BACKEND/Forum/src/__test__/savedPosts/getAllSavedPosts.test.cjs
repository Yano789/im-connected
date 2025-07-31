jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../domains/savedPosts/model.cjs");

const savedPost = require("./../../domains/savedPosts/model.cjs");
const { Post } = require("./../../domains/post/model.cjs");

const { getAllSavedPosts } = require("./../../domains/savedPosts/controller.cjs");

describe("getAllSavedPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return all saved posts for a valid user", async () => {
    const savedPostsMock = [
      { savedPostId: "p1" },
      { savedPostId: "p2" },
      { savedPostId: "p3" }
    ];

    const postsMock = [
      { postId: "p1", title: "Post 1" },
      { postId: "p2", title: "Post 2" },
      { postId: "p3", title: "Post 3" }
    ];

    savedPost.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(savedPostsMock)
      })
    });

    Post.find.mockResolvedValue(postsMock);

    const result = await getAllSavedPosts("user1");

    expect(savedPost.find).toHaveBeenCalledWith({ username: "user1" });
    expect(Post.find).toHaveBeenCalledWith({
      postId: { $in: ["p1", "p2", "p3"] }
    });

    expect(result).toEqual(postsMock);
  });

  test("should return empty array if no saved posts found", async () => {
    savedPost.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      })
    });

    const result = await getAllSavedPosts("user1");

    expect(result).toEqual([]);
  });

});
