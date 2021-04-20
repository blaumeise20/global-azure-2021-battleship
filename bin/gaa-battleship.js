#!/usr/bin/env node

switch (process.argv[2].toLowerCase()) {
    case "start":
        require("../scripts/start");
        break;
    case "test":
        require("../scripts/test");
        break;
}
