"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/assistants/threads/[threadId]/messages/route";
exports.ids = ["app/api/assistants/threads/[threadId]/messages/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_src_app_api_assistants_threads_threadId_messages_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/assistants/threads/[threadId]/messages/route.ts */ \"(rsc)/./app/api/assistants/threads/[threadId]/messages/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/assistants/threads/[threadId]/messages/route\",\n        pathname: \"/api/assistants/threads/[threadId]/messages\",\n        filename: \"route\",\n        bundlePath: \"app/api/assistants/threads/[threadId]/messages/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Chadrick\\\\Documents\\\\term5_ai_chatbot\\\\IM-CONNECTED\\\\BACKEND\\\\AI_chatbot\\\\src\\\\app\\\\api\\\\assistants\\\\threads\\\\[threadId]\\\\messages\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_src_app_api_assistants_threads_threadId_messages_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/assistants/threads/[threadId]/messages/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhc3Npc3RhbnRzJTJGdGhyZWFkcyUyRiU1QnRocmVhZElkJTVEJTJGbWVzc2FnZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFzc2lzdGFudHMlMkZ0aHJlYWRzJTJGJTVCdGhyZWFkSWQlNUQlMkZtZXNzYWdlcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFzc2lzdGFudHMlMkZ0aHJlYWRzJTJGJTVCdGhyZWFkSWQlNUQlMkZtZXNzYWdlcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNDaGFkcmljayU1Q0RvY3VtZW50cyU1Q3Rlcm01X2FpX2NoYXRib3QlNUNJTS1DT05ORUNURUQlNUNCQUNLRU5EJTVDQUlfY2hhdGJvdCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDQ2hhZHJpY2slNUNEb2N1bWVudHMlNUN0ZXJtNV9haV9jaGF0Ym90JTVDSU0tQ09OTkVDVEVEJTVDQkFDS0VORCU1Q0FJX2NoYXRib3QlNUNzcmMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDdUc7QUFDcEw7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc3Npc3RhbnRzLW5leHRqcy8/N2Q0NCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxDaGFkcmlja1xcXFxEb2N1bWVudHNcXFxcdGVybTVfYWlfY2hhdGJvdFxcXFxJTS1DT05ORUNURURcXFxcQkFDS0VORFxcXFxBSV9jaGF0Ym90XFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGFzc2lzdGFudHNcXFxcdGhyZWFkc1xcXFxbdGhyZWFkSWRdXFxcXG1lc3NhZ2VzXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9tZXNzYWdlcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9bdGhyZWFkSWRdL21lc3NhZ2VzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9tZXNzYWdlcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXENoYWRyaWNrXFxcXERvY3VtZW50c1xcXFx0ZXJtNV9haV9jaGF0Ym90XFxcXElNLUNPTk5FQ1RFRFxcXFxCQUNLRU5EXFxcXEFJX2NoYXRib3RcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXNzaXN0YW50c1xcXFx0aHJlYWRzXFxcXFt0aHJlYWRJZF1cXFxcbWVzc2FnZXNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXNzaXN0YW50cy90aHJlYWRzL1t0aHJlYWRJZF0vbWVzc2FnZXMvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/assistants/threads/[threadId]/messages/route.ts":
/*!*****************************************************************!*\
  !*** ./app/api/assistants/threads/[threadId]/messages/route.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _app_assistant_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/app/assistant-config */ \"(rsc)/./app/assistant-config.ts\");\n/* harmony import */ var _app_openai__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/app/openai */ \"(rsc)/./app/openai.ts\");\n/*import { assistantId } from \"@/app/assistant-config\";\r\nimport { openai } from \"@/app/openai\";\r\n\r\nexport const runtime = \"nodejs\";\r\n\r\n// Send a new message to a thread\r\nexport async function POST(request, { params: { threadId } }) {\r\n  const { content } = await request.json();\r\n\r\n  await openai.beta.threads.messages.create(threadId, {\r\n    role: \"user\",\r\n    content: content,\r\n  });\r\n\r\n  const stream = openai.beta.threads.runs.stream(threadId, {\r\n    assistant_id: assistantId,\r\n  });\r\n\r\n  return new Response(stream.toReadableStream());\r\n}*/ // /app/api/threads/[threadId]/message/route.js\n\n\nconst runtime = \"nodejs\";\nasync function OPTIONS() {\n    // Handle preflight requests for CORS\n    return new Response(null, {\n        status: 204,\n        headers: {\n            \"Access-Control-Allow-Origin\": \"http://localhost:5173\",\n            \"Access-Control-Allow-Methods\": \"GET, POST, PUT, DELETE, OPTIONS\",\n            \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n        }\n    });\n}\nasync function POST(request, { params }) {\n    const threadId = params.threadId;\n    // CORS headers\n    const corsHeaders = {\n        \"Access-Control-Allow-Origin\": \"http://localhost:5173\",\n        \"Access-Control-Allow-Methods\": \"GET, POST, PUT, DELETE, OPTIONS\",\n        \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n    };\n    const { content } = await request.json();\n    await _app_openai__WEBPACK_IMPORTED_MODULE_1__.openai.beta.threads.messages.create(threadId, {\n        role: \"user\",\n        content: content\n    });\n    const stream = _app_openai__WEBPACK_IMPORTED_MODULE_1__.openai.beta.threads.runs.stream(threadId, {\n        assistant_id: _app_assistant_config__WEBPACK_IMPORTED_MODULE_0__.assistantId\n    });\n    // Stream response with headers\n    const response = new Response(stream.toReadableStream(), {\n        headers: corsHeaders\n    });\n    return response;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9bdGhyZWFkSWRdL21lc3NhZ2VzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FDRCwrQ0FBK0M7QUFFTTtBQUNmO0FBRS9CLE1BQU1FLFVBQVUsU0FBUztBQUV6QixlQUFlQztJQUNwQixxQ0FBcUM7SUFDckMsT0FBTyxJQUFJQyxTQUFTLE1BQU07UUFDeEJDLFFBQVE7UUFDUkMsU0FBUztZQUNQLCtCQUErQjtZQUMvQixnQ0FBZ0M7WUFDaEMsZ0NBQWdDO1FBQ2xDO0lBQ0Y7QUFDRjtBQUVPLGVBQWVDLEtBQUtDLE9BQU8sRUFBRSxFQUFFQyxNQUFNLEVBQUU7SUFDNUMsTUFBTUMsV0FBV0QsT0FBT0MsUUFBUTtJQUVoQyxlQUFlO0lBQ2YsTUFBTUMsY0FBYztRQUNsQiwrQkFBK0I7UUFDL0IsZ0NBQWdDO1FBQ2hDLGdDQUFnQztJQUNsQztJQUVBLE1BQU0sRUFBRUMsT0FBTyxFQUFFLEdBQUcsTUFBTUosUUFBUUssSUFBSTtJQUV0QyxNQUFNWiwrQ0FBTUEsQ0FBQ2EsSUFBSSxDQUFDQyxPQUFPLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDUCxVQUFVO1FBQ2xEUSxNQUFNO1FBQ05OLFNBQVNBO0lBQ1g7SUFFQSxNQUFNTyxTQUFTbEIsK0NBQU1BLENBQUNhLElBQUksQ0FBQ0MsT0FBTyxDQUFDSyxJQUFJLENBQUNELE1BQU0sQ0FBQ1QsVUFBVTtRQUN2RFcsY0FBY3JCLDhEQUFXQTtJQUMzQjtJQUVBLCtCQUErQjtJQUMvQixNQUFNc0IsV0FBVyxJQUFJbEIsU0FBU2UsT0FBT0ksZ0JBQWdCLElBQUk7UUFDdkRqQixTQUFTSztJQUNYO0lBRUEsT0FBT1c7QUFDVCIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzc2lzdGFudHMtbmV4dGpzLy4vYXBwL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9tZXNzYWdlcy9yb3V0ZS50cz8zMGMwIl0sInNvdXJjZXNDb250ZW50IjpbIi8qaW1wb3J0IHsgYXNzaXN0YW50SWQgfSBmcm9tIFwiQC9hcHAvYXNzaXN0YW50LWNvbmZpZ1wiO1xyXG5pbXBvcnQgeyBvcGVuYWkgfSBmcm9tIFwiQC9hcHAvb3BlbmFpXCI7XHJcblxyXG5leHBvcnQgY29uc3QgcnVudGltZSA9IFwibm9kZWpzXCI7XHJcblxyXG4vLyBTZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSB0aHJlYWRcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdCwgeyBwYXJhbXM6IHsgdGhyZWFkSWQgfSB9KSB7XHJcbiAgY29uc3QgeyBjb250ZW50IH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcclxuXHJcbiAgYXdhaXQgb3BlbmFpLmJldGEudGhyZWFkcy5tZXNzYWdlcy5jcmVhdGUodGhyZWFkSWQsIHtcclxuICAgIHJvbGU6IFwidXNlclwiLFxyXG4gICAgY29udGVudDogY29udGVudCxcclxuICB9KTtcclxuXHJcbiAgY29uc3Qgc3RyZWFtID0gb3BlbmFpLmJldGEudGhyZWFkcy5ydW5zLnN0cmVhbSh0aHJlYWRJZCwge1xyXG4gICAgYXNzaXN0YW50X2lkOiBhc3Npc3RhbnRJZCxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShzdHJlYW0udG9SZWFkYWJsZVN0cmVhbSgpKTtcclxufSovXHJcbi8vIC9hcHAvYXBpL3RocmVhZHMvW3RocmVhZElkXS9tZXNzYWdlL3JvdXRlLmpzXHJcblxyXG5pbXBvcnQgeyBhc3Npc3RhbnRJZCB9IGZyb20gXCJAL2FwcC9hc3Npc3RhbnQtY29uZmlnXCI7XHJcbmltcG9ydCB7IG9wZW5haSB9IGZyb20gXCJAL2FwcC9vcGVuYWlcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBydW50aW1lID0gXCJub2RlanNcIjtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBPUFRJT05TKCkge1xyXG4gIC8vIEhhbmRsZSBwcmVmbGlnaHQgcmVxdWVzdHMgZm9yIENPUlNcclxuICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtcclxuICAgIHN0YXR1czogMjA0LFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTE3M1wiLFxyXG4gICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCJHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TXCIsXHJcbiAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiBcIkNvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvblwiLFxyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdCwgeyBwYXJhbXMgfSkge1xyXG4gIGNvbnN0IHRocmVhZElkID0gcGFyYW1zLnRocmVhZElkO1xyXG5cclxuICAvLyBDT1JTIGhlYWRlcnNcclxuICBjb25zdCBjb3JzSGVhZGVycyA9IHtcclxuICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo1MTczXCIsXHJcbiAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCJHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TXCIsXHJcbiAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogXCJDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb25cIixcclxuICB9O1xyXG5cclxuICBjb25zdCB7IGNvbnRlbnQgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xyXG5cclxuICBhd2FpdCBvcGVuYWkuYmV0YS50aHJlYWRzLm1lc3NhZ2VzLmNyZWF0ZSh0aHJlYWRJZCwge1xyXG4gICAgcm9sZTogXCJ1c2VyXCIsXHJcbiAgICBjb250ZW50OiBjb250ZW50LFxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBzdHJlYW0gPSBvcGVuYWkuYmV0YS50aHJlYWRzLnJ1bnMuc3RyZWFtKHRocmVhZElkLCB7XHJcbiAgICBhc3Npc3RhbnRfaWQ6IGFzc2lzdGFudElkLFxyXG4gIH0pO1xyXG5cclxuICAvLyBTdHJlYW0gcmVzcG9uc2Ugd2l0aCBoZWFkZXJzXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2Uoc3RyZWFtLnRvUmVhZGFibGVTdHJlYW0oKSwge1xyXG4gICAgaGVhZGVyczogY29yc0hlYWRlcnMsXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiByZXNwb25zZTtcclxufVxyXG4iXSwibmFtZXMiOlsiYXNzaXN0YW50SWQiLCJvcGVuYWkiLCJydW50aW1lIiwiT1BUSU9OUyIsIlJlc3BvbnNlIiwic3RhdHVzIiwiaGVhZGVycyIsIlBPU1QiLCJyZXF1ZXN0IiwicGFyYW1zIiwidGhyZWFkSWQiLCJjb3JzSGVhZGVycyIsImNvbnRlbnQiLCJqc29uIiwiYmV0YSIsInRocmVhZHMiLCJtZXNzYWdlcyIsImNyZWF0ZSIsInJvbGUiLCJzdHJlYW0iLCJydW5zIiwiYXNzaXN0YW50X2lkIiwicmVzcG9uc2UiLCJ0b1JlYWRhYmxlU3RyZWFtIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/assistants/threads/[threadId]/messages/route.ts\n");

/***/ }),

/***/ "(rsc)/./app/assistant-config.ts":
/*!*********************************!*\
  !*** ./app/assistant-config.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   assistantId: () => (/* binding */ assistantId)\n/* harmony export */ });\nlet assistantId = \"asst_Toe47krPDUUMC61Xl4fHgbi6\"; // set your assistant ID here\nif (assistantId === \"asst_Toe47krPDUUMC61Xl4fHgbi6\") {\n    assistantId = process.env.OPENAI_ASSISTANT_ID;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXNzaXN0YW50LWNvbmZpZy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQU8sSUFBSUEsY0FBYyxnQ0FBZ0MsQ0FBQyw2QkFBNkI7QUFFdkYsSUFBSUEsZ0JBQWdCLGlDQUFpQztJQUNuREEsY0FBY0MsUUFBUUMsR0FBRyxDQUFDQyxtQkFBbUI7QUFDL0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc3Npc3RhbnRzLW5leHRqcy8uL2FwcC9hc3Npc3RhbnQtY29uZmlnLnRzPzcxZWUiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGxldCBhc3Npc3RhbnRJZCA9IFwiYXNzdF9Ub2U0N2tyUERVVU1DNjFYbDRmSGdiaTZcIjsgLy8gc2V0IHlvdXIgYXNzaXN0YW50IElEIGhlcmVcclxuXHJcbmlmIChhc3Npc3RhbnRJZCA9PT0gXCJhc3N0X1RvZTQ3a3JQRFVVTUM2MVhsNGZIZ2JpNlwiKSB7XHJcbiAgYXNzaXN0YW50SWQgPSBwcm9jZXNzLmVudi5PUEVOQUlfQVNTSVNUQU5UX0lEO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJhc3Npc3RhbnRJZCIsInByb2Nlc3MiLCJlbnYiLCJPUEVOQUlfQVNTSVNUQU5UX0lEIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/assistant-config.ts\n");

/***/ }),

/***/ "(rsc)/./app/openai.ts":
/*!***********************!*\
  !*** ./app/openai.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   openai: () => (/* binding */ openai)\n/* harmony export */ });\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openai */ \"(rsc)/./node_modules/openai/index.mjs\");\n\nconst openai = new openai__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvb3BlbmFpLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTRCO0FBRXJCLE1BQU1DLFNBQVMsSUFBSUQsOENBQU1BLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc3Npc3RhbnRzLW5leHRqcy8uL2FwcC9vcGVuYWkudHM/MDNmNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT3BlbkFJIGZyb20gXCJvcGVuYWlcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBvcGVuYWkgPSBuZXcgT3BlbkFJKCk7XHJcbiJdLCJuYW1lcyI6WyJPcGVuQUkiLCJvcGVuYWkiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/openai.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/formdata-node","vendor-chunks/tr46","vendor-chunks/openai","vendor-chunks/web-streams-polyfill","vendor-chunks/next","vendor-chunks/node-fetch","vendor-chunks/whatwg-url","vendor-chunks/event-target-shim","vendor-chunks/agentkeepalive","vendor-chunks/form-data-encoder","vendor-chunks/webidl-conversions","vendor-chunks/abort-controller","vendor-chunks/ms","vendor-chunks/humanize-ms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Fmessages%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();