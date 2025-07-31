jest.mock("./../../domains/post/model.cjs");

jest.mock("./../../domains/user/model.cjs");


jest.mock("./../../domains/savedPosts/model.cjs");


const savedPost = require("./../../domains/savedPosts/model.cjs")
const {Post} = require("./../../domains/post/model.cjs")
const User = require("./../../domains/user/model.cjs")

const {createSavedPost} = require("./../../domains/savedPosts/controller.cjs")

describe("createSavedPost", () => {
    const fixedTime = 1752934590239;
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(fixedTime));
  });

  test("should create a saved post when user and post exist and not already saved", async () => {
    User.findOne.mockResolvedValue({ username: "user1" });
    Post.findOne.mockResolvedValue({ postId: "p1" });
    savedPost.findOne.mockResolvedValue(null);

    const saveMock = jest.fn().mockResolvedValue({ savedPostId: "p1", username: "user1",createdAt:fixedTime });

    const newSavedPostInstance = {
      savedPostId: "p1",
      username: "user1",
      createdAt: Date.now()
    };

        savedPost.mockImplementation(() => ({
        save: saveMock
        }));
    const result = await createSavedPost({ postId: "p1", username: "user1" });

    expect(result).toEqual(newSavedPostInstance);
    expect(saveMock).toHaveBeenCalled();
  });

  test("should return existing saved post if already saved", async () => {
    const existing = { savedPostId: "p1", username: "user1" };

    User.findOne.mockResolvedValue({ username: "user1" });
    Post.findOne.mockResolvedValue({ postId: "p1" });
    savedPost.findOne.mockResolvedValue(existing);

    const result = await createSavedPost({ postId: "p1", username: "user1" });

    expect(result).toEqual(existing);
    expect(savedPost.findOne).toHaveBeenCalledWith({ savedPostId: "p1", username: "user1" });
  });

  test("should throw error if user not found", async () => {
    User.findOne.mockResolvedValue(null);
    Post.findOne.mockResolvedValue({ postId: "p1" });

    await expect(createSavedPost({ postId: "p1", username: "user1" })).rejects.toThrow(
      "Username does not exist"
    );
  });

  test("should throw error if post not found", async () => {
    User.findOne.mockResolvedValue({ username: "user1" });
    Post.findOne.mockResolvedValue(null);

    await expect(createSavedPost({ postId: "p1", username: "user1" })).rejects.toThrow(
      "Post does not exist"
    );
  });
});