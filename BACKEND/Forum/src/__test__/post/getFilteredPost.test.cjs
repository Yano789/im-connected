jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

// Import real getFilteredPosts from controller (no mocking of addCacheBuster)
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
  });

  it("returns filtered and translated posts based on user preferences", async () => {
    User.findOne.mockResolvedValue(mockUser);
    const mockSort = jest.fn().mockResolvedValue(mockPosts);
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
    expect(posts[0].title).toBe("Original Title [es]");
    expect(posts[0].content).toBe("Original Content [es]");
    // Check the media URL contains the real cache buster parameter ?cb= (timestamp)
    expect(posts[0].media[0].url).toMatch(/\?cb=\d+$/);
  });

it("uses fallback query if no posts found with preferences", async () => {
  User.findOne.mockResolvedValue(mockUser);

  const firstSort = jest.fn().mockResolvedValue([]); // first call returns no posts
  const secondSort = jest.fn().mockResolvedValue(mockPosts); // fallback returns posts

  Post.find
    .mockReturnValueOnce({ sort: firstSort })   // first query
    .mockReturnValueOnce({ sort: secondSort }); // fallback query

  const posts = await getFilteredPosts({
    tags: [],
    sort: "latest",
    source: "default",
    username: "user1"
  });

  expect(Post.find).toHaveBeenCalledTimes(2);
  expect(posts.length).toBe(1);
});


it("filters only by username when source is not 'default'", async () => {
  User.findOne.mockResolvedValue(mockUser);

  const mockSort = jest.fn().mockResolvedValue(mockPosts);
  Post.find.mockReturnValue({ sort: mockSort });

  await getFilteredPosts({
    tags: [],
    sort: "most likes",
    source: "profile",
    username: "user1"
  });

  expect(Post.find).toHaveBeenCalledWith(
    expect.objectContaining({
      username: "user1",
      draft: false
    })
  );
  expect(mockSort).toHaveBeenCalledWith({ likes: -1 });
});


  it("throws an error if user fetch fails", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));

    await expect(
      getFilteredPosts({
        tags: [],
        sort: "latest",
        source: "default",
        username: "user1"
      })
    ).rejects.toThrow("Failed to filter/sort posts: DB error");
  });
});
