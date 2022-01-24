import { LinValidator, Rule } from 'lin-mizar';
import { PaginateValidator } from './common';

class TaskSearchValidator extends PaginateValidator {
  constructor() {
    super();
    this.q = new Rule('isOptional', '必须传入搜索关键字');
  }
}

class CreateOrUpdateTaskValidator extends LinValidator {
  constructor() {
    super();
    this.title = new Rule('isNotEmpty', '必须传入手机号');
  }
}

export { CreateOrUpdateTaskValidator, TaskSearchValidator };
