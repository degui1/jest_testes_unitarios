import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", ()=> {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("Should be able to show user profile", async () => {
    const user = {
      name: "User test",
      email: "test@dev.com",
      password: "123",
    };

    const response = await createUserUseCase.execute(user);
    const profile = await showUserProfileUseCase.execute(response.id);

    expect(profile).toBeInstanceOf(User);
  });

  it("Should not be able to show user profile that was not found", () => {
    expect(async () => {
      await showUserProfileUseCase.execute('incorrect users id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
