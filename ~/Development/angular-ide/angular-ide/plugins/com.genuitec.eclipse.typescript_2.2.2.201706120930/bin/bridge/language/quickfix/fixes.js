"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var quickFixes_1 = require("../../quickFixes");
var TSQuickFixProvider = (function () {
    function TSQuickFixProvider() {
        this.quickFixes = {};
        if (ts.getSupportedCodeFixes) {
            var dynamicProvider = new TSCodeFixDynamicProvider();
            for (var _i = 0, _a = ts.getSupportedCodeFixes(); _i < _a.length; _i++) {
                var code = _a[_i];
                this.quickFixes[code] = dynamicProvider;
            }
        }
    }
    TSQuickFixProvider.prototype.register = function (code, quickFix) {
        this.quickFixes[code] = quickFix;
    };
    TSQuickFixProvider.prototype.getQuickFixes = function (file, diag) {
        var provider = this.quickFixes[diag.code];
        if (provider) {
            return provider.getQuickFixes(file, diag);
        }
    };
    TSQuickFixProvider.prototype.createDynamicQuickFixes = function (service, request, formattingOptions) {
        var type = request.type.split(":", 4);
        if (type.length > 3 && type[0] === "dynamic" && type[1] === "ts") {
            var code = Number.parseInt(type[2]);
            var provider = this.quickFixes[code];
            if (provider && provider.createDynamicQuickFix) {
                return provider.createDynamicQuickFix(service, request, code, formattingOptions);
            }
        }
    };
    TSQuickFixProvider.prototype.createQuickFix = function (service, quickFixRequest, formattingOptions) {
        var type = quickFixRequest.type.split(":", 3);
        if (type.length > 2 && type[0] === "ts") {
            var code = Number.parseInt(type[1]);
            var provider = this.quickFixes[code];
            if (provider && provider.createQuickFix) {
                return provider.createQuickFix(service, quickFixRequest, code, formattingOptions);
            }
        }
    };
    return TSQuickFixProvider;
}());
exports.ts_priv = ts;
var TSCodeFixDynamicProvider = (function () {
    function TSCodeFixDynamicProvider() {
    }
    TSCodeFixDynamicProvider.prototype.getQuickFixes = function (file, diag) {
        return [new quickFixes_1.QuickFix(undefined, undefined, undefined, "dynamic:ts:" + diag.code + ":ts-codefix", quickFixes_1.QuickFix.REL_HIGHEST)];
    };
    TSCodeFixDynamicProvider.prototype.createDynamicQuickFix = function (service, quickFixRequest, code) {
        var fixes = service.getCodeFixesAtPosition(quickFixRequest.fileName, quickFixRequest.start, quickFixRequest.end, [code]);
        fixes.forEach(function (fix) { return fix.changes.forEach(function (ch) {
            if (ch.fileName !== quickFixRequest.fileName) {
                throw new Error("Dynamic fixes are not supported for multiple files");
            }
        }); });
        return fixes.map(function (fix) { return new quickFixes_1.DynamicQuickFix(fix.description, fix.description, "fix", "no-grouping:ts:" + code, quickFixes_1.QuickFix.REL_HIGHEST, undefined, fix.changes.map(function (change) { return change.textChanges; }).reduce(function (res, arr) { return res.concat.apply(res, arr); }, [])); });
    };
    return TSCodeFixDynamicProvider;
}());
exports.tsQuickFixProvider = new TSQuickFixProvider();
require("./fixExtendsInterfaceBecomesImplements");
require("./fixClassIncorrectlyImplementsInterface");
