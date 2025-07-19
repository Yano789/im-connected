jest.mock("./../../domains/post/model.cjs")


const { Post} = require("../../domains/post/model.cjs")

const { likePosts} = require("../../domains/post/controller.cjs")



describe("likePosts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should increment likes when like === 'like'", async () => {
    const mockPost = { postId: "post123", likes: 11 };

    Post.findOne.mockResolvedValue(mockPost);
    Post.updateOne.mockResolvedValue({});

    const result = await likePosts({ like: "like", postId: "post123" });

    expect(Post.updateOne).toHaveBeenCalledWith(
      { postId: "post123", draft: false },
      { $inc: { likes: 1 } }
    );
    expect(Post.findOne).toHaveBeenCalledWith({ postId: "post123" });
    expect(result).toEqual(mockPost);
  });

  test("should decrement likes when like !== 'like'", async () => {
    const mockPost = { postId: "post123", likes: 9 };

    Post.findOne.mockResolvedValue(mockPost);
    Post.updateOne.mockResolvedValue({});

    const result = await likePosts({ like: "dislike", postId: "post123" });

    expect(Post.updateOne).toHaveBeenCalledWith(
      { postId: "post123", draft: false },
      { $inc: { likes: -1 } }
    );
    expect(Post.findOne).toHaveBeenCalledWith({ postId: "post123" });
    expect(result).toEqual(mockPost);
  });

  it("should throw an error if Post.updateOne throws", async () => {
    Post.updateOne.mockRejectedValue(new Error("Update failed"));

    await expect(
      likePosts({ like: "like", postId: "post123" })
    ).rejects.toThrow("Update failed");
  });
});