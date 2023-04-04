import * as vscode from 'vscode';

export function initHover() {
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

