import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate an user", async () => {
    const user = {
      name: "User test",
      email: "email@test.com",
      password: "123",
    };

    await createUserUseCase.execute(user);
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate an user using incorrect password", () => {
    expect(async () => {
      const user = {
        name: "User incorrect password",
        email: "password@incorrect.com",
        password: "123",
      };

      await createUserUseCase.execute(user);
      const result = await authenticateUserUseCase.execute({
        email: user.email,
        password: "321",
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate an user using incorrect email", () => {
    expect(async () => {
      const user = {
        name: "User incorrect email",
        email: "email@incorrect.com",
        password: "123",
      };

      await createUserUseCase.execute(user);
      const result = await authenticateUserUseCase.execute({
        email: "email@test.com",
        password: user.password,
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
