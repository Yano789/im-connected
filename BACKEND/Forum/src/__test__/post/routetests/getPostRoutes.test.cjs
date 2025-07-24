jest.mock("./../../../domains/post/controller.cjs", () => ({
    createPost: jest.fn(),
    editDraft: jest.fn(),
    deletePost: jest.fn(),
    modeLimit: jest.fn(),
    getFilteredPosts: jest.fn(),
    getPostWithComment: jest.fn(),
    likePosts: jest.fn(),
    getAllMyPosts: jest.fn(),
    getAllMyDrafts: jest.fn(),
    getMyDraft: jest.fn(),
    deleteDrafts: jest.fn(),
}));

jest.mock("./../../../middleware/auth.cjs", () =>
    jest.fn((req, res, next) => {
        req.currentUser = { username: req.headers["x-test-username"] || "testUser" };
        next();
    })
);

jest.mock("./../../../middleware/validate.cjs", () => ({
    validateBody: () => (req, res, next) => next(),
    validateParams: () => (req, res, next) => next(),
    validateQuery: () => (req, res, next) => next(),
}));

jest.mock("./../../../utils/validators/postValidator.cjs", () => ({
    postDraftSchema: {},
    querySchema: {},
    paramsSchema: {},
}));

jest.mock("./../../../config/storage.cjs", () => ({
    array: () => (req, res, next) => {
        req.files = [
            {
                path: "http://cloudinary.com/media/image.jpg",
                mimetype: "image/jpeg",
                filename: "image1"
            },
            {
                path: "http://cloudinary.com/media/video.mp4",
                mimetype: "video/mp4",
                filename: "video1"
            }
        ];
        next();
    }
}));

jest.mock("./../../../middleware/normalizeTags.cjs", () =>
    jest.fn((req, res, next) => next())
);

jest.mock("./../../../config/cloudinary.cjs", () => ({
    cloudinary: {
        uploader: {
            destroy: jest.fn(),
        },
    },
}));
const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const {getPostWithComment} = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");


describe("GET /getPost/:post", () => {
  let app;

  const mockPostWithComments = {
    postId: "post123",
    title: "Post Title",
    content: "Post content with comments.",
    username: "testUser",
    tags: ["Personal Mental Health"],
    createdAt: new Date("2025-07-22T10:00:00Z"),
    edited: false,
    comments: 2,
    likes: 15,
    draft: false,
    media: [
      {
        url: "http://cloudinary.com/media/image1.jpg",
        type: "image",
        public_id: "img_001",
      },
    ],
    commentsData: [
      {
        commentId: "comment1",
        username: "commenter1",
        content: "Nice post!",
        createdAt: new Date("2025-07-22T11:00:00Z"),
      },
      {
        commentId: "comment2",
        username: "commenter2",
        content: "Thanks for sharing.",
        createdAt: new Date("2025-07-22T12:00:00Z"),
      },
    ],
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/post", postRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return post with comments", async () => {
    getPostWithComment.mockResolvedValueOnce(mockPostWithComments);

    const response = await request(app).get("/api/post/getPost/post123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...mockPostWithComments,
      createdAt: mockPostWithComments.createdAt.toISOString(),
      commentsData: mockPostWithComments.commentsData.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    });
    expect(getPostWithComment).toHaveBeenCalledWith("post123");
  });

  test("should return 400 on error", async () => {
    getPostWithComment.mockRejectedValueOnce(new Error("Post not found"));

    const response = await request(app).get("/api/post/getPost/post999");

    expect(response.status).toBe(400);
    expect(response.text).toBe("Post not found");
  });
});