import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get statement operation", () => {
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

  it("Should be able to get statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@rentx.com.br",
      password: "123"
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10000,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseStatement.body;

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(10000);
  });

  it("Should be able to get statement operation if not found an user", async () => {
    const response = await request(app).get(`/api/v1/statements/123`);

    expect(response.status).toBe(401);
  });

  it("Should not be able to get statement operation without a valid statement id", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@rentx.com.br",
      password: "123"
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .get("/api/v1/statements/bd73a3be-60e4-4048-935d-abad1a782b44")
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
  });
});
