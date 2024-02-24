import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationUseCase } from "../getStatementOperation/GetStatementOperationUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { CreateStatementError } from "../createStatement/CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get a statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "User test successful",
      email: "test@dev.com",
      password: "123",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Deposit",
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(result).toBeInstanceOf(Statement);
    expect(result).toEqual(statement);
  });

  it("Should not be able to get a statement operation if not found an user", async () => {
      const user = await createUserUseCase.execute({
        name: "User test failure",
        email: "failure@dev.com",
        password: "123",
      });

      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 10000,
        description: "Deposit",
      });

      await expect(getStatementOperationUseCase.execute(
        {
          user_id: "Incorrect user id",
          statement_id: statement.id,
        }
      )).rejects
        .toBeInstanceOf(
          GetStatementOperationError.GetStatementOperationUserNotFound
        );
  });

  it("Should not be able to get a statement operation if not found an statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "test@dev.com",
      password: "123",
    });
    await expect(getStatementOperationUseCase.execute(
      {
        user_id: user.id,
        statement_id: "Incorrect statement Id",
      }
    )).rejects
      .toBeInstanceOf(
        GetStatementOperationError.GetStatementOperationStatementNotFound
      );
  });
});
