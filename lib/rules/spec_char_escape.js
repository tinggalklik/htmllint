module.exports = {
    name: 'spec-char-escape',
    description: [
        'Checks to make sure all HTML special characters in text are escaped.',
        '',
        ''
    ].join('')
};

var regex = {
    improper: /(&[^a-zA-Z0-9#;]*;)/gm, // checks for properly formed escapes with improper characters inside them
    brackets: /[<>]/gm, // checks for > and <
    spacing: /(?=[ ]+)/gm, // checks for multiple adjacent spaces
    unescaped: /(&[a-zA-Z0-9#]*[^a-zA-Z0-9#;])/gm // checks for not forming an escape sequence properly
}

function executeRegex(regex, text) {
    return regex.exec(text) || false;
}

module.exports.process = function (element, opts) {
    // if not enabled, get outta here!
    if (!opts[this.name]) {
        return [];
    }

    var issues = [],
        message = '';

    // if it's text - make sure it only has alphanumericals. If it has a &, a ; should follow.
    if (['text'].indexOf(element.type) > -1 && element.data.length > 0) {
        console.log(element);
        message = 'text contains improperly escaped characters: ';
        [regex.improper, regex.brackets, regex.spacing, regex.unescaped].forEach(function (currentRegex) {
            var match = executeRegex(currentRegex, element.data);
            while (match) {
                issues.push({
                    index: element.index + match.index,
                    line: element.lineCol[0],
                    column: element.lineCol[1],
                    msg: message + ((currentRegex === regex.spacing) ? "multiple adjacent spaces" : match[1])
                });
                match = executeRegex(regex, element.data);
            }
        })
    }

    if (element.attribs) {
        message = 'attribute value contains improperly escaped characters: ';
        var attributeNames = Object.keys(element.attribs)
        console.log(element.attribs);
        for (var index = 0; index < attributeNames.length; index++) {
            var text = element.attribs[attributeNames[index]];
            [regex.improper, regex.brackets, regex.unescaped].forEach(function (currentRegex) {
                var match = executeRegex(currentRegex, text);
                while (match) {
                    issues.push({
                        index: element.index + match.index,
                        line: element.lineCol[0],
                        column: element.lineCol[1],
                        msg: message + match[1]
                    });
                    match = executeRegex(regex, element.data);
                }
            })
        }
    }
    return issues;
};