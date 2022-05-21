const MongoClient = require("mongodb").MongoClient;
const User = require("./user")

describe("User Account Management", () => {
	let client;
	beforeAll(async () => {
		client = await MongoClient.connect(
			"mongodb+srv://m001-student:p4ssw-rd@sandbox.epk5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", //"my-mongodb+srv-connection-string",
			{ useNewUrlParser: true },
		);
		User.injectDB(client);
	})

	afterAll(async () => {
		await User.delete("test");
		await client.close();
	})

	test("New user registration", async () => {
		const res = await User.register("test", "password", "+010-1234-5678");
		expect(res.insertedId).not.toBeUndefined();
	})

	test("Duplicate username", async () => {
		const res = await User.register("test", "password")
		expect(res).toEqual({ "status": "duplicate username" })
	})

	test("User login invalid username", async () => {
		const res = await User.login("test-fail", "password")
		expect(res).toEqual({ "status": "invalid username" })
	})

	test("User login invalid password", async () => {
		const res = await User.login("test", "password-fail")
		expect(res).toEqual({ "status": "invalid password" })
	})

	test("User login successfully", async () => {
		const res = await User.login("test", "password")
		expect(res).toEqual(
			expect.objectContaining({
				username: expect.any(String),
				password: expect.any(String),
				phone: expect.any(String),
			})
		);
	})
});