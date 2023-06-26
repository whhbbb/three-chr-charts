import request from '@/utils/request'

export function compartmentResult(id, params) {
  return request({
    url: `/compartment/cs_id/${id}`,
    params
  })
}
