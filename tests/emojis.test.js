const assert = require('assert');
const emojis = require(`../emojis.json`);

describe("Emojis", () => {

    it("No duplicates", () => {

        const names = emojis.map(e => e.names).flat();
        for (let i = 0; i < names.length; ++i) {
            if (names.indexOf(names[i]) !== i) {
                assert.fail(`Duplicate name "${names[i]}".`);
            }
        }

        const surrogates = emojis.map(emoji => emoji.surrogates);
        for (let i = 0; i < surrogates.length; ++i) {
            if (surrogates.indexOf(surrogates[i]) !== i) {
                assert.fail(`Duplicate surrogate "${surrogates[i]}".`);
            }
        }

        const codepoints = emojis.map(emoji => emoji.codepoints);
        for (let i = 0; i < codepoints.length; ++i) {
            if (codepoints.indexOf(codepoints[i]) !== i) {
                assert.fail(`Duplicate codepoint "${codepoints[i]}".`);
            }
        }

        const imageUrls = emojis.map(emoji => emoji.imageUrl);
        for (let i = 0; i < imageUrls.length; ++i) {
            if (imageUrls.indexOf(imageUrls[i]) !== i) {
                assert.fail(`Duplicate imageUrl "${imageUrls[i]}".`);
            }
        }

    });

});