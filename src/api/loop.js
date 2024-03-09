import request from '@/utils/request'

export function loopResult(cs_id, tissue_id, software_id, params) {
  return request({
    url: `/loop/cs_id/${cs_id}/tissue/${tissue_id}/software/${software_id}`,
    params
  })
}

export function doubleLoopResult(cs_id, tissue_id, software_id, params) {
  return request({
    url: `/loop/DoubleRange/cs_id/${cs_id}/tissue/${tissue_id}/software/${software_id}`,
    params
  })
}
