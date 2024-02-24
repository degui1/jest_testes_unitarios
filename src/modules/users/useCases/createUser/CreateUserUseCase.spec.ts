import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Guilherme Goncalves",
      email: "dev@ignite.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new user using same email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Error",
        email: "dev@sameemail.com",
        password: "1234",
      });
      await createUserUseCase.execute({
        name: "User Error",
        email: "dev@sameemail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
