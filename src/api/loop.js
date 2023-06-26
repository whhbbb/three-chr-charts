import request from '@/utils/request'

export function loopResult(id, params) {
  return request({
    url: `/loop/cs_id/${id}`,
    params
  })
}

export function doubleLoopResult(id, params) {
  return request({
    url: `/loop/DoubleRange/cs_id/${id}`,
    params
  })
}
