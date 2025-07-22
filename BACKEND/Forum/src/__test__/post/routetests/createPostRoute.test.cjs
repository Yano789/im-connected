jest.mock("./../../../domains/post/controller.cjs",()=>{
    createPost: jest.fn()
})

jest.mock("./../../../middleware/auth.cjs",()=>{
    auth: jest.fn()
})

jest.mock("./../../../config/storage.cjs",()=>{
    upload:jest.fn()
})

jest.mock("./../../../middleware/normalizeTags.cjs",()=>{
    normalizeTagsMiddleware: jest.fn()
})

jest.mock


const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const {createPost} = require("./../../../domains/post/controller.cjs")
const auth = require("./../../../middleware/auth.cjs")
const upload = require("./../../../config/storage.cjs")
const normalizeTagsMiddleware = require("./../../../middleware/normalizeTags.cjs")
const {validateBody} = require("./../../../middleware/validate.cjs")
const {cloudinary} = require("./../../../config/cloudinary.cjs")

const postRoutes = require("../../../domains/post/routes.cjs")


