import { LinValidator, Rule } from 'lin-mizar';

class AccountSearchValidator extends LinValidator {
  constructor () {
    super();
    this.q = new Rule('isOptional', '必须传入搜索关键字');
  }
}

class CreateOrUpdateAccountValidator extends LinValidator {
  constructor () {
    super();
    this.phone = new Rule('isNotEmpty', '必须传入手机号');
  }
}

export { CreateOrUpdateAccountValidator, AccountSearchValidator };
