import { characterRouter } from "./routes/character.Route";
import { placeRouter } from "./routes/place.Route";
import { removeRouter } from "./routes/remove.Route";
import { vehicleRouter } from "./routes/vehicle.Route";

const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("../public"));

app.use("/character", characterRouter);
app.use("/vehicle", vehicleRouter);
app.use("/remove", removeRouter);
app.use("/place", placeRouter);

export default app;
