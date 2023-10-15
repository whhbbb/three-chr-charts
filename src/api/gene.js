import request from '@/utils/request'
import axios from 'axios'

export function geneResult(id, params) {
  return request({
    url: `/RNA/cs_id/${id}`,
    params
  })
}

export function downloadFile(cs_id, tissue_id, software_id, params) {
  return axios.get(`/compartment/file/cs_id/${cs_id}/tissue_id/${tissue_id}/software/${software_id}`, {
    baseURL: 'http://192.168.3.79:8082',
    timeout: 50000,
    responseType: 'blob',
    params,
    headers: {
      'Accept': 'application/octet-stream'
    }
  }).then(res => {
    console.log(res)
    const data = res.data
    return data
  }).catch(err => {
    console.log(err)
  })
}
