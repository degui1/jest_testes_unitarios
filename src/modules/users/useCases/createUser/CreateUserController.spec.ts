import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create an user", async () => {
    const user = {
      name: "User test",
      email: "test@email.com",
      password: "123"
    };

    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
  });

  it("Should not be able to create an user that already exists", async () => {
    const user = {
      name: "User test",
      email: "test@email.com",
      password: "123"
    };

    await request(app).post("/api/v1/users").send(user);
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(400);
  });
});
