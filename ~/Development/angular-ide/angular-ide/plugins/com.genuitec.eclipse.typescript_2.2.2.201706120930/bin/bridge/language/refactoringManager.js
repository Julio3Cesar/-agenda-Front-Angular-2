"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var languageEndpoint_1 = require("./languageEndpoint");
var modelDeltaProvider_1 = require("./modelDeltaProvider");
var path = require("path");
var separator = '/';
var RefactoringManager = (function () {
    function RefactoringManager(host) {
        this.host = host;
    }
    RefactoringManager.prototype.prepareRefactoringChanges = function (source, destination, preChanges) {
        return preChanges ? this.preRefactoringChanges(source, destination) : this.postRefactoringChanges(source, destination);
    };
    RefactoringManager.prototype.findImportPath = function (importNode, file, parent) {
        var importPath = importNode.text;
        var resolved = languageEndpoint_1.getProperty(file.resolvedModules, importPath);
        var module_ = true;
        if (resolved) {
            if (resolved.resolvedFileName.indexOf('/node_modules/') < 0) {
                importPath = resolved.resolvedFileName;
                module_ = false;
            }
        }
        else if (!modelDeltaProvider_1.moduleHasNonRelativeName(importPath)) {
            importPath = this.resolveModuleName(parent, importPath);
            module_ = false;
        }
        return module_ ? null : importPath;
    };
    RefactoringManager.prototype.postRefactoringChanges = function (source, destination) {
        var _this = this;
        var result = {};
        var sourceFiles = this.host.getProgram().getSourceFiles()
            .filter(function (sourceFile) {
            return sourceFile.fileName.indexOf('/node_modules/') < 0;
        });
        sourceFiles.forEach(function (file) {
            var fileParent = path.parse(file.fileName).dir;
            if (file.imports) {
                file.imports.forEach(function (importNode) {
                    var textChanges = [];
                    var fileName = file.fileName;
                    var importPath = _this.findImportPath(importNode, file, fileParent);
                    if (importPath != null) {
                        var isDir = _this.isDirectory(source);
                        var textWithQuotes = _this.correctPath(importNode.getText(file));
                        var text = importNode.text;
                        var fullStart = importNode.getFullStart();
                        var newText = destination;
                        var moving = newText.startsWith('eclipse:');
                        var parsedPath = path.parse(source);
                        var relative = _this.correctPath(_this.stripExt(path.relative(parsedPath.dir, importPath)));
                        if (relative.endsWith('index') && !text.endsWith('index')) {
                            var length_1 = text.endsWith(separator) ? 'index'.length : 'index'.length + 1;
                            relative = relative.substr(0, relative.length - length_1);
                        }
                        if (importPath.includes(source)) {
                            if (moving) {
                                if (!fileName.includes(source)) {
                                    var normalize = _this.correctPath(path.normalize(text));
                                    if (normalize.endsWith(relative) || source == importPath) {
                                        var parent_1 = path.parse(fileName).dir;
                                        newText = _this.correctPath(path.posix.relative(parent_1, newText));
                                        if (newText == '') {
                                            newText = '.';
                                        }
                                        else if (!newText.startsWith('.')) {
                                            newText = '.' + separator + newText;
                                        }
                                        textChanges.push({ span: { start: fullStart + 2, length: text.indexOf(relative) - 1 }, newText: newText });
                                    }
                                }
                            }
                            else {
                                var resource = parsedPath.name;
                                var length_2 = resource.length;
                                var index = -1;
                                if (isDir) {
                                    index = textWithQuotes.indexOf(relative);
                                }
                                else if (source == importPath) {
                                    index = textWithQuotes.lastIndexOf(resource);
                                    if (index == -1) {
                                        index = text.length + 1;
                                        length_2 = 0;
                                        if (!text.endsWith('/')) {
                                            newText = separator + newText;
                                        }
                                    }
                                }
                                if (index >= 0) {
                                    index++;
                                    textChanges.push({ span: { start: fullStart + index, length: length_2 }, newText: newText });
                                }
                            }
                        }
                        if (textChanges.length > 0) {
                            var oldChanges = result[fileName];
                            result[fileName] = oldChanges ? oldChanges.concat(textChanges) : textChanges;
                        }
                    }
                });
            }
        });
        return result;
    };
    RefactoringManager.prototype.preRefactoringChanges = function (source, destination) {
        var _this = this;
        var result = {};
        var isDir = this.isDirectory(source);
        var sourceFiles = this.host.getProgram().getSourceFiles()
            .filter(function (sourceFile) {
            return sourceFile.fileName == source || sourceFile.fileName.indexOf(source) >= 0;
        });
        sourceFiles.forEach(function (file) {
            var fileParent = path.posix.parse(file.fileName).dir;
            var textChanges = [];
            if (file.imports) {
                var parsedPath_1 = path.posix.parse(source);
                file.imports.forEach(function (importNode) {
                    var importPath = _this.findImportPath(importNode, file, fileParent);
                    if (importPath != null && (!isDir || !importPath.includes(source))) {
                        var newText = destination;
                        var text = importNode.text;
                        if (isDir) {
                            var relative = _this.correctPath(_this.stripExt(path.posix.relative(parsedPath_1.dir, file.parent)));
                            if (!newText.endsWith(separator)) {
                                newText.concat(separator);
                            }
                            newText = newText.concat(relative);
                        }
                        newText = _this.stripExt(path.posix.relative(newText, importPath));
                        if (!newText.startsWith(".")) {
                            newText = '.' + separator + newText;
                        }
                        if (newText.endsWith('index') && !text.endsWith('index')) {
                            var length_3 = text.endsWith(separator) ? 'index'.length : 'index'.length + 1;
                            newText = newText.substr(0, newText.length - length_3);
                        }
                        if (text != newText) {
                            var start = importNode.getFullStart() + 2;
                            var length_4 = importNode.text.length;
                            textChanges.push({ span: { start: start, length: length_4 }, newText: newText });
                        }
                    }
                });
            }
            if (textChanges.length > 0) {
                result[file.fileName] = textChanges;
            }
        });
        return result;
    };
    RefactoringManager.prototype.resolveModuleName = function (parentName, moduleName) {
        if (moduleName.charAt(moduleName.length - 1) === separator) {
            moduleName = moduleName.concat("index.ts");
        }
        return path.posix.join(parentName, moduleName);
    };
    RefactoringManager.prototype.stripExt = function (name) {
        if (name.endsWith(".ts") || name.endsWith(".js")) {
            return name.substr(0, name.length - 3);
        }
        else if (name.endsWith(".tsx") || name.endsWith(".jsx")) {
            return name.substr(0, name.length - 4);
        }
        return name;
    };
    RefactoringManager.prototype.correctPath = function (text) { return text.replace(/\\/g, separator); };
    RefactoringManager.prototype.isDirectory = function (text) { return text.endsWith(separator); };
    return RefactoringManager;
}());
exports.RefactoringManager = RefactoringManager;
