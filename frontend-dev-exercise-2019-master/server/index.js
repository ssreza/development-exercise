const express = require("express");
const path = require("path");
const DIST_DIR = path.resolve(__dirname, "../public"); // NEW
const HTML_FILE = path.join(DIST_DIR, 'index.html'); 
const port = process.env.PORT || 3000;
const app = express();
app.use(express.static(DIST_DIR)); // NEW
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE); // EDIT
   });


 app.listen(port, () => console.log(`Server listening on port ${port}!`));


if (module.hot) {
    module.hot.accept();
    // Next callback is essential: After code changes were accepted     we need to restart the app. server.close() is here Express.JS-specific and can differ in other frameworks. The idea is that you should shut down your app here. Data/state saving between shutdown and new start is possible
    module.hot.dispose(() => server.close());
}