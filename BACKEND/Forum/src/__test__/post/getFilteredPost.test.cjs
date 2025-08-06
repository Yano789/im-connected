jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../utils/cacheBuster.cjs");

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");
const addCacheBuster  = require("../../utils/cacheBuster.cjs");

const { getFilteredPosts } = require("../../domains/post/controller.cjs");

describe("getFilteredPosts", () => {
  const mockUser = {
    username: "user1",
    preferences: {
      topics: ["tag1", "tag2"],
      preferredLanguage: "es",
    },
  };

  const mockPosts = [
    {
      title: "Original Title",
      content: "Original Content",
      createdAt: new Date(),
      likes: 10,
      comments: 2,
      media: [{ url: "https://example.com/image1.jpg" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    addCacheBuster.mockImplementation(url => `${url}?cb=1234567890`);  // <-- mock here
  });

  it("returns filtered and translated posts based on user preferences", async () => {
    User.findOne.mockResolvedValue(mockUser);

    const mockLimit = jest.fn().mockResolvedValue(mockPosts);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    Post.find.mockReturnValue({ sort: mockSort });

    translate.mockImplementation(async (text, lang) => `${text} [${lang}]`);

    const posts = await getFilteredPosts({
      tags: [],
      sort: "latest",
      source: "default",
      username: "user1",
    });

    expect(User.findOne).toHaveBeenCalledWith({ username: "user1" });
    expect(Post.find).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: { $in: ["tag1", "tag2"] },
        draft: false,
      })
    );
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(posts[0].title).toBe("Original Title [es]");
    expect(posts[0].content).toBe("Original Content [es]");
    expect(posts[0].media[0].url).toBe("https://example.com/image1.jpg?cb=1234567890");
  });

 it("uses fallback query if no posts found with preferences", async () => {

    const mockPosts1 = [
    {
      title: "Original Title",
      content: "Original Content",
      createdAt: new Date(),
      likes: 10,
      comments: 2,
      media: [{ url: "https://example.com/image1.jpg" }],
    },
  ];
  User.findOne.mockResolvedValue(mockUser);

  const primaryLimit = jest.fn().mockReturnValue(Promise.resolve([]));
  const primarySort = jest.fn().mockReturnValue({ limit: primaryLimit });

  const fallbackLimit = jest.fn().mockReturnValue(Promise.resolve(mockPosts1));
  const fallbackSort = jest.fn().mockReturnValue({ limit: fallbackLimit });

  Post.find
    .mockReturnValueOnce({ sort: primarySort })   // First attempt
    .mockReturnValueOnce({ sort: fallbackSort }); // Fallback attempt

  translate.mockImplementation(async (text, lang) => `${text} [${lang}]`);

  const posts = await getFilteredPosts({
    tags: [],
    sort: "latest",
    source: "default",
    username: "user1",
  });

  expect(Post.find).toHaveBeenCalledTimes(2);
  expect(posts.length).toBe(1);
  expect(posts[0].title).toBe("Original Title [es]");
});

  it("filters only by username when source is not 'default'", async () => {
    User.findOne.mockResolvedValue(mockUser);

    const mockLimit = jest.fn().mockResolvedValue(mockPosts);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });

    Post.find.mockReturnValue({ sort: mockSort });

    await getFilteredPosts({
      tags: [],
      sort: "most likes",
      source: "profile",
      username: "user1",
    });

    expect(Post.find).toHaveBeenCalledWith(
      expect.objectContaining({"draft": false, "tags": {"$in": ["tag1", "tag2"]}})
    );
    expect(mockSort).toHaveBeenCalledWith({ likes: -1 });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it("throws an error if user fetch fails", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));

    await expect(
      getFilteredPosts({
        tags: [],
        sort: "latest",
        source: "default",
        username: "user1",
      })
    ).rejects.toThrow("Failed to filter/sort posts: DB error");
  });
});
