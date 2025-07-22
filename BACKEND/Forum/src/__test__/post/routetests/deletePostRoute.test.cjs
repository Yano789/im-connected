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

const {deletePost} = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");

describe("delete Post", () => {
    let app;
    beforeAll(() => {
        app = express()
        app.use(express.json())
        app.use(cookieParser())
        app.use("/api/post", postRoutes)
    })

    test("should delete a post", async () => {
        const mockPost = {
            postId: "post123",
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

        const postId = "post123";

        deletePost.mockResolvedValueOnce(mockPost);

        const response = await request(app).delete(`/api/post/${postId}/delete`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPost);
        expect(deletePost).toHaveBeenCalledWith({ postId, username: "testUser" });
    });

    test("should return 400 if deletion fails", async () => {
        const postId = "invalid-id";
        deletePost.mockRejectedValueOnce(new Error("Deletion failed"));

        const response = await request(app).delete(`/api/post/${postId}/delete`);

        expect(response.status).toBe(400);
        expect(response.text).toBe("Deletion failed");
    });



})



