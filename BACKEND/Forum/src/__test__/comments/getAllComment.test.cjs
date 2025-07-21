jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../utils/buildNestedComments.cjs");

const { getAllComments } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");
const { Post } = require("./../../domains/post/model.cjs");
const createNestedComment = require("./../../utils/buildNestedComments.cjs");


describe("getCommentsFromPosts",()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    })
    test("should get all comments from a post",async()=>{
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
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(flatComments) });
    Comment.find.mockReturnValue({ sort: sortMock });

    createNestedComment.mockResolvedValue(nestedComments);

    const result = await getAllComments('post123');

    expect(Comment.find).toHaveBeenCalledWith({ postId: 'post123' });
    expect(createNestedComment).toHaveBeenCalledWith(flatComments);
    expect(result).toEqual(nestedComments);

    })
})
