const { transcribe } = require('../../server/groq');

module.exports = transcribe;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
