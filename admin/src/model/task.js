import _axios, { get, put, _delete } from '@/lin/plugin/axios'

class Task {

  async createTask(data) {
    return _axios({
      method: 'post',
      url: 'v1/task',
      data,
    })
  }

  async authLogin(data) {
    return _axios({
      method: 'post',
      url: 'v1/task/auth/login',
      data,
    })
  }

  async starTirrigationTask(data) {
    return _axios({
      method: 'post',
      url: 'v1/task/start/task',
      data,
    })
  }

  async patchStarTirrigationTask(data) {
    return _axios({
      method: 'post',
      url: 'v1/task/start/task/patch',
      data,
    })
  }

  async reStarTirrigationTask(data) {
    return _axios({
      method: 'post',
      url: 'v1/task/start/retask',
      data,
    })
  }

  

  async stopTirrigationTask(data) {
    return _axios({
      method: 'post',
      url: 'v1/task/stop/task',
      data,
    })
  }

  async getTask(id) {
    const res = await get(`v1/task/${id}`)
    return res
  }

  async editTask(id, info) {
    const res = await put(`v1/task/${id}`, info)
    return res
  }

  async deleteTask(id) {
    const res = await _delete(`v1/task/${id}`)
    return res
  }

  async getTasks(data) {
    return _axios({
      method: 'get',
      url: 'v1/task',
      data,
      handleError: true,
    })
  }
}

export default new Task()
