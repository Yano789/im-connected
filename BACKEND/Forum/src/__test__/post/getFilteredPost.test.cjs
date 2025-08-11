jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../config/googleConfig.cjs", () => ({
  gcsClient: {
    url: jest.fn(async (publicId) => `http://example.com/${publicId}.jpg`),
  },
}));

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");
const { gcsClient } = require("../../config/googleConfig.cjs");

const { getFilteredPosts } = require("../../domains/post/controller.cjs");

describe("getFilteredPosts", () => {


  beforeEach(() => {
    jest.clearAllMocks();
    
  });

  test("returns filtered and translated posts based on user preferences and default source", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
    User.findOne.mockResolvedValue(mockUser);

    // Setup chained mocks for Post.find().sort().limit()
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

    // Because preferredTags length > 1, tags filter uses $in
    expect(Post.find).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: { $in: ["tag1", "tag2"] },
        draft: false,
      })
    );

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockLimit).toHaveBeenCalledWith(10);

    // gcsClient.url should be called for each media public_id
    expect(gcsClient.url).toHaveBeenCalledWith("media1");

    expect(posts[0].title).toBe("Original Title [es]");
    expect(posts[0].content).toBe("Original Content [es]");
    expect(posts[0].media[0].url).toBe("http://example.com/media1.jpg");
    expect(posts[0].media[0].secure_url).toBe("http://example.com/media1.jpg");
  });

  test("returns empty posts if none found and source is 'default'", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
    User.findOne.mockResolvedValue(mockUser);

    // First find returns empty, so posts should be []
    const primaryLimit = jest.fn().mockResolvedValue([]);
    const primarySort = jest.fn().mockReturnValue({ limit: primaryLimit });
    Post.find.mockReturnValue({ sort: primarySort });

    const posts = await getFilteredPosts({
      tags: [],
      sort: "latest",
      source: "default",
      username: "user1",
    });

    expect(posts).toEqual([]);
  });

  test("filters only by username when source is 'personalized'", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
    User.findOne.mockResolvedValue(mockUser);

    const mockLimit = jest.fn().mockResolvedValue(mockPosts);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    Post.find.mockReturnValue({ sort: mockSort });

    await getFilteredPosts({
      tags: [],
      sort: "most likes",
      source: "personalized",
      username: "user1",
    });

    // The filter should include username, and also tags from preferences
    expect(Post.find).toHaveBeenCalledWith(
      expect.objectContaining({
        "draft": false, "username": "user1"
      })
    );
    expect(mockSort).toHaveBeenCalledWith({ likes: -1 });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  test("returns all posts if source is 'all'", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
    User.findOne.mockResolvedValue(mockUser);

    const mockLimit = jest.fn().mockResolvedValue(mockPosts);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    Post.find.mockReturnValue({ sort: mockSort });

    await getFilteredPosts({
      tags: ["someTag"], // ignored for source=all
      sort: "earliest",
      source: "all",
      username: "user1",
    });

    expect(Post.find).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  test("uses 'mode' to limit number of posts", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
    User.findOne.mockResolvedValue(mockUser);

    const mockLimit = jest.fn().mockResolvedValue(mockPosts);
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    Post.find.mockReturnValue({ sort: mockSort });

    await getFilteredPosts({
      tags: [],
      sort: "latest",
      source: "default",
      username: "user1",
      mode: "compact",
    });

    expect(mockLimit).toHaveBeenCalledWith(5); // mode != default triggers limit=5
  });

  test("throws error if user fetch fails", async () => {
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
      tags:["tag1","tag2"],
      likes: 10,
      comments: 2,
      media: [{ public_id: "media1" }],
    },
  ];
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
