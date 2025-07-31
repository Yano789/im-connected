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
exports.id = "app/api/assistants/threads/route";
exports.ids = ["app/api/assistants/threads/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_src_app_api_assistants_threads_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/assistants/threads/route.ts */ \"(rsc)/./app/api/assistants/threads/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/assistants/threads/route\",\n        pathname: \"/api/assistants/threads\",\n        filename: \"route\",\n        bundlePath: \"app/api/assistants/threads/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Chadrick\\\\Documents\\\\term5_ai_chatbot\\\\IM-CONNECTED\\\\BACKEND\\\\AI_chatbot\\\\src\\\\app\\\\api\\\\assistants\\\\threads\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_src_app_api_assistants_threads_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/assistants/threads/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhc3Npc3RhbnRzJTJGdGhyZWFkcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXNzaXN0YW50cyUyRnRocmVhZHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhc3Npc3RhbnRzJTJGdGhyZWFkcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNDaGFkcmljayU1Q0RvY3VtZW50cyU1Q3Rlcm01X2FpX2NoYXRib3QlNUNJTS1DT05ORUNURUQlNUNCQUNLRU5EJTVDQUlfY2hhdGJvdCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDQ2hhZHJpY2slNUNEb2N1bWVudHMlNUN0ZXJtNV9haV9jaGF0Ym90JTVDSU0tQ09OTkVDVEVEJTVDQkFDS0VORCU1Q0FJX2NoYXRib3QlNUNzcmMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDaUY7QUFDOUo7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc3Npc3RhbnRzLW5leHRqcy8/N2MyOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxDaGFkcmlja1xcXFxEb2N1bWVudHNcXFxcdGVybTVfYWlfY2hhdGJvdFxcXFxJTS1DT05ORUNURURcXFxcQkFDS0VORFxcXFxBSV9jaGF0Ym90XFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGFzc2lzdGFudHNcXFxcdGhyZWFkc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXNzaXN0YW50cy90aHJlYWRzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXNzaXN0YW50cy90aHJlYWRzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxDaGFkcmlja1xcXFxEb2N1bWVudHNcXFxcdGVybTVfYWlfY2hhdGJvdFxcXFxJTS1DT05ORUNURURcXFxcQkFDS0VORFxcXFxBSV9jaGF0Ym90XFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXGFzc2lzdGFudHNcXFxcdGhyZWFkc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/assistants/threads/route.ts":
/*!*********************************************!*\
  !*** ./app/api/assistants/threads/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _app_openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/app/openai */ \"(rsc)/./app/openai.ts\");\n\nconst runtime = \"nodejs\";\n// Create a new thread\nasync function POST() {\n    const thread = await _app_openai__WEBPACK_IMPORTED_MODULE_0__.openai.beta.threads.create();\n    return Response.json({\n        threadId: thread.id\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBc0M7QUFFL0IsTUFBTUMsVUFBVSxTQUFTO0FBRWhDLHNCQUFzQjtBQUNmLGVBQWVDO0lBQ3BCLE1BQU1DLFNBQVMsTUFBTUgsK0NBQU1BLENBQUNJLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxNQUFNO0lBQy9DLE9BQU9DLFNBQVNDLElBQUksQ0FBQztRQUFFQyxVQUFVTixPQUFPTyxFQUFFO0lBQUM7QUFDN0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc3Npc3RhbnRzLW5leHRqcy8uL2FwcC9hcGkvYXNzaXN0YW50cy90aHJlYWRzL3JvdXRlLnRzPzg1NjciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgb3BlbmFpIH0gZnJvbSBcIkAvYXBwL29wZW5haVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSBcIm5vZGVqc1wiO1xyXG5cclxuLy8gQ3JlYXRlIGEgbmV3IHRocmVhZFxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVCgpIHtcclxuICBjb25zdCB0aHJlYWQgPSBhd2FpdCBvcGVuYWkuYmV0YS50aHJlYWRzLmNyZWF0ZSgpO1xyXG4gIHJldHVybiBSZXNwb25zZS5qc29uKHsgdGhyZWFkSWQ6IHRocmVhZC5pZCB9KTtcclxufVxyXG4iXSwibmFtZXMiOlsib3BlbmFpIiwicnVudGltZSIsIlBPU1QiLCJ0aHJlYWQiLCJiZXRhIiwidGhyZWFkcyIsImNyZWF0ZSIsIlJlc3BvbnNlIiwianNvbiIsInRocmVhZElkIiwiaWQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/assistants/threads/route.ts\n");

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
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/formdata-node","vendor-chunks/tr46","vendor-chunks/openai","vendor-chunks/web-streams-polyfill","vendor-chunks/next","vendor-chunks/node-fetch","vendor-chunks/whatwg-url","vendor-chunks/event-target-shim","vendor-chunks/agentkeepalive","vendor-chunks/form-data-encoder","vendor-chunks/webidl-conversions","vendor-chunks/abort-controller","vendor-chunks/ms","vendor-chunks/humanize-ms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Csrc&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();