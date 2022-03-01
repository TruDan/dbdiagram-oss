ace.define("ace/mode/dbml_highlight_rules", ["require", "exports", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports) {

  var oop = require("../lib/oop");
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

  var DBMLHighlightRules = function () {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    var keywordMapper = this.createKeywordMapper({
      keyword: "table|ref|enum|indexes|tablegroup|note|project",
      "support.function": "by|bool|boolean|bit|blob|decimal|double|float|long|" +
        "longblob|longtext|medium|mediumblob|mediumint|mediumtext|timestamp|" +
        "tinyblob|tinyint|tinytext|text|bigint|int|int1|int2|int3|int4|int8|" +
        "integer|float|float4|float8|double|char|varbinary|varchar|varcharacter|" +
        "precision|date|datetime|year|unsigned|signed|numeric|ucase|lcase|mid|" +
        "len|round|rank|now|format|coalesce|ifnull|isnull|nvl"
    }, "identifier", true);

    this.$rules = {
      start: [
        {
          token: "comment",
          regex: "\\/\\/.*$"
        },
        {
          token: keywordMapper,
          regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        },
        {
          token: "keyword.operator",
          regex: "<|>|\\-"
        },
        {
          token: "paren.lparen",
          regex: "[\\{]"
        },
        {
          token: "paren.rparen",
          regex: "[\\}]"
        },
        {
          token: ["text", "support.function"],
          regex: /(^\s*[a-zA-Z0-9_-]+[ ]+)(\w+)/
        }
      ]
    };
  };

  DBMLHighlightRules.metaData = {
    name: "DBML"
  };

  oop.inherits(DBMLHighlightRules, TextHighlightRules);
  exports.DBMLHighlightRules = DBMLHighlightRules;
});

ace.define("ace/mode/dbml", ["require", "exports", "ace/lib/oop", "ace/mode/text", "ace/mode/dbml_highlighting_rules"], function (require, exports) {
  var oop = require("../lib/oop");
  var TextMode = require("./text").Mode;
  var DBMLHighlightRules = require("./dbml_highlight_rules").DBMLHighlightRules;

  Mode = function () {
    this.HighlightRules = DBMLHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
  };
  oop.inherits(Mode, TextMode);

  (function () {
    this.lineCommentStart = "//";
    this.$id = "ace/mode/dbml";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});
// (function () {
//   ace.require(["ace/mode/dbml"], function (m) {
//     if (typeof module == "object" && typeof exports == "object" && module) {
//       module.exports = m;
//     }
//   });
// })();
//
