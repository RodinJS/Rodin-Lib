'use strict';

System.register(['rodin/core'], function (_export, _context) {
  "use strict";

  var RODIN;
  return {
    setters: [function (_rodinCore) {
      RODIN = _rodinCore;
    }],
    execute: function () {
      window.RODIN = RODIN;
    }
  };
});