jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../utils/buildNestedComments.cjs");
jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../domains/translation/controller.cjs");

const { getAllComments } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");
const createNestedComment = require("./../../utils/buildNestedComments.cjs");
const User = require("./../../domains/user/model.cjs");
const translate = require("./../../domains/translation/controller.cjs");

describe("getCommentsFromPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get all comments from a post with translated content", async () => {
    const flatComments = [
      { commentId: '1', content: 'Root', parentCommentId: null, createdAt: 1 },
      { commentId: '2', content: 'Reply', parentCommentId: '1', createdAt: 2 }
    ];
    const nestedComments = [
      {
        ...flatComments[0],
        children: [flatComments[1]]
      }
    ];

    Comment.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(flatComments)
      })
    });

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        username: 'john',
        preferences: { preferredLanguage: 'es' }
      })
    });

    translate.mockImplementation(async (text, lang) => `translated ${text}`);

    createNestedComment.mockResolvedValue(nestedComments);

    const result = await getAllComments({ postId: 'post123', username: 'john' });

    expect(Comment.find).toHaveBeenCalledWith({ postId: 'post123' });
    expect(createNestedComment).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ content: expect.stringContaining('translated') })
      ])
    );
    expect(result).toEqual(nestedComments);
  });
});

