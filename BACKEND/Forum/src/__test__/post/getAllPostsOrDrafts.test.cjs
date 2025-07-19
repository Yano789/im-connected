jest.mock("./../../domains/post/model.cjs")

const { Post} = require("../../domains/post/model.cjs")

const { getAllMyDrafts, getMyDraft} = require("../../domains/post/controller.cjs")

describe("getAllMyDrafts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return drafts for a given username", async () => {
    const mockDrafts = [
      { postId: "d1", username: "user1", draft: true },
      { postId: "d2", username: "user1", draft: true },
    ];

    // Mock the chainable methods find().sort()
    Post.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockDrafts),
    });

    const drafts = await getAllMyDrafts("user1");

    expect(Post.find).toHaveBeenCalledWith({ username: "user1", draft: true });
    expect(drafts).toEqual(mockDrafts);
  });

  test("should throw error if Post.find throws", async () => {
    Post.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(getAllMyDrafts("user1")).rejects.toThrow("DB error");
  });
});

describe("getMyDraft", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return a single draft matching username and postId", async () => {
    const mockDraft = { postId: "d1", username: "user1", draft: true };

    Post.findOne.mockResolvedValue(mockDraft);

    const draft = await getMyDraft({ username: "user1", postId: "d1" });

    expect(Post.findOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "d1",
      draft: true,
    });
    expect(draft).toEqual(mockDraft);
  });

  test("should throw error if Post.findOne throws", async () => {
    Post.findOne.mockRejectedValue(new Error("DB error"));

    await expect(
      getMyDraft({ username: "user1", postId: "d1" })
    ).rejects.toThrow("DB error");
  });
});