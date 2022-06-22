const request = require("supertest");
const app = require("../src/app");

test("Should signup a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Vova",
      email: "vova@example.com",
      password: "MyPass01234!",
    })
    .expect(201);
});
