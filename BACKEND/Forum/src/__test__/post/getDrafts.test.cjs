// Mock all dependencies, but override addCacheBuster in post/controller.cjs
jest.mock("../../domains/post/model.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../config/googleConfig.cjs", () => ({
  bucket: {
    file: jest.fn().mockReturnThis(),
    getSignedUrl: jest.fn().mockResolvedValue(["http://example.com/signed.jpg"]),
  },
  url: jest.fn().mockImplementation(async (publicId) => {
    return `http://example.com/${publicId}.jpg`;
  }),
}));

const { Post } = require("../../domains/post/model.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

const { getAllMyDrafts, getMyDraft } = require("../../domains/post/controller.cjs");

describe("getAllMyDrafts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns drafts for a given username and translates them", async () => {
    const mockDrafts = [
      {
        postId: "d1",
        username: "user1",
        draft: true,
        title: "Title1",
        content: "Content1",
        media: [{ url: "file1.jpg" }],
      },
      {
        postId: "d2",
        username: "user1",
        draft: true,
        title: "Title2",
        content: "Content2",
        media: [],
      },
    ];

    const mockUser = {
      username: "user1",
      preferences: {
        preferredLanguage: "es",
      },
    };

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    });

    Post.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockDrafts),
    });

    translate.mockImplementation((text, lang) => Promise.resolve(`[${lang}] ${text}`));

    const drafts = await getAllMyDrafts("user1");

    expect(User.findOne).toHaveBeenCalledWith({ username: "user1" });
    expect(Post.find).toHaveBeenCalledWith({ username: "user1", draft: true });
    expect(translate).toHaveBeenCalledWith("Title1", "es");
    expect(translate).toHaveBeenCalledWith("Content1", "es");


    expect(drafts[0].title).toBe("[es] Title1");
    expect(drafts[1].title).toBe("[es] Title2");
  });

  test("throws if Post.find throws", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: "en" } }),
    });

    Post.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(getAllMyDrafts("user1")).rejects.toThrow("DB error");
  });
});

describe("getMyDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns a single draft and translates test", async () => {
    const mockDraft = {
      postId: "d1",
      username: "user1",
      draft: true,
      title: "Original Title",
      content: "Original Content",
      media: [{ url: "file.jpg" }],
    };

    const mockUser = {
      preferences: {
        preferredLanguage: "fr",
      },
    };

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    });

    Post.findOne.mockResolvedValue({ ...mockDraft });

    translate.mockImplementation((text, lang) => Promise.resolve(`[${lang}] ${text}`));

    const draft = await getMyDraft({ username: "user1", postId: "d1" });

    expect(User.findOne).toHaveBeenCalledWith({ username: "user1" });
    expect(Post.findOne).toHaveBeenCalledWith({
      username: "user1",
      postId: "d1",
      draft: true,
    });

    expect(draft.title).toBe("[fr] Original Title");
    expect(draft.content).toBe("[fr] Original Content");
  });

  test("throws if Post.findOne throws", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: "en" } }),
    });

    Post.findOne.mockRejectedValue(new Error("DB error"));

    await expect(getMyDraft({ username: "user1", postId: "d1" })).rejects.toThrow("DB error");
  });
});
