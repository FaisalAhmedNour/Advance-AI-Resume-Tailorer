"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var API_BASE = {
    parser: 'http://localhost:3001/parse',
    analyzer: 'http://localhost:3002/analyze',
    rewrite: 'http://localhost:3003/rewrite',
    score: 'http://localhost:3004/score',
    export: 'http://localhost:3005/api/v1/export',
};
function runTest() {
    return __awaiter(this, void 0, void 0, function () {
        var resumeText, jdText, resumeObj, r1, d1, e_1, jdAnalysis, r2, d2, e_2, allBullets, rewriteMap, keywords, _i, allBullets_1, bullet, r3, d3, e_3, tailoredResume, r4a, beforeScoreData, r4b, afterScoreData, before, after, kwBefore, kwAfter, e_4, r5, _a, buff, e_5;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('--- STARTING INTEGRATION TEST ---');
                    resumeText = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'tests', 'sample_data', 'resumes', 'resume_01.txt'), 'utf-8');
                    jdText = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'tests', 'sample_data', 'jds', 'jd_01.txt'), 'utf-8');
                    // 2. Parse Resume
                    console.log('[1/5] Parsing Resume...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(API_BASE.parser, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: resumeText }),
                        })];
                case 2:
                    r1 = _e.sent();
                    return [4 /*yield*/, r1.json()];
                case 3:
                    d1 = _e.sent();
                    resumeObj = d1.resume;
                    if (!((_b = resumeObj === null || resumeObj === void 0 ? void 0 : resumeObj.contact) === null || _b === void 0 ? void 0 : _b.name))
                        throw new Error('Missing name in parsed resume');
                    console.log("\u2705 Parsed Resume for: ".concat(resumeObj.contact.name));
                    console.log('--- Parsed Experience Blob ---');
                    console.log(JSON.stringify(resumeObj.experience, null, 2));
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _e.sent();
                    console.error('❌ Parse Failed:', e_1.message);
                    return [2 /*return*/];
                case 5:
                    // 3. Analyze JD
                    console.log('[2/5] Analyzing JD...');
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 9, , 10]);
                    return [4 /*yield*/, fetch(API_BASE.analyzer, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jdText: jdText }),
                        })];
                case 7:
                    r2 = _e.sent();
                    return [4 /*yield*/, r2.json()];
                case 8:
                    d2 = _e.sent();
                    jdAnalysis = d2.jd;
                    if (!(jdAnalysis === null || jdAnalysis === void 0 ? void 0 : jdAnalysis.title))
                        throw new Error('Missing JD title');
                    console.log("\u2705 Analyzed JD for: ".concat(jdAnalysis.title, " (Found ").concat(((_c = jdAnalysis.keywords) === null || _c === void 0 ? void 0 : _c.length) || 0, " keywords)"));
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _e.sent();
                    console.error('❌ JD Analysis Failed:', e_2.message);
                    return [2 /*return*/];
                case 10:
                    // 4. Rewrite Bullets
                    console.log('[3/5] Rewriting Bullets...');
                    allBullets = [];
                    if (resumeObj.experience) {
                        resumeObj.experience.forEach(function (e) {
                            if (e.bullets)
                                allBullets.push.apply(allBullets, e.bullets);
                        });
                    }
                    console.log("Found ".concat(allBullets.length, " bullets to rewrite."));
                    rewriteMap = {};
                    _e.label = 11;
                case 11:
                    _e.trys.push([11, 17, , 18]);
                    keywords = __spreadArray(__spreadArray([], (jdAnalysis.requiredSkills || []), true), (jdAnalysis.keywords || []), true).slice(0, 15);
                    _i = 0, allBullets_1 = allBullets;
                    _e.label = 12;
                case 12:
                    if (!(_i < allBullets_1.length)) return [3 /*break*/, 16];
                    bullet = allBullets_1[_i];
                    return [4 /*yield*/, fetch(API_BASE.rewrite, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ originalBullet: bullet, jdKeywords: keywords }),
                        })];
                case 13:
                    r3 = _e.sent();
                    return [4 /*yield*/, r3.json()];
                case 14:
                    d3 = _e.sent();
                    if (!d3.rewritten)
                        throw new Error("Missing rewritten text for bullet: ".concat(bullet));
                    if (bullet !== d3.rewritten) {
                        console.log("\u2705 Rewrote: \"".concat(bullet.substring(0, 30), "...\" -> \"").concat(d3.rewritten.substring(0, 30), "...\""));
                    }
                    else {
                        console.log("\u26A0\uFE0F Unchanged: \"".concat(bullet.substring(0, 30), "...\""));
                    }
                    rewriteMap[bullet] = d3.rewritten;
                    _e.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 12];
                case 16: return [3 /*break*/, 18];
                case 17:
                    e_3 = _e.sent();
                    console.error('❌ Rewrite Failed:', e_3.message);
                    return [2 /*return*/];
                case 18:
                    tailoredResume = JSON.parse(JSON.stringify(resumeObj));
                    (_d = tailoredResume.experience) === null || _d === void 0 ? void 0 : _d.forEach(function (exp) {
                        if (exp.bullets) {
                            exp.bullets = exp.bullets.map(function (b) { return rewriteMap[b] || b; });
                        }
                    });
                    // 5. Score Delta
                    console.log('[4/5] Scoring Resume (Before vs After)...');
                    _e.label = 19;
                case 19:
                    _e.trys.push([19, 24, , 25]);
                    return [4 /*yield*/, fetch(API_BASE.score, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ resumeData: resumeObj, jdData: jdAnalysis }),
                        })];
                case 20:
                    r4a = _e.sent();
                    return [4 /*yield*/, r4a.json()];
                case 21:
                    beforeScoreData = _e.sent();
                    return [4 /*yield*/, fetch(API_BASE.score, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ resumeData: tailoredResume, jdData: jdAnalysis }),
                        })];
                case 22:
                    r4b = _e.sent();
                    return [4 /*yield*/, r4b.json()];
                case 23:
                    afterScoreData = _e.sent();
                    before = beforeScoreData.score.overallScore;
                    after = afterScoreData.score.overallScore;
                    kwBefore = beforeScoreData.score.breakdown.keywordCoverage;
                    kwAfter = afterScoreData.score.breakdown.keywordCoverage;
                    console.log("Score: ".concat(before, "% -> ").concat(after, "%"));
                    console.log("Keyword Coverage: ".concat(kwBefore, "% -> ").concat(kwAfter, "%"));
                    if (after > before) {
                        console.log("\u2705 Score successfully improved!");
                    }
                    else {
                        console.log("\u26A0\uFE0F Score did not improve. (Check rewrites/keywords delta)");
                    }
                    return [3 /*break*/, 25];
                case 24:
                    e_4 = _e.sent();
                    console.error('❌ Scoring Failed:', e_4.message);
                    return [2 /*return*/];
                case 25:
                    // 6. Export PDF
                    console.log('[5/5] Exporting to PDF...');
                    _e.label = 26;
                case 26:
                    _e.trys.push([26, 31, , 32]);
                    return [4 /*yield*/, fetch(API_BASE.export, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tailoredResume: tailoredResume, template: 'modern' }),
                        })];
                case 27:
                    r5 = _e.sent();
                    if (!!r5.ok) return [3 /*break*/, 29];
                    _a = Error.bind;
                    return [4 /*yield*/, r5.text()];
                case 28: throw new (_a.apply(Error, [void 0, _e.sent()]))();
                case 29: return [4 /*yield*/, r5.arrayBuffer()];
                case 30:
                    buff = _e.sent();
                    if (buff.byteLength < 5000)
                        throw new Error("PDF seems too small (".concat(buff.byteLength, " bytes)"));
                    console.log("\u2705 PDF Generated Successfully! (".concat(buff.byteLength, " bytes)"));
                    return [3 /*break*/, 32];
                case 31:
                    e_5 = _e.sent();
                    console.error('❌ PDF Export Failed:', e_5.message);
                    return [2 /*return*/];
                case 32:
                    console.log('--- INTEGRATION TEST COMPLETE ---');
                    return [2 /*return*/];
            }
        });
    });
}
runTest().catch(console.error);
