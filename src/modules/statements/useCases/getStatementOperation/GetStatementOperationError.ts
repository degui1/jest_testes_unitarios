import { AppError } from "../../../../shared/errors/AppError";

export namespace GetStatementOperationError {
  export class GetStatementOperationUserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class GetStatementOperationStatementNotFound extends AppError {
    constructor() {
      super('Statement not found', 404);
    }
  }
}
