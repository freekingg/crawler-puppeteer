import _axios, { get, put, _delete } from '@/lin/plugin/axios'

class Log {

  async createLog(data) {
    return _axios({
      method: 'post',
      url: 'v1/crawler/run/log',
      data,
    })
  }

  async getLog(id) {
    const res = await get(`v1/crawler/run/log/${id}`)
    return res
  }

  async editLog(id, info) {
    const res = await put(`v1/crawler/run/log/${id}`, info)
    return res
  }

  async deleteLog(id) {
    const res = await _delete(`v1/crawler/run/log/${id}`)
    return res
  }

  async getLogs(data) {
    return _axios({
      method: 'get',
      url: 'v1/crawler/run/log',
      data,
      handleError: true,
    })
  }
}

export default new Log()
