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
        req.currentUser = { username: "testUser" };
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

const { createPost, editDraft, deletePost, modeLimit, getFilteredPosts, getPostWithComment, likePosts, getAllMyDrafts, getMyDraft, deleteDrafts } = require("./../../../domains/post/controller.cjs")
const auth = require("./../../../middleware/auth.cjs")
const upload = require("./../../../config/storage.cjs")
const normalizeTagsMiddleware = require("./../../../middleware/normalizeTags.cjs")
const { validateBody } = require("./../../../middleware/validate.cjs")
const { cloudinary } = require("./../../../config/cloudinary.cjs")

const postRoutes = require("../../../domains/post/routes.cjs");


describe("create Post", () => {
    let app;

    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use(cookieParser())
        app.use("/api/post", postRoutes)
    })

    test("Should create a post", async () => {
        const mockPost = {
            title: "Test Title",
            content: "Test Content",
            tags: ["tag1", "tag2"],
            username: "testUser",
            draft: false,
            media: [
                {
                    url: "http://cloudinary.com/media/image1.jpg",
                    type: "image",
                    public_id: "image1",
                },
                {
                    url: "http://cloudinary.com/media/video1.mp4",
                    type: "video",
                    public_id: "video1",
                }
            ]
        };

        createPost.mockResolvedValueOnce(mockPost)

        const mockData = {
            title: "Test Title",
            content: "Test Content",
            tags: ["tag1", "tag2"],
            draft: false
        }

        const response = await request(app).post("/api/post/create").send(mockData)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(mockPost)
        expect(createPost).toHaveBeenCalledWith({
            ...mockData, username: "testUser", media: [
                {
                    url: "http://cloudinary.com/media/image.jpg",
                    type: "image",
                    public_id: "image1"
                },
                {
                    url: "http://cloudinary.com/media/video.mp4",
                    type: "video",
                    public_id: "video1"
                }
            ]
        })

    })
})


