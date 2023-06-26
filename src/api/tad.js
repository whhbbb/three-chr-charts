import request from '@/utils/request'

export function hicResult(id, params) {
  return request({
    url: `/hic/cs_id1/${id}/cs_id2/${id}`,
    params
  })
}
