const mongoose = require("mongoose");
const { configs } = require("../configs");

const connectDB = async (fastify) => {
	let options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};

	const conn = await mongoose.connect(configs.MONGO_URI, options);

	fastify.log.info("Connected to MongoDB");
};

module.exports = {
	connectDB,
};
