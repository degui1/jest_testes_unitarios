import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
        values('${id}', 'user test', 'user@rentx.com.br', '${password}', 'now()', 'now()')
      `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@rentx.com.br",
      password: "123"
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
  });

  it("Should not be able to get balance with not found an user", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toBe(401);
  });
});
