"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const storage_1 = require("./config/storage");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const swagger_1 = require("./config/swagger");
function createApp() {
    const app = (0, express_1.default)();
    // Security & Parsing Middlewares
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Swagger Interactive Documentation UI
    (0, swagger_1.setupSwagger)(app);
    // Static Public Uploads Serving
    app.use('/uploads', express_1.default.static(storage_1.storageConfig.uploadDir));
    // Primary API Router
    app.use(env_1.env.API_PREFIX, routes_1.default);
    // 404 & Global Error Handling
    app.use(not_found_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
}
exports.app = createApp();
