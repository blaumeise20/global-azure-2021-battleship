const express = require("express");
const concat = require("concat-stream");
const { getReady, getShots } = require("./_service");

const app = express();

app.use(function (req, res, next) {
    req.pipe(concat(function (data) {
        req.body = data;
        next();
    }));
});

app.get("/getReady", (req, res) => {
    getReady(req.params.numberOfGames, () => res.status(200).send(""), () => res.status(404).send(""));
});

app.post("/getShots", (req, res) => {
    getShots(JSON.parse(req.body), results => res.status(200).send(JSON.stringify(results)), () => res.status(404).send(""));
});

app.post("/finished", (req, res) => {
    res.status(200).send("");
});

// fallback SHOULDN'T EXECUTE
app.get("*", (req, res) => {
    console.log(`BAD BAD SHOULDN'T GET LOGGED! Request url: ${req.path}`);
    res.status(404).send("xD");
});

app.listen(Number(process.argv[4]) || Number(process.env.PORT) || 8012);
