jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/comment/model.cjs")
jest.mock("../../utils/buildNestedComments.cjs")


const { Post} = require("../../domains/post/model.cjs")
const Comment = require("../../domains/comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")

const {getPostWithComment} = require("../../domains/post/controller.cjs")

describe("getPostWithComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns post with nested comments when comment count matches", async () => {
    const mockPostId = "post123";
    const mockPost = {
      postId: mockPostId,
      title: "Test Post",
      comments: 2,
      draft: false,
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

    const nestedMock = [
      {
        ...mockComments[0],
        children: [mockComments[1]],
      },
    ];

    const postLeanMock = jest.fn().mockResolvedValue(mockPost);
    const commentLeanMock = jest.fn().mockResolvedValue(mockComments);

    Post.findOne.mockReturnValue({ lean: postLeanMock });
    Comment.find.mockReturnValue({
      sort: () => ({
        lean: commentLeanMock,
      }),
    });

    createNestedComment.mockResolvedValue(nestedMock);

    const result = await getPostWithComment(mockPostId);

    expect(Post.findOne).toHaveBeenCalledWith({ postId: mockPostId });
    expect(postLeanMock).toHaveBeenCalled();

    expect(Comment.find).toHaveBeenCalledWith({ postId: mockPostId });
    expect(commentLeanMock).toHaveBeenCalled();

    expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
    expect(createNestedComment).toHaveBeenCalledWith(mockComments);

    expect(result).toEqual({
      ...mockPost,
      commentArray: nestedMock,
      commentCount: 2,
    });
  });
});