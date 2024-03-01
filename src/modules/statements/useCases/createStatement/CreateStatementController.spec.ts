import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create statement", () => {
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

  it("Should be able to create a new deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@rentx.com.br",
      password: "123",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10000,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should be able to create a new withdraw statement", async () => {
    const user = {
      name: "User test withdraw",
      email: "withdraw@gmail.com",
      password: "123",
    };

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10000,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5000,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("amount");
    expect(response.body.amount).toBe(5000);
  });

  it("Should not be able to create a statement with not found an user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10000,
        description: "Should not be able to create a new statement",
      });

    expect(response.status).toBe(401);
  });

  it("Should not be able to create a new withdraw statement with insufficient funds", async () => {
    const user = {
      name: "Insufficient funds",
      email: "funds@email.com",
      password: "123",
    };

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password,
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10000,
        description: "Insufficient funds",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
