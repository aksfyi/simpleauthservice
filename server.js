const { build } = require("./app");
const { configs } = require("./configs");
const { connectDB } = require("./models/connectDB");
const app = build({ logger: true });

connectDB();

app.listen(configs.PORT, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
