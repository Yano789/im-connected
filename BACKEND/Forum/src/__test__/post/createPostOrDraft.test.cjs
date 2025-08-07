jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../utils/hashData.cjs");
jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../utils/cacheBuster.cjs")

const { Post } = require("../../domains/post/model.cjs");
const { hashData } = require("../../utils/hashData.cjs");
const User = require("../../domains/user/model.cjs");
const { createPost} = require("../../domains/post/controller.cjs");
const addCacheBuster = require("./../../utils/cacheBuster.cjs")

describe("create post/draft", () => {
  const fixedTime = 1752934590239;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(fixedTime));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Create a post", async () => {
    const username = "username";
    const mockData = {
      title: "title",
      content: "content",
      username,
      tags: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
      draft: false
    };

    User.findOne.mockResolvedValueOnce("username");
    hashData.mockResolvedValueOnce("hashedPostId");

    const saveMock = jest.fn().mockResolvedValue({
      _id: "123",
      postId: "hashedPostId",
      title: "title",
      content: "content",
      username,
      tags: mockData.tags,
      createdAt: fixedTime,
      draft: false,
      edited: false,
      comments: 0,
      likes: 0
    });

    Post.mockImplementation(() => ({
      save: saveMock
    }));

    const post = await createPost(mockData);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(hashData).toHaveBeenCalledWith(username + fixedTime);
    expect(saveMock).toHaveBeenCalled();

    expect(post.postId).toBe("hashedPostId");
    expect(post.content).toBe("content");
    expect(post.title).toBe("title");
    expect(post.username).toBe("username");
    expect(post.tags).toStrictEqual(mockData.tags);
    expect(post.createdAt).toBe(fixedTime);
  });

  test("throws error if username not found", async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(
      createPost({
        title: "x",
        content: "y",
        tags: [],
        username: "ghost",
        draft: false
      })
    ).rejects.toThrow("Username does not exist");
  });

  test("Create a post with media and addCacheBuster", async () => {
    const username = "userWithMedia";
    const mockData = {
      title: "Media Post",
      content: "With images",
      username,
      tags: ["tag1", "tag2"],
      draft: false,
      media: [
        { url: "http://example.com/image1.jpg" },
        { url: "http://example.com/image2.jpg" }
      ]
    };

    User.findOne.mockResolvedValueOnce("username");
    hashData.mockResolvedValueOnce("hashedMediaPost");

    // Mock cache buster behavior
    addCacheBuster.mockImplementation((url) => url + "?cb=mocked");

    const saveMock = jest.fn().mockResolvedValue({
  _id: "456",
  postId: "hashedMediaPost",
  title: mockData.title,
  content: mockData.content,
  username,
  tags: mockData.tags,
  createdAt: fixedTime,
  draft: false,
  media: [
    { url: "http://example.com/image1.jpg" },
    { url: "http://example.com/image2.jpg" },
  ],
});

    Post.mockImplementation(() => ({
      save: saveMock
    }));

    const post = await createPost(mockData);

    expect(addCacheBuster).toHaveBeenCalledTimes(2);
    expect(addCacheBuster).toHaveBeenCalledWith("http://example.com/image1.jpg");
    expect(addCacheBuster).toHaveBeenCalledWith("http://example.com/image2.jpg");

    expect(post.media).toEqual([
      { url: "http://example.com/image1.jpg?cb=mocked" },
      { url: "http://example.com/image2.jpg?cb=mocked" }
    ]);
  });
});
