jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../domains/comment/model.cjs");
jest.mock("../../utils/buildNestedComments.cjs");
jest.mock("../../domains/user/model.cjs");
jest.mock("../../domains/translation/controller.cjs");
jest.mock("../../config/gcsStorage.cjs", () => ({
  gcsClient: {
    url: jest.fn(async (publicId) => `http://example.com/${publicId}.jpg`),
  },
}));

const { Post } = require("../../domains/post/model.cjs");
const Comment = require("../../domains/comment/model.cjs");
const createNestedComment = require("../../utils/buildNestedComments.cjs");
const User = require("../../domains/user/model.cjs");
const translate = require("../../domains/translation/controller.cjs");

const { getPostWithComment } = require("../../domains/post/controller.cjs");

describe("getPostWithComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns post with translated title/content and nested translated comments", async () => {
    const mockPostId = "post123";
    const mockUsername = "tester";
    const mockPreferredLang = "es";

    const mockPost = {
      postId: mockPostId,
      title: "Test Post",
      content: "This is a post",
      comments: 2,
      draft: false,
      media: [],
    };

    const mockComments = [
      {
        commentId: "c1",
        content: "First comment",
        parentCommentId: null,
        createdAt: new Date("2024-01-01"),
      },
      {
        commentId: "c2",
        content: "Reply to first comment",
        parentCommentId: "c1",
        createdAt: new Date("2024-01-02"),
      },
    ];

    const translatedComments = [
      {
        ...mockComments[0],
        content: "translated: First comment",
      },
      {
        ...mockComments[1],
        content: "translated: Reply to first comment",
      },
    ];

    const nestedMock = [
      {
        ...translatedComments[0],
        children: [translatedComments[1]],
      },
    ];


    User.findOne.mockReturnValue({
      lean: () => Promise.resolve({ preferences: { preferredLanguage: mockPreferredLang } }),
    });


    Post.findOne.mockReturnValue({ lean: () => Promise.resolve(mockPost) });
    Post.updateOne = jest.fn(); 


    Comment.find.mockReturnValue({
      sort: () => ({
        lean: () => Promise.resolve(mockComments),
      }),
    });


    translate.mockImplementation(async (text, lang) => `translated: ${text}`);


    createNestedComment.mockResolvedValue(nestedMock);

    const result = await getPostWithComment({ postId: mockPostId, username: mockUsername });

    expect(User.findOne).toHaveBeenCalledWith({ username: mockUsername });
    expect(Post.findOne).toHaveBeenCalledWith({ postId: mockPostId });
    expect(Comment.find).toHaveBeenCalledWith({ postId: mockPostId });
    expect(translate).toHaveBeenCalledWith("Test Post", "es");
    expect(translate).toHaveBeenCalledWith("This is a post", "es");
    expect(translate).toHaveBeenCalledWith("First comment", "es");
    expect(translate).toHaveBeenCalledWith("Reply to first comment", "es");

    expect(createNestedComment).toHaveBeenCalledWith(translatedComments);

    expect(result).toEqual({
      ...mockPost,
      title: "translated: Test Post",
      content: "translated: This is a post",
      commentArray: nestedMock,
      commentCount: 2,
    });
  });
});
