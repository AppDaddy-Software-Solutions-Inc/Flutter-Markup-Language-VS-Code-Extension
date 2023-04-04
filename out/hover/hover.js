"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHover = void 0;
const vscode = require("vscode");
function initHover() {
    vscode.languages.registerHoverProvider('xml', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            if (range === undefined || word === undefined || range === null || word === null || word === '' || !(typeof word === 'string')) {
                return;
            }
            else {
                return {
                    contents: [`${document.languageId} (fml) Hovering: ${word}`]
                };
            }
        }
    });
}
exports.initHover = initHover;
//# sourceMappingURL=hover.js.map