const app = require('./src/app');

const port = process.env.PORT || 4001;
app.listen(port, () => console.log('Gaming API server listening on', port));
