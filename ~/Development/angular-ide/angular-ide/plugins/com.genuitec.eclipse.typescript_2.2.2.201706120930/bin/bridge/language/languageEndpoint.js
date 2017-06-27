"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdoc_1 = require("../jsdoc");
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var main_1 = require("../main");
var languageServiceHost_1 = require("./languageServiceHost");
var fileInfo_1 = require("./fileInfo");
var services_1 = require("../services");
var progress_1 = require("../progress");
var quickFixes_1 = require("../quickFixes");
var fs_1 = require("fs");
var BUILD_STATE = main_1.metadataDir + "/buildState.json";
var LanguageEndpoint = (function () {
    function LanguageEndpoint() {
        this.documentRegistry = ts.createDocumentRegistry(ts.sys.useCaseSensitiveFileNames);
        this.fileInfos = Object.create(null);
        this.projectRoots = Object.create(null);
        this.languageServices = Object.create(null);
        this.languageServiceHosts = Object.create(null);
        this.version = 0;
        services_1.registry.registerProvider(this);
    }
    LanguageEndpoint.prototype.cleanProject = function (projectName) {
        var _this = this;
        if (this.isProjectInitialized(projectName)) {
            Object.getOwnPropertyNames(this.fileInfos).forEach(function (fileName) {
                if (_this.getProjectName(fileName) === projectName) {
                    _this.fileInfos[fileName].lazyUpdate();
                }
            });
            if (this.buildState && this.buildState[projectName]) {
                delete this.buildState[projectName];
                this.saveBuildState();
            }
            delete this.languageServices[projectName];
            delete this.languageServiceHosts[projectName];
        }
    };
    LanguageEndpoint.prototype.initializeProject = function (projectName, projectFolder, compilationSettings, sourceRoots, tsConfigDir) {
        this.cleanProject(projectName);
        this.projectRoots[projectName] = projectFolder;
        this.languageServices[projectName] = this.createProjectLanguageService(projectName, compilationSettings, sourceRoots, tsConfigDir);
    };
    LanguageEndpoint.prototype.getProjectVersion = function () {
        return "" + this.version;
    };
    LanguageEndpoint.prototype.updateConfiguration = function (projectName, compilationSettings, sourceRoots) {
        if (this.languageServiceHosts[projectName] !== undefined) {
            this.languageServiceHosts[projectName].updateConfiguration(compilationSettings, sourceRoots);
        }
    };
    LanguageEndpoint.prototype.isProjectInitialized = function (projectName) {
        return this.languageServices[projectName] !== undefined;
    };
    LanguageEndpoint.prototype.getAllTodoComments = function (projectName) {
        var _this = this;
        var todos = {};
        this.getSourceFiles(projectName)
            .forEach(function (fileName) {
            todos[fileName] = _this.getTodoComments(projectName, fileName);
        });
        return todos;
    };
    LanguageEndpoint.prototype.getAllDiagnostics = function (projectName) {
        var _this = this;
        var diagnostics = Object.create(null);
        this.getSourceFiles(projectName)
            .forEach(function (fileName) {
            diagnostics[fileName] = _this.getDiagnostics(projectName, fileName, true);
        });
        return diagnostics;
    };
    LanguageEndpoint.prototype.getDiagnostics = function (serviceKey, fileName, semantic) {
        var service = this.getLaunguageService(serviceKey, fileName);
        if (!service || !this.isSourceFile(serviceKey, fileName)) {
            return [];
        }
        var diagnostics = service.getSyntacticDiagnostics(fileName);
        var fileInfo = this.fileInfos[fileName];
        if (semantic && diagnostics.length === 0
            && fileInfo
            && (!fileInfo.getIsolatedLaunguageService() || this.isSourceFile(serviceKey, fileName))) {
            diagnostics = service.getSemanticDiagnostics(fileName);
        }
        return diagnostics.map(function (diagnostic) {
            return {
                start: diagnostic.start,
                length: diagnostic.length,
                line: diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line,
                text: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
            };
        });
    };
    LanguageEndpoint.prototype.getEmitOutput = function (serviceKey, fileName) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (languageService) {
            return languageService.getEmitOutput(fileName).outputFiles;
        }
        return [];
    };
    LanguageEndpoint.prototype.findReferences = function (serviceKey, fileName, position) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        var references = languageService.getReferencesAtPosition(fileName, position);
        return references.map(function (reference) {
            var sourceFile = languageService.getProgram().getSourceFile(reference.fileName);
            var lineNumber = sourceFile.getLineAndCharacterOfPosition(reference.textSpan.start).line;
            var lineStart = sourceFile.getPositionOfLineAndCharacter(lineNumber, 0);
            var lineEnd = sourceFile.getPositionOfLineAndCharacter(lineNumber + 1, 0);
            var line = sourceFile.text.substring(lineStart, lineEnd);
            return {
                fileName: reference.fileName,
                line: line,
                lineNumber: lineNumber,
                lineStart: lineStart,
                textSpan: reference.textSpan
            };
        });
    };
    LanguageEndpoint.prototype.findRenameLocations = function (serviceKey, fileName, position, findInStrings, findInComments) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        return languageService.findRenameLocations(fileName, position, findInStrings, findInComments);
    };
    LanguageEndpoint.prototype.prepareRefactoringChanges = function (projectName, source, destination, preChanges) {
        var host = this.languageServiceHosts[projectName];
        if (host) {
            return host.prepareRefactoringChanges(source, destination, preChanges);
        }
    };
    LanguageEndpoint.prototype.getBraceMatchingAtPosition = function (serviceKey, fileName, position) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        return languageService.getBraceMatchingAtPosition(fileName, position);
    };
    LanguageEndpoint.prototype.getCompletionsAtPosition = function (serviceKey, fileName, position, prefix) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return null;
        }
        var completions = languageService.getCompletionsAtPosition(fileName, position);
        var result;
        if (completions) {
            result = {
                entries: completions.entries,
                isMemberCompletion: completions.isMemberCompletion,
                isNewIdentifierLocation: completions.isNewIdentifierLocation,
                tsCompletionsEmpty: false
            };
        }
        else {
            result = {
                entries: [],
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                tsCompletionsEmpty: true
            };
        }
        if (completions != null) {
            var host = this.languageServiceHosts[serviceKey];
            if (host) {
                host.addCompletions(result, fileName, position, prefix);
            }
        }
        for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
            var provider = _a[_i];
            if (provider.addCompletions) {
                provider.addCompletions(result, serviceKey, fileName, position);
            }
        }
        return result;
    };
    LanguageEndpoint.prototype.getCompletionEntryDetails = function (serviceKey, fileName, position, name, kind) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return null;
        }
        var result = languageService.getCompletionEntryDetails(fileName, position, name);
        if (result) {
            var symbol = languageService.getCompletionEntrySymbol ?
                languageService.getCompletionEntrySymbol(fileName, position, name) : null;
            return jsdoc_1.formatCompletionEntryDetails(result, null, symbol, languageService.getProgram().getTypeChecker());
        }
        for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
            var provider = _a[_i];
            if (provider.getCompletionEntryDetails && provider !== this) {
                result = provider.getCompletionEntryDetails(serviceKey, fileName, position, name, kind);
                if (result) {
                    return result;
                }
            }
        }
    };
    LanguageEndpoint.prototype.getCompletionChanges = function (projectName, fileName, position, replacementLength, name, type) {
        var host = this.languageServiceHosts[projectName];
        if (!host) {
            return [];
        }
        return host.getCompletionChanges(fileName, position, replacementLength, name, type);
    };
    LanguageEndpoint.prototype.getDefinitionAtPosition = function (serviceKey, fileName, position) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return null;
        }
        return languageService.getDefinitionAtPosition(fileName, position);
    };
    LanguageEndpoint.prototype.getDocumentHighlights = function (serviceKey, fileName, position, filesToSearch) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        return languageService.getDocumentHighlights(fileName, position, filesToSearch);
    };
    LanguageEndpoint.prototype.getFormattingEditsForRange = function (serviceKey, fileName, start, end, options) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        return languageService.getFormattingEditsForRange(fileName, start, end, options);
    };
    LanguageEndpoint.prototype.getIndentationAtPosition = function (serviceKey, fileName, position, options) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return 0;
        }
        return languageService.getIndentationAtPosition(fileName, position, options);
    };
    LanguageEndpoint.prototype.getNameOrDottedNameSpan = function (serviceKey, fileName, startPos, endPos) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return null;
        }
        return languageService.getNameOrDottedNameSpan(fileName, startPos, endPos);
    };
    LanguageEndpoint.prototype.getNavigationBarItems = function (serviceKey, fileName) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        return languageService.getNavigationBarItems(fileName);
    };
    LanguageEndpoint.prototype.getQuickInfoAtPosition = function (serviceKey, fileName, position) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return null;
        }
        var info = languageService.getQuickInfoAtPosition(fileName, position);
        if (info) {
            if (ts.getTouchingPropertyName) {
                var program = languageService.getProgram();
                var sourceFile = program.getSourceFile(fileName);
                var node = ts.getTouchingPropertyName(sourceFile, position);
                var typeChecker = program.getTypeChecker();
                var symbol = typeChecker.getSymbolAtLocation(node);
                return jsdoc_1.formatQuickInfo(info, node, symbol, typeChecker);
            }
            return jsdoc_1.formatQuickInfo(info);
        }
        else {
            for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
                var provider = _a[_i];
                if (provider.getQuickInfo) {
                    info = provider.getQuickInfo(serviceKey, fileName, position);
                    if (info) {
                        return info;
                    }
                }
            }
        }
        return;
    };
    LanguageEndpoint.prototype.getTodoComments = function (serviceKey, fileName) {
        var languageService = this.getLaunguageService(serviceKey, fileName);
        if (!languageService) {
            return [];
        }
        var descriptors = [
            { text: "TODO", priority: 0 },
            { text: "FIXME", priority: 1 },
            { text: "XXX", priority: 2 }
        ];
        var todos = languageService.getTodoComments(fileName, descriptors);
        if (todos.length > 0) {
            var sourceFile = languageService.getProgram().getSourceFile(fileName);
            return todos.map(function (todo) {
                return {
                    start: todo.position,
                    line: sourceFile.getLineAndCharacterOfPosition(todo.position).line,
                    priority: todo.descriptor.priority,
                    text: todo.message
                };
            });
        }
        return [];
    };
    LanguageEndpoint.prototype.editFile = function (fileName, offset, length, text) {
        var info = this.getFileInfo(fileName);
        if (info) {
            info.editContents(offset, length, text);
        }
        this.fileChanged(fileName);
    };
    LanguageEndpoint.prototype.setFileOpen = function (fileName, open) {
        var fileInfo = this.fileInfos[fileName];
        if (fileInfo) {
            fileInfo.setOpen(open);
        }
    };
    LanguageEndpoint.prototype.setLibContent = function (libName, libContent) {
        var libFileInfo = new fileInfo_1.FileInfo(null);
        libFileInfo.updateFile(libContent);
        this.fileInfos[libName] = libFileInfo;
        this.bumpProjectVersion();
    };
    LanguageEndpoint.prototype.updateFileContent = function (fileName, content) {
        var fileInfo = this.fileInfos[fileName];
        if (!fileInfo) {
            fileInfo = new fileInfo_1.FileInfo(fileName);
            this.fileInfos[fileName] = fileInfo;
        }
        fileInfo.updateFile(content);
        this.fileChanged(fileName);
    };
    LanguageEndpoint.prototype.fileChanged = function (fileName) {
        if (this.affectsCompilation(fileName)) {
            this.bumpProjectVersion();
            for (var _i = 0, _a = Object.keys(this.languageServiceHosts); _i < _a.length; _i++) {
                var project = _a[_i];
                var host = this.languageServiceHosts[project];
                if (host) {
                    host.filesModified([{ delta: "CHANGED", fileName: fileName }]);
                }
            }
        }
    };
    LanguageEndpoint.prototype.getBuildState = function (projectName) {
        if (!this.buildState) {
            try {
                this.buildState = JSON.parse(fs_1.readFileSync(BUILD_STATE, 'utf8'));
            }
            catch (e) {
                this.buildState = {};
            }
        }
        return this.buildState[projectName] || (this.buildState[projectName] = {});
    };
    LanguageEndpoint.prototype.saveBuildState = function () {
        if (this.buildState) {
            fs_1.writeFileSync(BUILD_STATE, JSON.stringify(this.buildState), { encoding: "utf8" });
        }
    };
    LanguageEndpoint.prototype.dispose = function () {
        this.saveBuildState();
    };
    LanguageEndpoint.prototype.updateFiles = function (deltas) {
        var _this = this;
        var toRecompile = {};
        var compilationAffected = false;
        deltas.forEach(function (delta) {
            var fileName = delta.fileName;
            var affectsCompilation = _this.affectsCompilation(fileName);
            compilationAffected = compilationAffected || affectsCompilation;
            switch (delta.delta) {
                case "ADDED":
                    if (affectsCompilation) {
                        toRecompile[_this.getProjectName(fileName)] = null;
                    }
                case "CHANGED":
                case "REMOVED":
                    var fileInfo = _this.fileInfos[fileName];
                    if (fileInfo !== undefined) {
                        if (!fileInfo.getOpen() || delta.delta !== "CHANGED") {
                            fileInfo.lazyUpdate();
                        }
                    }
                    break;
            }
        });
        for (var _i = 0, _a = Object.keys(this.languageServiceHosts); _i < _a.length; _i++) {
            var project_1 = _a[_i];
            var host = this.languageServiceHosts[project_1];
            if (host) {
                host.filesModified(deltas);
            }
        }
        for (var _b = 0, _c = Object.getOwnPropertyNames(toRecompile); _b < _c.length; _b++) {
            var project = _c[_b];
            this.forceRecompilation(project);
        }
        if (compilationAffected) {
            this.bumpProjectVersion();
        }
    };
    LanguageEndpoint.prototype.affectsCompilation = function (file) {
        return file.endsWith(".ts")
            || file.endsWith(".tsx")
            || file.endsWith(".json")
            || file.endsWith(".js")
            || file.endsWith(".jsx");
    };
    LanguageEndpoint.prototype.bumpProjectVersion = function () {
        this.version++;
    };
    LanguageEndpoint.prototype.forceRecompilation = function (projectName) {
        var program = this.getProgram(projectName);
        if (program) {
            program["getRootFileNames"] = function () { return []; };
        }
    };
    LanguageEndpoint.prototype.getFileInfo = function (fileName) {
        var fileInfo = this.fileInfos[fileName];
        if (!fileInfo) {
            var path_1 = this.resolvePath(fileName);
            try {
                if (path_1 != null && fs.statSync(path_1).isFile()) {
                    fileInfo = new fileInfo_1.FileInfo(path_1);
                    this.fileInfos[fileName] = fileInfo;
                }
            }
            catch (e) {
            }
        }
        return fileInfo;
    };
    LanguageEndpoint.prototype.getProgram = function (projectName) {
        var languageService = this.languageServices[projectName];
        if (!languageService) {
            return;
        }
        return languageService.getProgram();
    };
    LanguageEndpoint.prototype.directoryExists = function (projectName, directoryName) {
        var path = this.resolvePath(directoryName);
        if (path == null) {
            var root = projectName ? this.projectRoots[projectName] : null;
            if (root) {
                path = root.concat(directoryName);
            }
        }
        if (path != null) {
            try {
                return fs.statSync(path).isDirectory();
            }
            catch (e) {
            }
        }
        return false;
    };
    LanguageEndpoint.prototype.getDirectories = function (projectName, directoryName) {
        var rootPath = this.resolvePath(directoryName);
        if (rootPath == null) {
            var root = projectName ? this.projectRoots[projectName] : null;
            if (root) {
                rootPath = root.concat(directoryName);
            }
        }
        if (rootPath != null) {
            try {
                return fs.readdirSync(rootPath).filter(function (file) {
                    return fs.statSync(path.join(rootPath, file)).isDirectory();
                });
            }
            catch (e) {
            }
        }
        return [];
    };
    LanguageEndpoint.prototype.resolvePath = function (path) {
        var projectName = this.getProjectName(path);
        var root = projectName ? this.projectRoots[projectName] : null;
        if (root) {
            var slash = path.indexOf("/");
            if (slash > 0) {
                return root.concat(path.substring(slash + 1));
            }
            return root;
        }
        return undefined;
    };
    LanguageEndpoint.prototype.getProjectName = function (fileName) {
        if (fileName.indexOf("eclipse:") == 0) {
            var slash = fileName.indexOf("/");
            if (slash > 0) {
                return fileName.substring(8, slash);
            }
            return fileName.substring(8);
        }
        return null;
    };
    LanguageEndpoint.prototype.getSourceFiles = function (projectName) {
        var languageService = this.languageServices[projectName];
        if (!languageService) {
            return [];
        }
        return languageService.getProgram()
            .getSourceFiles()
            .filter(function (sourceFile) { return sourceFile.fileName.indexOf("/node_modules/") < 0; })
            .map(function (sourceFile) { return sourceFile.fileName; });
    };
    LanguageEndpoint.prototype.getAffectedSourceFiles = function (projectName, modifiedFiles, modifiedModules) {
        var languageServiceHost = this.languageServiceHosts[projectName];
        if (!languageServiceHost) {
            return [];
        }
        return languageServiceHost.getAffectedSourceFiles(modifiedFiles, modifiedModules);
    };
    LanguageEndpoint.prototype.getLaunguageService = function (projectName, fileName) {
        if (this.isSourceFile(projectName, fileName)) {
            return this.languageServices[projectName];
        }
        var info = this.getFileInfo(fileName);
        if (!info || !info.getOpen()) {
            return undefined;
        }
        if (!info.getIsolatedLaunguageService()) {
            info.setIsolatedLanguageService(this.createIsolatedLanguageService(fileName));
        }
        return info.getIsolatedLaunguageService();
    };
    LanguageEndpoint.prototype.isSourceFile = function (projectName, fileName) {
        var service = this.languageServices[projectName];
        if (service) {
            return service.getProgram().getSourceFiles().some(function (file) { return file.fileName === fileName; });
        }
        return false;
    };
    LanguageEndpoint.prototype.createProjectLanguageService = function (projectName, compilationSettings, sourceRoots, tsConfigDir) {
        var host = new languageServiceHost_1.LanguageServiceHost(projectName, compilationSettings, this, sourceRoots, tsConfigDir);
        this.languageServiceHosts[projectName] = host;
        var service = ts.createLanguageService(host, this.documentRegistry);
        host.setService(service);
        return service;
    };
    LanguageEndpoint.prototype.createIsolatedLanguageService = function (fileName) {
        var host = new languageServiceHost_1.LanguageServiceHost(null, {}, this, [fileName], "");
        return ts.createLanguageService(host, this.documentRegistry);
    };
    LanguageEndpoint.prototype.getLanguageServiceHost = function (projectName) {
        return this.languageServiceHosts[projectName];
    };
    LanguageEndpoint.prototype.getLanguageService = function (projectName) {
        return this.languageServices[projectName];
    };
    LanguageEndpoint.prototype.getDocumentRegistry = function () {
        return this.documentRegistry;
    };
    LanguageEndpoint.prototype.getProjectTSConfigDir = function (projectName) {
        var host = this.languageServiceHosts[projectName];
        if (host) {
            return host.getTSConfigDir();
        }
    };
    LanguageEndpoint.prototype.performValidation = function (projectName, modifiedFiles, modifiedModules, asYouType) {
        if (modifiedFiles !== null && modifiedFiles !== undefined && !asYouType) {
            modifiedFiles = this.getAffectedSourceFiles(projectName, modifiedFiles, modifiedModules);
        }
        var result = [];
        for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
            var validator = _a[_i];
            try {
                if (validator.validate) {
                    result.push(validator.validate(projectName, modifiedFiles, asYouType));
                }
            }
            catch (e) {
                main_1.main.logError(e);
            }
        }
        return Promise.all(result).then(services_1.mergeValidationResults);
    };
    LanguageEndpoint.prototype.prepareDynamicQuickFixes = function (projectName, quickFix, formattingOptions) {
        var result = [];
        for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
            var validator = _a[_i];
            try {
                if (validator.createDynamicQuickFixes) {
                    result.push(validator.createDynamicQuickFixes(projectName, quickFix, formattingOptions));
                }
            }
            catch (e) {
                main_1.main.logError(e);
            }
        }
        return Promise.all(result).then(function (dynFixes) {
            var res;
            dynFixes.forEach(function (fixes) {
                if (fixes) {
                    (_a = (res || (res = []))).push.apply(_a, fixes);
                }
                var _a;
            });
            return res;
        });
    };
    LanguageEndpoint.prototype.prepareQuickFixes = function (projectName, quickFixes, formattingOptions) {
        var result = [];
        for (var _i = 0, _a = services_1.registry.getProviders(); _i < _a.length; _i++) {
            var validator = _a[_i];
            try {
                if (validator.createQuickFixes) {
                    result.push(validator.createQuickFixes(projectName, quickFixes, formattingOptions));
                }
            }
            catch (e) {
                main_1.main.logError(e);
            }
        }
        return Promise.all(result).then(quickFixes_1.mergeQuickFixResults);
    };
    LanguageEndpoint.prototype.createCompilerHost = function (projectName) {
        var host = this.languageServiceHosts[projectName];
        var service = this.languageServices[projectName];
        if (!host || !service) {
            return null;
        }
        var settings = host.getCompilationSettings();
        var program = service.getProgram();
        function getCanonicalFileName(fileName) {
            return host.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        }
        var cancellationToken = {
            isCancellationRequested: function () {
                return host.getCancellationToken && host.getCancellationToken().isCancellationRequested();
            },
            throwIfCancellationRequested: function () {
                if (cancellationToken.isCancellationRequested()) {
                    throw new ts.OperationCanceledException();
                }
            }
        };
        var currentDirectory = host.getCurrentDirectory();
        var compilerHost = {
            getSourceFile: getOrCreateSourceFile,
            getSourceFileByPath: getOrCreateSourceFileByPath,
            getCancellationToken: function () { return cancellationToken; },
            getCanonicalFileName: getCanonicalFileName,
            useCaseSensitiveFileNames: host.useCaseSensitiveFileNames,
            getNewLine: function () { return host.getNewLine(); },
            getDefaultLibFileName: function (options) { return host.getDefaultLibFileName(options); },
            writeFile: function (fileName, data, writeByteOrderMark) { },
            getCurrentDirectory: function () { return currentDirectory; },
            fileExists: function (fileName) {
                return host.getScriptSnapshot(fileName) !== undefined;
            },
            readFile: function (fileName) {
                var snapshot = host.getScriptSnapshot(fileName);
                return snapshot && snapshot.getText(0, snapshot.getLength());
            },
            directoryExists: function (directoryName) {
                return host.directoryExists(directoryName);
            },
            getDirectories: function (path) {
                return host.getDirectories ? host.getDirectories(path) : [];
            }
        };
        var documentRegistryBucketKey = this.documentRegistry.getKeyForCompilationSettings(settings);
        return compilerHost;
        function getOrCreateSourceFile(fileName) {
            return program.getSourceFile(fileName);
        }
        function getOrCreateSourceFileByPath(fileName, path) {
            return program.getSourceFileByPath(path);
        }
    };
    LanguageEndpoint.prototype.createMarker = function (host, file, markerType, diag) {
        var start = diag.start;
        var end = diag.start + diag.length;
        if (diag.length === 0) {
            var _a = services_1.adjustMarkerPos(start, end, (diag.file || file).text), start = _a.start, end = _a.end;
        }
        var quickFixes;
        if (markerType == services_1.MarkerType.TYPE_SCRIPT_PROBLEM) {
            quickFixes = host.getQuickFixes(file, diag);
        }
        return new services_1.FileMarker(markerType, start, end, (diag.file || file).getLineAndCharacterOfPosition(diag.start).line + 1, ts.flattenDiagnosticMessageText(diag.messageText, "\n"), services_1.MarkerPriority.PRIORITY_HIGH, convertSeverity(diag.category), diag.category + ":" + diag.code, quickFixes && quickFixes.length > 0 ? quickFixes : undefined);
        function convertSeverity(severity) {
            switch (severity) {
                case ts.DiagnosticCategory.Message: return services_1.MarkerSeverity.SEVERITY_INFO;
                case ts.DiagnosticCategory.Warning: return services_1.MarkerSeverity.SEVERITY_WARNING;
                case ts.DiagnosticCategory.Error: return services_1.MarkerSeverity.SEVERITY_ERROR;
            }
            return services_1.MarkerSeverity.SEVERITY_ERROR;
        }
    };
    LanguageEndpoint.prototype.createQuickFixes = function (projectName, quickFixRequests, formattingOptions) {
        var host = this.languageServiceHosts[projectName];
        if (!host) {
            return Promise.resolve(undefined);
        }
        return host.createQuickFixes(quickFixRequests, formattingOptions);
    };
    LanguageEndpoint.prototype.createDynamicQuickFixes = function (projectName, quickFixRequest, formattingOptions) {
        var host = this.languageServiceHosts[projectName];
        if (!host) {
            return Promise.resolve(undefined);
        }
        return host.createDynamicQuickFixes(quickFixRequest, formattingOptions);
    };
    LanguageEndpoint.prototype.validate = function (projectName, modifiedFiles, asYouType) {
        var host = this.languageServiceHosts[projectName];
        if (!host) {
            return Promise.resolve({});
        }
        var program = host.getProgram();
        var srcFiles = program
            .getSourceFiles()
            .filter(function (sourceFile) { return sourceFile.fileName.indexOf("/node_modules/") < 0; })
            .map(function (sourceFile) { return sourceFile.fileName; });
        var sourceFiles = new Set(srcFiles);
        if (modifiedFiles === null || modifiedFiles === undefined) {
            modifiedFiles = srcFiles;
        }
        var result = {};
        modifiedFiles = modifiedFiles.filter(function (file) {
            return file.indexOf("/node_modules/") < 0
                && file.startsWith("eclipse:")
                && !file.endsWith(".d.ts")
                && (file.endsWith(".ts") || file.endsWith(".tsx"));
        });
        var done = 0;
        var todoDescriptors = [
            { text: "TODO", priority: services_1.MarkerPriority.PRIORITY_LOW },
            { text: "FIXME", priority: services_1.MarkerPriority.PRIORITY_HIGH },
            { text: "XXX", priority: services_1.MarkerPriority.PRIORITY_HIGH }
        ];
        for (var _i = 0, modifiedFiles_1 = modifiedFiles; _i < modifiedFiles_1.length; _i++) {
            var file = modifiedFiles_1[_i];
            var fileInfo = result[file] = new services_1.FileMarkersInfo();
            fileInfo.markerTypes[services_1.MarkerType.TYPE_SCRIPT_PROBLEM] = false;
            fileInfo.markerTypes[services_1.MarkerType.TODO] = false;
            var fileErrors = fileInfo.markers;
            if (sourceFiles.has(file)) {
                progress_1.progressMonitor.subTask("validating TypeScript: "
                    + file.substring(file.indexOf("/"))
                    + " (" + Math.round(done++ * 100 / modifiedFiles.length) + "%)");
                var srcFile = program.getSourceFile(file);
                var diagnostics = program.getSyntacticDiagnostics(srcFile, null);
                if (!diagnostics || diagnostics.length == 0) {
                    diagnostics = program.getSemanticDiagnostics(srcFile, null) || [];
                    if (program.getCompilerOptions().declaration) {
                        var declarationDiagnostics = program.getDeclarationDiagnostics(srcFile, null);
                        diagnostics = concatenate(diagnostics, declarationDiagnostics);
                    }
                }
                var count = 0;
                for (var _a = 0, diagnostics_1 = diagnostics; _a < diagnostics_1.length; _a++) {
                    var diag = diagnostics_1[_a];
                    if (count++ > 100) {
                        break;
                    }
                    fileErrors.push(this.createMarker(host, srcFile, services_1.MarkerType.TYPE_SCRIPT_PROBLEM, diag));
                }
                var todos = getTodoComments(srcFile, todoDescriptors);
                for (var _b = 0, todos_1 = todos; _b < todos_1.length; _b++) {
                    var todo = todos_1[_b];
                    fileErrors.push(new services_1.FileMarker(services_1.MarkerType.TODO, todo.position, todo.position + todo.message.length, srcFile.getLineAndCharacterOfPosition(todo.position).line + 1, todo.message, todo.descriptor.priority, services_1.MarkerSeverity.SEVERITY_INFO));
                }
            }
        }
        return Promise.resolve(result);
        function getTodoComments(sourceFile, descriptors) {
            var fileContents = sourceFile.text;
            var result = [];
            if (descriptors.length > 0) {
                var regExp = getTodoCommentsRegExp();
                var matchArray = void 0;
                while (matchArray = regExp.exec(fileContents)) {
                    var firstDescriptorCaptureIndex = 3;
                    var preamble = matchArray[1];
                    var matchPosition = matchArray.index + preamble.length;
                    var token = ts.getTokenAtPosition(sourceFile, matchPosition);
                    if (!isInsideComment(sourceFile, token, matchPosition)) {
                        continue;
                    }
                    var descriptor = undefined;
                    for (var i = 0, n = descriptors.length; i < n; i++) {
                        if (matchArray[i + firstDescriptorCaptureIndex]) {
                            descriptor = descriptors[i];
                        }
                    }
                    if (isLetterOrDigit(fileContents.charCodeAt(matchPosition + descriptor.text.length))) {
                        continue;
                    }
                    var message = matchArray[2];
                    result.push({
                        descriptor: descriptor,
                        message: message,
                        position: matchPosition
                    });
                }
            }
            return result;
            function escapeRegExp(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }
            function isInsideComment(sourceFile, token, position) {
                return position <= token.getStart(sourceFile) &&
                    (isInsideCommentRange(ts.getTrailingCommentRanges(sourceFile.text, token.getFullStart())) ||
                        isInsideCommentRange(ts.getLeadingCommentRanges(sourceFile.text, token.getFullStart())));
                function isInsideCommentRange(comments) {
                    return ts.forEach(comments, function (comment) {
                        if (comment.pos < position && position < comment.end) {
                            return true;
                        }
                        else if (position === comment.end) {
                            var text = sourceFile.text;
                            var width = comment.end - comment.pos;
                            if (width <= 2 || text.charCodeAt(comment.pos + 1) === ts.CharacterCodes.slash) {
                                return true;
                            }
                            else {
                                return !(text.charCodeAt(comment.end - 1) === ts.CharacterCodes.slash &&
                                    text.charCodeAt(comment.end - 2) === ts.CharacterCodes.asterisk);
                            }
                        }
                        return false;
                    });
                }
            }
            function getTodoCommentsRegExp() {
                var singleLineCommentStart = /(?:\/\/+\s*)/.source;
                var multiLineCommentStart = /(?:\/\*+\s*)/.source;
                var anyNumberOfSpacesAndAsterisksAtStartOfLine = /(?:^(?:\s|\*)*)/.source;
                var preamble = "(" + anyNumberOfSpacesAndAsterisksAtStartOfLine + "|" + singleLineCommentStart + "|" + multiLineCommentStart + ")";
                var literals = "(?:" + ts.map(descriptors, function (d) { return "(" + escapeRegExp(d.text) + ")"; }).join("|") + ")";
                var endOfLineOrEndOfComment = /(?:$|\*\/)/.source;
                var messageRemainder = /(?:.*?)/.source;
                var messagePortion = "(" + literals + messageRemainder + ")";
                var regExpString = preamble + messagePortion + endOfLineOrEndOfComment;
                return new RegExp(regExpString, "gim");
            }
            function isLetterOrDigit(char) {
                var CharacterCodes = ts.CharacterCodes;
                return (char >= CharacterCodes.a && char <= CharacterCodes.z) ||
                    (char >= CharacterCodes.A && char <= CharacterCodes.Z) ||
                    (char >= CharacterCodes._0 && char <= CharacterCodes._9);
            }
        }
    };
    return LanguageEndpoint;
}());
exports.LanguageEndpoint = LanguageEndpoint;
function concatenate(array1, array2) {
    if (!array2 || !array2.length)
        return array1;
    if (!array1 || !array1.length)
        return array2;
    return array1.concat(array2);
}
function getProperty(mapOrObject, key) {
    if (typeof mapOrObject.get === "function") {
        return mapOrObject.get(key);
    }
    return mapOrObject[key];
}
exports.getProperty = getProperty;
function getCanonicalFileName(name) {
    return ts.sys.useCaseSensitiveFileNames ? name : name.toLowerCase();
}
exports.getCanonicalFileName = getCanonicalFileName;
