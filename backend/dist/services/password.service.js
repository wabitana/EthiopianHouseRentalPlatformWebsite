"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class PasswordService {
    static async hash(password) {
        return bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async compare(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
}
exports.PasswordService = PasswordService;
PasswordService.SALT_ROUNDS = 10;
