import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class StatementErrorUserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class StatementErrorInsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
