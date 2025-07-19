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
exports.id = "app/api/assistants/threads/[threadId]/actions/route";
exports.ids = ["app/api/assistants/threads/[threadId]/actions/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_openai_assistants_quickstart_app_api_assistants_threads_threadId_actions_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/assistants/threads/[threadId]/actions/route.ts */ \"(rsc)/./app/api/assistants/threads/[threadId]/actions/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/assistants/threads/[threadId]/actions/route\",\n        pathname: \"/api/assistants/threads/[threadId]/actions\",\n        filename: \"route\",\n        bundlePath: \"app/api/assistants/threads/[threadId]/actions/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Chadrick\\\\Documents\\\\term5_ai_chatbot\\\\IM-CONNECTED\\\\BACKEND\\\\AI_chatbot\\\\openai-assistants-quickstart\\\\app\\\\api\\\\assistants\\\\threads\\\\[threadId]\\\\actions\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Chadrick_Documents_term5_ai_chatbot_IM_CONNECTED_BACKEND_AI_chatbot_openai_assistants_quickstart_app_api_assistants_threads_threadId_actions_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/assistants/threads/[threadId]/actions/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhc3Npc3RhbnRzJTJGdGhyZWFkcyUyRiU1QnRocmVhZElkJTVEJTJGYWN0aW9ucyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXNzaXN0YW50cyUyRnRocmVhZHMlMkYlNUJ0aHJlYWRJZCU1RCUyRmFjdGlvbnMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhc3Npc3RhbnRzJTJGdGhyZWFkcyUyRiU1QnRocmVhZElkJTVEJTJGYWN0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNDaGFkcmljayU1Q0RvY3VtZW50cyU1Q3Rlcm01X2FpX2NoYXRib3QlNUNJTS1DT05ORUNURUQlNUNCQUNLRU5EJTVDQUlfY2hhdGJvdCU1Q29wZW5haS1hc3Npc3RhbnRzLXF1aWNrc3RhcnQlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q0NoYWRyaWNrJTVDRG9jdW1lbnRzJTVDdGVybTVfYWlfY2hhdGJvdCU1Q0lNLUNPTk5FQ1RFRCU1Q0JBQ0tFTkQlNUNBSV9jaGF0Ym90JTVDb3BlbmFpLWFzc2lzdGFudHMtcXVpY2tzdGFydCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUMrSDtBQUM1TTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL2Fzc2lzdGFudHMtbmV4dGpzLz9hNGU0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXENoYWRyaWNrXFxcXERvY3VtZW50c1xcXFx0ZXJtNV9haV9jaGF0Ym90XFxcXElNLUNPTk5FQ1RFRFxcXFxCQUNLRU5EXFxcXEFJX2NoYXRib3RcXFxcb3BlbmFpLWFzc2lzdGFudHMtcXVpY2tzdGFydFxcXFxhcHBcXFxcYXBpXFxcXGFzc2lzdGFudHNcXFxcdGhyZWFkc1xcXFxbdGhyZWFkSWRdXFxcXGFjdGlvbnNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9bdGhyZWFkSWRdL2FjdGlvbnMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9hY3Rpb25zXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9hY3Rpb25zL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcQ2hhZHJpY2tcXFxcRG9jdW1lbnRzXFxcXHRlcm01X2FpX2NoYXRib3RcXFxcSU0tQ09OTkVDVEVEXFxcXEJBQ0tFTkRcXFxcQUlfY2hhdGJvdFxcXFxvcGVuYWktYXNzaXN0YW50cy1xdWlja3N0YXJ0XFxcXGFwcFxcXFxhcGlcXFxcYXNzaXN0YW50c1xcXFx0aHJlYWRzXFxcXFt0aHJlYWRJZF1cXFxcYWN0aW9uc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hc3Npc3RhbnRzL3RocmVhZHMvW3RocmVhZElkXS9hY3Rpb25zL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/assistants/threads/[threadId]/actions/route.ts":
/*!****************************************************************!*\
  !*** ./app/api/assistants/threads/[threadId]/actions/route.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _app_openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/app/openai */ \"(rsc)/./app/openai.ts\");\n\n// Send a new message to a thread\nasync function POST(request, { params: { threadId } }) {\n    const { toolCallOutputs, runId } = await request.json();\n    const stream = _app_openai__WEBPACK_IMPORTED_MODULE_0__.openai.beta.threads.runs.submitToolOutputsStream(threadId, runId, // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },\n    {\n        tool_outputs: toolCallOutputs\n    });\n    return new Response(stream.toReadableStream());\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9bdGhyZWFkSWRdL2FjdGlvbnMvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBc0M7QUFFdEMsaUNBQWlDO0FBQzFCLGVBQWVDLEtBQUtDLE9BQU8sRUFBRSxFQUFFQyxRQUFRLEVBQUVDLFFBQVEsRUFBRSxFQUFFO0lBQzFELE1BQU0sRUFBRUMsZUFBZSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNSixRQUFRSyxJQUFJO0lBRXJELE1BQU1DLFNBQVNSLCtDQUFNQSxDQUFDUyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDQyx1QkFBdUIsQ0FDN0RSLFVBQ0FFLE9BQ0Esb0VBQW9FO0lBQ3BFO1FBQUVPLGNBQWNSO0lBQWdCO0lBR2xDLE9BQU8sSUFBSVMsU0FBU04sT0FBT08sZ0JBQWdCO0FBQzdDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXNzaXN0YW50cy1uZXh0anMvLi9hcHAvYXBpL2Fzc2lzdGFudHMvdGhyZWFkcy9bdGhyZWFkSWRdL2FjdGlvbnMvcm91dGUudHM/ZGIzNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvcGVuYWkgfSBmcm9tIFwiQC9hcHAvb3BlbmFpXCI7XHJcblxyXG4vLyBTZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSB0aHJlYWRcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdCwgeyBwYXJhbXM6IHsgdGhyZWFkSWQgfSB9KSB7XHJcbiAgY29uc3QgeyB0b29sQ2FsbE91dHB1dHMsIHJ1bklkIH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcclxuXHJcbiAgY29uc3Qgc3RyZWFtID0gb3BlbmFpLmJldGEudGhyZWFkcy5ydW5zLnN1Ym1pdFRvb2xPdXRwdXRzU3RyZWFtKFxyXG4gICAgdGhyZWFkSWQsXHJcbiAgICBydW5JZCxcclxuICAgIC8vIHsgdG9vbF9vdXRwdXRzOiBbeyBvdXRwdXQ6IHJlc3VsdCwgdG9vbF9jYWxsX2lkOiB0b29sQ2FsbElkIH1dIH0sXHJcbiAgICB7IHRvb2xfb3V0cHV0czogdG9vbENhbGxPdXRwdXRzIH1cclxuICApO1xyXG5cclxuICByZXR1cm4gbmV3IFJlc3BvbnNlKHN0cmVhbS50b1JlYWRhYmxlU3RyZWFtKCkpO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJvcGVuYWkiLCJQT1NUIiwicmVxdWVzdCIsInBhcmFtcyIsInRocmVhZElkIiwidG9vbENhbGxPdXRwdXRzIiwicnVuSWQiLCJqc29uIiwic3RyZWFtIiwiYmV0YSIsInRocmVhZHMiLCJydW5zIiwic3VibWl0VG9vbE91dHB1dHNTdHJlYW0iLCJ0b29sX291dHB1dHMiLCJSZXNwb25zZSIsInRvUmVhZGFibGVTdHJlYW0iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/assistants/threads/[threadId]/actions/route.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/formdata-node","vendor-chunks/next","vendor-chunks/tr46","vendor-chunks/web-streams-polyfill","vendor-chunks/openai","vendor-chunks/node-fetch","vendor-chunks/whatwg-url","vendor-chunks/event-target-shim","vendor-chunks/agentkeepalive","vendor-chunks/form-data-encoder","vendor-chunks/webidl-conversions","vendor-chunks/abort-controller","vendor-chunks/ms","vendor-chunks/humanize-ms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&page=%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassistants%2Fthreads%2F%5BthreadId%5D%2Factions%2Froute.ts&appDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CChadrick%5CDocuments%5Cterm5_ai_chatbot%5CIM-CONNECTED%5CBACKEND%5CAI_chatbot%5Copenai-assistants-quickstart&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();