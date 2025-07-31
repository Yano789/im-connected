jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../domains/translation/controller.cjs"); // adjust path if needed

const { getComment } = require("./../../domains/comment/controller.cjs");
const Comment = require("./../../domains/comment/model.cjs");
const User = require("./../../domains/user/model.cjs");
const translate = require("./../../domains/translation/controller.cjs");

describe('getComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return translated comment", async () => {
    const mockComment = {
      commentId: 'c1',
      postId: 'p1',
      username: 'john',
      content: 'This is a comment',
      createdAt: Date.now(),
    };

    const mockUser = {
      username: 'john',
      preferences: {
        preferredLanguage: 'es',
      }
    };

    Comment.findOne.mockReturnValue(mockComment);

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser)
    });

    translate.mockResolvedValue('Este es un comentario');

    const result = await getComment({ postId: "p1", commentId: 'c1', username: 'john' });

    expect(User.findOne).toHaveBeenCalledWith({ username: 'john' });
    expect(Comment.findOne).toHaveBeenCalledWith({ postId: "p1", commentId: 'c1' });
    expect(translate).toHaveBeenCalledWith('This is a comment', 'es');
    expect(result).toBe('Este es un comentario');
  });

  test("should throw error if no postId or commentId is provided", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: 'en' } })
    });

    await expect(getComment({ postId: null, commentId: 'c1', username: 'john' })).rejects.toThrow("No postId");
    await expect(getComment({ postId: 'p1', commentId: null, username: 'john' })).rejects.toThrow("No commentId");
  });

  test("should throw error if user not found", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null)
    });

    await expect(getComment({ postId: 'p1', commentId: 'c1', username: 'john' })).rejects.toThrow("No user");
  });

  test("should throw error if comment not found", async () => {
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ preferences: { preferredLanguage: 'en' } })
    });

    Comment.findOne.mockReturnValue(null);

    await expect(getComment({ postId: 'p1', commentId: 'c1', username: 'john' })).rejects.toThrow("No such comment found");
  });
});



