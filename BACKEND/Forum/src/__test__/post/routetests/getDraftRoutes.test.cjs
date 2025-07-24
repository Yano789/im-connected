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

const {getMyDraft} = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");


describe("GET /myDrafts/:post", () => {
  let app;

  const mockMyDraft = {
    postId: "draft123",
    title: "My Draft Title",
    content: "This is the content of my draft post.",
    username: "testUser",
    tags: ["Personal Mental Health", "Hospitals and Clinics"],
    createdAt: new Date("2025-07-22T12:00:00Z"),
    edited: false,
    comments: 0,
    likes: 0,
    draft: true,
    media: [
      {
        url: "http://cloudinary.com/media/mydraft_image1.jpg",
        type: "image",
        public_id: "mydraft_image1",
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

  test("should return my draft post", async () => {
    getMyDraft.mockResolvedValueOnce(mockMyDraft);

    const response = await request(app).get("/api/post/myDrafts/draft123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ...mockMyDraft,
        createdAt: mockMyDraft.createdAt.toISOString(),
      })
    );

    expect(getMyDraft).toHaveBeenCalledWith({
      username: "testUser",
      postId: "draft123",
    });
  });

  test("should return 400 if error thrown", async () => {
    getMyDraft.mockRejectedValueOnce(new Error("Draft not found"));

    const response = await request(app).get("/api/post/myDrafts/nonexistent");

    expect(response.status).toBe(400);
    expect(response.text).toBe("Draft not found");
  });
});