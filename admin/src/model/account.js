import _axios, { get, put, _delete } from '@/lin/plugin/axios'

class Account {

  async createAccount(data) {
    return _axios({
      method: 'post',
      url: 'v1/account',
      data,
    })
  }

  async getAccount(id) {
    const res = await get(`v1/account/${id}`)
    return res
  }

  async editAccount(id, info) {
    const res = await put(`v1/account/${id}`, info)
    return res
  }

  async deleteAccount(id) {
    const res = await _delete(`v1/account/${id}`)
    return res
  }

  async getAccounts(data) {
    return _axios({
      method: 'get',
      url: 'v1/account',
      data,
      handleError: true,
    })
  }
  async authLogin(data) {
    return _axios({
      method: 'get',
      url: 'v1/account/auth/login',
      data,
      handleError: true,
    })
  }
  async getLoginQr(data) {
    return _axios({
      method: 'get',
      url: 'v1/account/auth/loginQr',
      data,
      handleError: true,
    })
  }
}

export default new Account()
