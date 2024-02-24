import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it("Should be able to get balance", async () => {
    const user = await createUserUseCase.execute({
      name: "Balance test",
      email: "balance@test.com",
      password: "123",
    });

    const statement1 = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Deposit",
    });

    const statement2 = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Deposit",
    });

    const statement3 = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 5000,
      description: "Deposit",
    });

    const result = await getBalanceUseCase.execute({ user_id: user.id });

    expect(result.statement).toEqual(expect.arrayContaining([statement1, statement2, statement3]));
    expect(result.balance).toBe(statement1.amount + statement2.amount - statement3.amount);
  });

  it("Should not be able to get balance if not found an user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "Incorrect user id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
