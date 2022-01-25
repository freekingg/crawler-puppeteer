import _axios, { get, put, _delete } from '@/lin/plugin/axios'

class Data {

  async createData(data) {
    return _axios({
      method: 'post',
      url: 'v1/crawler/task/data',
      data,
    })
  }

  async getData(id) {
    const res = await get(`v1/crawler/task/data/${id}`)
    return res
  }

  async editData(id, info) {
    const res = await put(`v1/crawler/task/data/${id}`, info)
    return res
  }

  async deleteData(id) {
    const res = await _delete(`v1/crawler/task/data/${id}`)
    return res
  }

  async getDatas(data) {
    return _axios({
      method: 'get',
      url: 'v1/crawler/task/data',
      data,
      handleError: true,
    })
  }
}

export default new Data()
