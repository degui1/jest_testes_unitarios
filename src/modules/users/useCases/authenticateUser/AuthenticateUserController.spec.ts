import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
        values('${id}', 'admin', 'admin@rentx.com.br', '${password}', 'now()', 'now()')
      `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
  });

  it("Should not be able to authenticate an user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@rentx.com.br",
      password: "123"
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate an user that does not exist", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "fake@gmai.com",
      password: "123"
    });

    expect(response.status).toBe(401);
  });
});
