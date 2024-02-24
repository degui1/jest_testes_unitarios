import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to create a deposit statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "dev@email.com",
      password: "123",
    });

    const statement = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Deposit"
    };

    const result = await createStatementUseCase.execute(statement);

    expect(result).toBeInstanceOf(Statement);
    expect(result.amount).toEqual(statement.amount);
    expect(result).toHaveProperty("id");
  });

  it("Should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "dev@email.com",
      password: "123",
    });

    const deposit = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Deposit"
    };

    await createStatementUseCase.execute(deposit);

    const withdraw = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 3000,
      description: "Withdraw"
    };

    const result = await createStatementUseCase.execute(withdraw);

    expect(result).toBeInstanceOf(Statement);
    expect(result.amount).toBe(withdraw.amount);
    expect(result).toHaveProperty("id");
  });

  it("Should not be able to create a statement if not found a user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "incorrect id",
        type: OperationType.DEPOSIT,
        amount: 10000,
        description: "Deposit"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.StatementErrorUserNotFound);
  });

  it("Should not be able to withdraw with user does not have sufficient funds", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Withdraw test",
        email: "withdraw@dev.com",
        password: "123",
      });
      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 10000,
        description: "Withdraw"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.StatementErrorInsufficientFunds);
  });
});
