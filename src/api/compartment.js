import request from '@/utils/request'

export function compartmentResult(id) {
  return request({
    url: `/compartment/cs_id/${id}`
  })
}
