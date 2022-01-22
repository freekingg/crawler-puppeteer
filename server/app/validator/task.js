import { LinValidator, Rule } from 'lin-mizar';

class TaskSearchValidator extends LinValidator {
  constructor () {
    super();
    this.q = new Rule('isOptional', '必须传入搜索关键字');
  }
}

class CreateOrUpdateTaskValidator extends LinValidator {
  constructor () {
    super();
    this.title = new Rule('isNotEmpty', '必须传入手机号');
  }
}

export { CreateOrUpdateTaskValidator, TaskSearchValidator };
