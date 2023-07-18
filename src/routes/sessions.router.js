import { Router } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";

const sessions = Router();

sessions.use(session({
	store: MongoStore.create({
		mongoUrl: "mongodb+srv://bracoagustin:J2P8TJF36AjvHMhI@cluster1.bysdr0i.mongodb.net/?retryWrites=true&w=majority",
		ttl: 15,
	}),
	secret: "CoderS3cR3tC0D3",
	resave: false,
	saveUninitialized: true,
}));

function auth(req, res, next) {
	if (req.session?.user === "User" && req.session?.admin) {
		return next();
	};

	return res.status(401).send("Only admins can see this site");
};

sessions.get("/", (req, res) => {
	try {
		if (!req.session.counter) {
			req.session.counter = 1;
			return res.status(200).send(`It's your first time`);
		};

		req.session.counter++;
		return res.status(200).send(`You visit ${req.session.counter} times this site`);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

sessions.get("/login", (req, res) => {
	try {
		const { user, password } = req.query;
		if (user !== "User" || password !== "Pass") {
			return res.status(500).send(`Wrong credentials`);
		};
		req.session.user = user;
		req.session.admin = true;

		return res.status(200).send(`Welcome`);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

sessions.get("/private", auth, (req, res) => {
	try {
		return res.status(200).send(`If you see this, you are admin`);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

sessions.get("/logout", (req, res) => {
	try {
		req.session.destroy((err) => {
			if (!err) {
				return res.status(200).send(`Logout done`);
			};

			return res.status(500).send({ status: `Logout error`, payload: err });
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

export default sessions;