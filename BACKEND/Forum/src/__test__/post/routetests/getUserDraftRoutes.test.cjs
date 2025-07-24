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

const {getAllMyDrafts} = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");


describe("GET /myDrafts", () => {
  let app;

  const mockDrafts = [
    {
      postId: "draft1",
      title: "Draft One",
      content: "First draft content",
      username: "testUser",
      tags: ["Mental Disability"],
      createdAt: new Date("2025-07-22T10:00:00Z"),
      edited: true,
      comments: 0,
      likes: 0,
      draft: true,
      media: [
        {
          url: "http://cloudinary.com/media/draft1.jpg",
          type: "image",
          public_id: "draft1_img",
        },
      ],
    },
    {
      postId: "draft2",
      title: "Draft Two",
      content: "Second draft content",
      username: "testUser",
      tags: ["Personal Mental Health"],
      createdAt: new Date("2025-07-21T14:00:00Z"),
      edited: false,
      comments: 1,
      likes: 3,
      draft: true,
      media: [],
    },
  ];

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/post", postRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return all drafts for the authenticated user", async () => {
    getAllMyDrafts.mockResolvedValueOnce(mockDrafts);

    const response = await request(app).get("/api/post/myDrafts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockDrafts.map(draft => ({
        ...draft,
        createdAt: draft.createdAt.toISOString(),
      }))
    );

    expect(getAllMyDrafts).toHaveBeenCalledWith("testUser");
  });

  test("should return 400 if an error is thrown", async () => {
    getAllMyDrafts.mockRejectedValueOnce(new Error("Failed to fetch drafts"));

    const response = await request(app).get("/api/post/myDrafts");

    expect(response.status).toBe(400);
    expect(response.text).toBe("Failed to fetch drafts");
  });
});