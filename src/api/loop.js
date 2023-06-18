import request from '@/utils/request'

export function loopResult(id) {
  return request({
    url: `/compartment/cs_id/${id}`
  })
}
