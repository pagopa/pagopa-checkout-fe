const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;


app.use(cors({
  origin: "http://localhost:1234",
  credentials: true,
}));

app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method === "POST" && req.path.startsWith("/mock-mixpanel")) {
    console.log("Evento ricevuto da Mixpanel mock:");
    console.log("Path:", req.path);
    console.log("Body:", req.body);

    res.status(200).json({ status: "ok", received: true });
  } else {
    next();
  }
});

app.get("/", (_, res) => {
  res.send("Mock Mixpanel server avviato");
});

app.listen(PORT, () => {
  console.log(`Mock Mixpanel  in ascolto su http://localhost:${PORT}`);
});
